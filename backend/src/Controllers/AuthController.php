<?php
declare(strict_types=1);

final class AuthController {

  public static function uploadAvatar(PDO $pdo, array $config, array $auth): void
  {
    $userId = $auth['id'] ?? $auth['user_id'] ?? null;
    if (!$userId) {
      Http::badRequest(['error' => 'Missing user id in token']);
      return;
    }

    if (!isset($_FILES['avatar'])) {
      Http::badRequest(['error' => 'No file uploaded. Field name must be "avatar".']);
      return;
    }

    $f = $_FILES['avatar'];

    if (($f['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
      Http::badRequest(['error' => 'Upload failed']);
      return;
    }

    $tmp = $f['tmp_name'] ?? '';
    if (!$tmp || !is_uploaded_file($tmp)) {
      Http::badRequest(['error' => 'Invalid upload']);
      return;
    }

    $maxBytes = 2 * 1024 * 1024;
    $size = (int)($f['size'] ?? 0);
    if ($size <= 0 || $size > $maxBytes) {
      Http::badRequest(['error' => 'Image must be under 2MB']);
      return;
    }

    $mime = '';
    if (function_exists('finfo_open')) {
      $fi = finfo_open(FILEINFO_MIME_TYPE);
      if ($fi) {
        $mime = (string)finfo_file($fi, $tmp);
        finfo_close($fi);
      }
    }

    $allowed = [
      'image/jpeg' => 'jpg',
      'image/png' => 'png',
      'image/webp' => 'webp'
    ];

    if (!isset($allowed[$mime])) {
      Http::badRequest(['error' => 'Only JPG, PNG, or WEBP allowed']);
      return;
    }

    $ext = $allowed[$mime];

    $publicDir = __DIR__ . '/../../public';
    $dir = $publicDir . '/uploads/avatars';

    if (!is_dir($dir)) {
      @mkdir($dir, 0777, true);
    }

    $filename = 'user-' . $userId . '.' . $ext;
    $dest = $dir . '/' . $filename;

    if (!move_uploaded_file($tmp, $dest)) {
      Http::serverError(['error' => 'Failed to save file']);
      return;
    }

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $basePath = rtrim($config['basePath'] ?? '', '/');
    $avatarUrl = $scheme . '://' . $host . $basePath . '/uploads/avatars/' . $filename;

    // optional DB save (ignore if column doesn't exist)
    try {
      $stmt = $pdo->prepare("UPDATE users SET avatar_url = :url WHERE id = :id");
      $stmt->execute([':url' => $avatarUrl, ':id' => $userId]);
    } catch (Throwable $e) {
      // ignore
    }

    $auth['avatarUrl'] = $avatarUrl;
    Http::ok(['user' => $auth]);
  }

  private static function hasForbidden(string $v): bool {
    return preg_match("/['\";<>]|--/", $v) === 1;
  }

  private static function ensureNoForbidden(string $field, string $value): void {
    if (self::hasForbidden($value)) {
      Http::error($field . ' contains forbidden characters', 422);
    }
  }

  private static function ensureEmailDomain(string $email, string $domain): void {
    $emailLower = strtolower($email);
    $domainLower = strtolower($domain);
    if (!str_ends_with($emailLower, $domainLower)) {
      Http::error("Only {$domain} emails are allowed", 422);
    }
  }

  private static function ensureValidName(string $name, string $label = 'Name'): void {
    if (mb_strlen($name) > 50) Http::error($label . ' must be 50 characters or less', 422);
    if (!preg_match('/^[A-Za-z][A-Za-z\s.-]*$/', $name)) {
      Http::error($label . ' must contain letters only (allowed: spaces, dot, hyphen)', 422);
    }
    self::ensureNoForbidden($label, $name);
  }

  private static function titleCaseName(string $s): string {
    $str = trim($s);
    if ($str === '') return '';

    $str = preg_replace('/\s+/', ' ', $str) ?? $str;
    $str = mb_strtolower($str, 'UTF-8');
    $parts = explode(' ', $str);

    $out = [];
    foreach ($parts as $w) {
      if ($w === '') continue;
      $first = mb_substr($w, 0, 1, 'UTF-8');
      $rest = mb_substr($w, 1, null, 'UTF-8');
      $out[] = mb_strtoupper($first, 'UTF-8') . $rest;
    }
    return implode(' ', $out);
  }

  private static function sendAuthEmail(array $config, string $email, string $name, string $subject, string $html, string $text): void {
    $appScript = $config['app_script_mail'] ?? [];
    $appScriptUrl = trim((string)($appScript['url'] ?? ''));

    if ($appScriptUrl !== '') {
      Mailer::send($appScript, $email, $name, $subject, $html, $text);
      return;
    }

    $emailService = new EmailService($config);
    if (!$emailService->send($email, $subject, $html, true)) {
      throw new RuntimeException('SMTP email send failed. Please check the mailer configuration.');
    }
  }

  private static function ensureRegistrationOtpTable(PDO $pdo): void {
    $pdo->exec("
      CREATE TABLE IF NOT EXISTS registration_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(190) NOT NULL,
        student_number VARCHAR(50) NOT NULL,
        payload_json TEXT NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_registration_otps_email (email),
        INDEX idx_registration_otps_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
  }

  private static function ensurePasswordResetsTable(PDO $pdo): void {
    $pdo->exec("
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        email VARCHAR(190) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_password_resets_user_id (user_id),
        INDEX idx_password_resets_email (email),
        INDEX idx_password_resets_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $pdo->exec("ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS user_id INT NULL AFTER id");
  }

  private static function ensureUserNameColumns(PDO $pdo): void {
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(60) NULL AFTER id");
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(60) NULL AFTER first_name");
  }

  private static function registrationPayloadFromBody(array $b): array {
    $firstNameRaw = trim((string)($b['first_name'] ?? ''));
    $lastNameRaw = trim((string)($b['last_name'] ?? ''));
    $nameRaw = trim((string)($b['name'] ?? ''));
    $email = trim((string)($b['email'] ?? ''));
    $password = (string)($b['password'] ?? '');
    $studentNumber = trim((string)($b['student_number'] ?? ''));
    $department = trim((string)($b['department'] ?? ''));

    if (($firstNameRaw === '' || $lastNameRaw === '') && $nameRaw !== '') {
      $parts = preg_split('/\s+/', $nameRaw, 2);
      $firstNameRaw = trim((string)($parts[0] ?? ''));
      $lastNameRaw = trim((string)($parts[1] ?? ''));
    }

    if ($firstNameRaw === '' || $lastNameRaw === '' || $email === '' || $password === '') {
      Http::error('first_name, last_name, email, password required', 422);
    }

    self::ensureValidName($firstNameRaw, 'First name');
    self::ensureValidName($lastNameRaw, 'Last name');
    $firstName = self::titleCaseName($firstNameRaw);
    $lastName = self::titleCaseName($lastNameRaw);
    $name = trim($firstName . ' ' . $lastName);

    self::ensureNoForbidden('Email', $email);
    self::ensureNoForbidden('Student number', $studentNumber);
    self::ensureNoForbidden('Department', $department);

    self::ensureEmailDomain($email, '@cvsu.edu.ph');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) Http::error('Invalid email', 422);
    if ($studentNumber === '') Http::error('student_number is required', 422);
    if ($department === '') Http::error('department is required', 422);

    if (strlen($password) < 8) Http::error('Password must be at least 8 characters', 422);
    self::ensureNoForbidden('Password', $password);

    return [
      'first_name' => $firstName,
      'last_name' => $lastName,
      'name' => $name,
      'email' => $email,
      'password' => $password,
      'student_number' => $studentNumber,
      'department' => $department,
    ];
  }

  private static function ensureStudentCanRegister(PDO $pdo, string $email, string $studentNumber): ?array {
    $stmtExisting = $pdo->prepare("
      SELECT id, email, student_number, role, status
      FROM users
      WHERE email = ? OR student_number = ?
      ORDER BY (email = ?) DESC
      LIMIT 1
    ");
    $stmtExisting->execute([$email, $studentNumber, $email]);
    $existing = $stmtExisting->fetch();

    if (!$existing) return null;

    if ((string)$existing['role'] === 'student' && (string)$existing['status'] === 'disabled') {
      return $existing;
    }

    Http::error('Email or student number already exists', 409);
  }

  public static function login(PDO $pdo, array $config): void {
    $body = Http::readJsonBody();
    $email = trim((string)($body['email'] ?? ''));
    $password = (string)($body['password'] ?? '');

    if ($email === '' || $password === '') {
      ActivityLogger::log($pdo, [
        'actor_user_id' => null,
        'action' => 'auth.login_failed',
        'entity_type' => 'user',
        'entity_id' => null,
        'details' => [
          'reason' => 'missing_fields',
          'email' => $email,
        ],
      ]);
      Http::error('Email and password are required', 422);
    }

    self::ensureNoForbidden('Email', $email);
    self::ensureNoForbidden('Password', $password);

    // ✅ Settings
    $MAX_ATTEMPTS = 5;
    $LOCK_MINUTES = 10;

    // ✅ Check lock first (per email)
    try {
      $stmtLA = $pdo->prepare("
        SELECT attempts, locked_until
        FROM login_attempts
        WHERE email = ?
        LIMIT 1
      ");
      $stmtLA->execute([$email]);
      $la = $stmtLA->fetch();

      if ($la && !empty($la['locked_until'])) {
        $lockedUntil = (string)$la['locked_until'];
        if (strtotime($lockedUntil) > time()) {
          $secondsLeft = strtotime($lockedUntil) - time();
          $minutesLeft = (int)ceil($secondsLeft / 60);

          ActivityLogger::log($pdo, [
            'actor_user_id' => null,
            'action' => 'auth.login_blocked',
            'entity_type' => 'user',
            'entity_id' => null,
            'details' => [
              'reason' => 'too_many_attempts',
              'email' => $email,
              'locked_until' => $lockedUntil,
            ],
          ]);

          Http::error("Too many login attempts. Try again in about {$minutesLeft} minute(s).", 429, [
            'locked_until' => $lockedUntil,
            'minutes_left' => $minutesLeft
          ]);
        }
      }
    } catch (Throwable $e) {
      // if limiter table missing, ignore
    }

    // normal auth
    $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    $valid = ($user && password_verify($password, (string)$user['password_hash']));

    if (!$valid) {
      // ✅ record failed attempt (per email)
      try {
        $now = (new DateTimeImmutable())->format('Y-m-d H:i:s');

        // NOTE: ip value is optional now; keep it for debugging only
        $ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');

        $pdo->prepare("
          INSERT INTO login_attempts (email, ip, attempts, locked_until, last_attempt_at)
          VALUES (?,?,?,?,?)
          ON DUPLICATE KEY UPDATE
            attempts = attempts + 1,
            ip = VALUES(ip),
            last_attempt_at = VALUES(last_attempt_at),
            updated_at = CURRENT_TIMESTAMP
        ")->execute([$email, $ip, 1, null, $now]);

        $stmt2 = $pdo->prepare("SELECT attempts FROM login_attempts WHERE email = ? LIMIT 1");
        $stmt2->execute([$email]);
        $attempts = (int)($stmt2->fetch()['attempts'] ?? 0);

        if ($attempts >= $MAX_ATTEMPTS) {
          $lockedUntil = (new DateTimeImmutable("+{$LOCK_MINUTES} minutes"))->format('Y-m-d H:i:s');
          $pdo->prepare("
            UPDATE login_attempts
            SET locked_until = ?
            WHERE email = ?
          ")->execute([$lockedUntil, $email]);
        }
      } catch (Throwable $e) {
        // ignore limiter errors
      }

      ActivityLogger::log($pdo, [
        'actor_user_id' => $user ? (int)$user['id'] : null,
        'action' => 'auth.login_failed',
        'entity_type' => 'user',
        'entity_id' => $user ? (int)$user['id'] : null,
        'details' => [
          'reason' => 'invalid_credentials',
          'email' => $email,
        ],
      ]);

      Http::error('Invalid credentials', 401);
    }

    $status = (string)($user['status'] ?? 'approved');
    if ($status !== 'approved') {
      ActivityLogger::log($pdo, [
        'actor_user_id' => (int)$user['id'],
        'action' => 'auth.login_failed',
        'entity_type' => 'user',
        'entity_id' => (int)$user['id'],
        'details' => [
          'reason' => 'not_approved',
          'email' => (string)$user['email'],
          'status' => $status,
        ],
      ]);
      Http::error('Account is not active. Please contact the library administrator.', 403);
    }

    // ✅ success -> reset attempts for this email
    try {
      $pdo->prepare("DELETE FROM login_attempts WHERE email = ?")->execute([$email]);
    } catch (Throwable $e) {
      // ignore
    }

    $now = time();
    $payload = [
      'iss' => $config['jwt']['issuer'],
      'aud' => $config['jwt']['audience'],
      'iat' => $now,
      'exp' => $now + (int)$config['jwt']['expires_in_seconds'],
      'user_id' => (int)$user['id'],
      'name' => (string)$user['name'],
      'email' => (string)$user['email'],
      'role' => (string)$user['role'],
    ];

    $token = Jwt::sign($payload, $config['jwt']['secret']);

    ActivityLogger::log($pdo, [
      'actor_user_id' => (int)$user['id'],
      'action' => 'auth.login_success',
      'entity_type' => 'user',
      'entity_id' => (int)$user['id'],
      'details' => [
        'email' => (string)$user['email'],
        'role' => (string)$user['role'],
      ],
    ]);

    Http::ok([
      'token' => $token,
      'user' => [
        'id' => (int)$user['id'],
        'name' => (string)$user['name'],
        'email' => (string)$user['email'],
        'role' => (string)$user['role'],
      ],
    ]);
  }

  public static function requestRegistrationOtp(PDO $pdo, array $config): void {
    $b = Http::readJsonBody();
    $payload = self::registrationPayloadFromBody($b);
    self::ensureUserNameColumns($pdo);
    self::ensureStudentCanRegister($pdo, $payload['email'], $payload['student_number']);
    self::ensureRegistrationOtpTable($pdo);
    $payload['password_hash'] = password_hash((string)$payload['password'], PASSWORD_DEFAULT);
    unset($payload['password']);

    $otp = (string)random_int(100000, 999999);
    $expiresAt = (new DateTimeImmutable('+5 minutes'))->format('Y-m-d H:i:s');

    $pdo->prepare("DELETE FROM registration_otps WHERE email = ? OR student_number = ?")
      ->execute([$payload['email'], $payload['student_number']]);

    $pdo->prepare("
      INSERT INTO registration_otps (email, student_number, payload_json, otp_hash, expires_at)
      VALUES (?,?,?,?,?)
    ")->execute([
      $payload['email'],
      $payload['student_number'],
      json_encode($payload, JSON_UNESCAPED_SLASHES),
      password_hash($otp, PASSWORD_DEFAULT),
      $expiresAt,
    ]);

    $subject = 'Complete your CVSU Library registration';
    $html = '
      <div style="font-family:Arial,sans-serif; line-height:1.6">
        <h2>Registration Verification</h2>
        <p>Use this authentication code to complete your CVSU Imus Library account registration:</p>
        <p style="font-size:28px; font-weight:bold; letter-spacing:4px;">' . htmlspecialchars($otp, ENT_QUOTES, 'UTF-8') . '</p>
        <p>This code will expire in <b>5 minutes</b>.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    ';
    $text = "Your CVSU Library registration authentication code is {$otp}. It expires in 5 minutes.";

    try {
      self::sendAuthEmail($config, $payload['email'], (string)$payload['name'], $subject, $html, $text);
    } catch (Throwable $e) {
      $pdo->prepare("DELETE FROM registration_otps WHERE email = ? OR student_number = ?")
        ->execute([$payload['email'], $payload['student_number']]);
      error_log('Registration OTP email error: ' . $e->getMessage());
      Http::error('Failed to send authentication code. Please check the mailer configuration.', 500);
    }

    Http::ok([
      'message' => 'OTP sent. Please check your CVSU email.',
      'email' => $payload['email'],
      'expires_at' => $expiresAt,
    ]);
  }

  public static function registerStudent(PDO $pdo, array $config): void {
    $b = Http::readJsonBody();
    $email = trim((string)($b['email'] ?? ''));
    $otp = preg_replace('/\D+/', '', (string)($b['otp'] ?? '')) ?? '';

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) Http::error('Valid email required', 422);
    if ($otp === '') Http::error('OTP is required', 422);

    self::ensureNoForbidden('Email', $email);
    self::ensureEmailDomain($email, '@cvsu.edu.ph');
    self::ensureRegistrationOtpTable($pdo);
    self::ensureUserNameColumns($pdo);

    $stmtOtp = $pdo->prepare("
      SELECT id, email, student_number, payload_json, otp_hash, expires_at
      FROM registration_otps
      WHERE email = ?
      ORDER BY id DESC
      LIMIT 1
    ");
    $stmtOtp->execute([$email]);
    $row = $stmtOtp->fetch();

    if (!$row) Http::error('Please request an OTP first.', 400);
    if (strtotime((string)$row['expires_at']) < time()) {
      $pdo->prepare("DELETE FROM registration_otps WHERE id = ?")->execute([(int)$row['id']]);
      Http::error('OTP expired. Please request a new OTP.', 400);
    }
    if (!password_verify($otp, (string)$row['otp_hash'])) Http::error('Invalid OTP', 400);

    $payload = json_decode((string)$row['payload_json'], true);
    if (!is_array($payload)) Http::error('Invalid registration request. Please request a new OTP.', 400);

    $existing = self::ensureStudentCanRegister($pdo, (string)$payload['email'], (string)$payload['student_number']);
    $hash = (string)($payload['password_hash'] ?? '');
    if ($hash === '') Http::error('Invalid registration request. Please request a new OTP.', 400);

    try {
      if ($existing) {
        $existingId = (int)$existing['id'];
        $stmtUpd = $pdo->prepare("
          UPDATE users
          SET first_name = ?,
              last_name = ?,
              name = ?,
              email = ?,
              password_hash = ?,
              department = ?,
              student_number = ?,
              status = 'approved'
          WHERE id = ?
        ");
        $stmtUpd->execute([
          (string)$payload['first_name'],
          (string)$payload['last_name'],
          (string)$payload['name'],
          (string)$payload['email'],
          $hash,
          (string)$payload['department'],
          (string)$payload['student_number'],
          $existingId,
        ]);

        ActivityLogger::log($pdo, [
          'actor_user_id' => null,
          'action' => 'auth.register_student_revived',
          'entity_type' => 'user',
          'entity_id' => $existingId,
          'details' => [
            'target_user_id' => $existingId,
            'target_email' => (string)$payload['email'],
            'target_role' => 'student',
            'target_department' => (string)$payload['department'],
            'target_student_number' => (string)$payload['student_number'],
            'from_status' => 'disabled',
            'to_status' => 'approved',
            'verified_by' => 'otp',
          ],
        ]);

        $pdo->prepare("DELETE FROM registration_otps WHERE id = ? OR email = ?")
          ->execute([(int)$row['id'], (string)$payload['email']]);

        Http::ok([
          'id' => $existingId,
          'message' => 'Registration verified. You can now log in.'
        ], 201);
        return;
      }

      $stmt = $pdo->prepare("
        INSERT INTO users (first_name, last_name, name, email, password_hash, role, department, student_number, status)
        VALUES (?,?,?,?,?,?,?,?,?)
      ");
      $stmt->execute([
        (string)$payload['first_name'],
        (string)$payload['last_name'],
        (string)$payload['name'],
        (string)$payload['email'],
        $hash,
        'student',
        (string)$payload['department'],
        (string)$payload['student_number'],
        'approved',
      ]);

      $newId = (int)$pdo->lastInsertId();
      $pdo->prepare("DELETE FROM registration_otps WHERE id = ? OR email = ?")
        ->execute([(int)$row['id'], (string)$payload['email']]);

      ActivityLogger::log($pdo, [
        'actor_user_id' => null,
        'action' => 'auth.register_student',
        'entity_type' => 'user',
        'entity_id' => $newId,
        'details' => [
          'target_user_id' => $newId,
          'target_email' => (string)$payload['email'],
          'target_role' => 'student',
          'target_department' => (string)$payload['department'],
          'target_student_number' => (string)$payload['student_number'],
          'status' => 'approved',
          'verified_by' => 'otp',
        ],
      ]);

      Http::ok([
        'id' => $newId,
        'message' => 'Registration verified. You can now log in.'
      ], 201);
    } catch (PDOException $e) {
      Http::error('Failed to register (email or student number may already exist)', 409);
    }
  }

  public static function forgotPassword(PDO $pdo, array $config): void {
    $b = Http::readJsonBody();
    $email = trim((string)($b['email'] ?? ''));

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
      Http::error('Valid email required', 422);
    }

    self::ensureNoForbidden('Email', $email);
    self::ensureEmailDomain($email, '@cvsu.edu.ph');
    self::ensurePasswordResetsTable($pdo);

    $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
      Http::error('No account found with this email.', 404);
    }

    $token = (string)random_int(100000, 999999);
    $expiresAt = (new DateTimeImmutable('+5 minutes'))->format('Y-m-d H:i:s');
    $userId = (int)$user['id'];

    $pdo->prepare("DELETE FROM password_resets WHERE email = ? OR user_id = ?")->execute([$email, $userId]);
    $pdo->prepare("INSERT INTO password_resets (user_id, email, token, expires_at) VALUES (?,?,?,?)")
      ->execute([$userId, $email, password_hash($token, PASSWORD_DEFAULT), $expiresAt]);

    $base = rtrim((string)($config['frontend']['base_url'] ?? ''), '/');
    if ($base === '') {
      Http::error('Server reset link is not configured', 500);
    }

    $resetLink = $base . '/reset-password?email=' . rawurlencode($email) . '&token=' . rawurlencode($token);

    $subject = 'Reset your password';
    $safeLink = htmlspecialchars($resetLink, ENT_QUOTES, 'UTF-8');
    $html = '
      <div style="font-family:Arial,sans-serif; line-height:1.6">
        <h2>Password Reset</h2>
        <p>We received a request to reset your password.</p>
        <p>Your password reset code is:</p>
        <p style="font-size:28px; font-weight:bold; letter-spacing:4px;">' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '</p>
        <p>This code/link will expire in <b>5 minutes</b>.</p>
        <p><a href="' . $safeLink . '">' . $safeLink . '</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    ';
    $text = "Your CVSU Library password reset code is {$token}. It expires in 5 minutes.\nReset link:\n" . $resetLink;

    try {
      self::sendAuthEmail($config, $email, (string)($user['name'] ?? ''), $subject, $html, $text);
    } catch (Throwable $e) {
      $pdo->prepare("DELETE FROM password_resets WHERE email = ? OR user_id = ?")->execute([$email, $userId]);
      error_log('Password reset email error: ' . $e->getMessage());
      Http::error('Failed to send reset code. Please check the mailer configuration.', 500);
    }

    ActivityLogger::log($pdo, [
      'actor_user_id' => (int)$user['id'],
      'action' => 'auth.forgot_password',
      'entity_type' => 'user',
      'entity_id' => (int)$user['id'],
      'details' => [
        'email' => $email,
        'expires_at' => $expiresAt,
      ],
    ]);

    Http::ok([
      'message' => 'Password reset code sent. Please check your email.',
      'email' => $email,
      'expires_at' => $expiresAt,
    ]);
  }

  public static function resetPassword(PDO $pdo, array $config): void {
    $b = Http::readJsonBody();
    $email = trim((string)($b['email'] ?? ''));
    $token = preg_replace('/\D+/', '', (string)($b['token'] ?? '')) ?? '';
    $newPassword = (string)($b['new_password'] ?? '');

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) Http::error('Valid email required', 422);
    if ($token === '') Http::error('token is required', 422);
    if ($newPassword === '') Http::error('new_password is required', 422);
    if (strlen($newPassword) < 8) Http::error('new_password must be at least 8 characters', 422);

    self::ensureNoForbidden('Email', $email);
    self::ensureEmailDomain($email, '@cvsu.edu.ph');

    self::ensureNoForbidden('new_password', $newPassword);
    self::ensurePasswordResetsTable($pdo);

    $stmtUser = $pdo->prepare("SELECT id, email FROM users WHERE email = ? LIMIT 1");
    $stmtUser->execute([$email]);
    $user = $stmtUser->fetch();

    if (!$user) Http::error('No account found with this email.', 404);
    $userId = (int)$user['id'];

    $stmt = $pdo->prepare("
      SELECT user_id, email, token, expires_at
      FROM password_resets
      WHERE email = ? AND user_id = ?
      LIMIT 1
    ");
    $stmt->execute([$email, $userId]);
    $row = $stmt->fetch();

    if (!$row) Http::error('Invalid or missing reset code.', 400);

    $expiresAt = (string)$row['expires_at'];
    if (strtotime($expiresAt) < time()) {
      $pdo->prepare("DELETE FROM password_resets WHERE email = ? OR user_id = ?")->execute([$email, $userId]);
      Http::error('Reset code expired. Please request a new code.', 400);
    }

    $hash = (string)$row['token'];
    if (!password_verify($token, $hash)) Http::error('Invalid reset code.', 400);

    $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ? AND email = ?")->execute([
      password_hash($newPassword, PASSWORD_DEFAULT),
      $userId,
      $email,
    ]);

    $pdo->prepare("DELETE FROM password_resets WHERE email = ? OR user_id = ?")->execute([$email, $userId]);

    ActivityLogger::log($pdo, [
      'actor_user_id' => null,
      'action' => 'auth.reset_password',
      'entity_type' => 'user',
      'entity_id' => null,
      'details' => [
        'email' => $email,
      ],
    ]);

    Http::ok(['message' => 'Password reset successful.']);
  }

  public static function logout(PDO $pdo, array $config): void {
    $auth = AuthMiddleware::requireAuth($config);

    ActivityLogger::log($pdo, [
      'actor_user_id' => (int)($auth['user_id'] ?? 0) ?: null,
      'action' => 'auth.logout',
      'entity_type' => 'user',
      'entity_id' => (int)($auth['user_id'] ?? 0) ?: null,
      'details' => [
        'email' => (string)($auth['email'] ?? ''),
        'role' => (string)($auth['role'] ?? ''),
      ],
    ]);

    // Stateless JWT: nothing to invalidate server-side
    Http::ok(['message' => 'Logged out']);
  }
}
