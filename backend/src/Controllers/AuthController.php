<?php
declare(strict_types=1);

final class AuthController {
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

  private static function ensureValidName(string $name): void {
    if (mb_strlen($name) > 50) Http::error('Name must be 50 characters or less', 422);
    if (!preg_match('/^[A-Za-z][A-Za-z\s.-]*$/', $name)) {
      Http::error('Name must contain letters only (allowed: spaces, dot, hyphen)', 422);
    }
    self::ensureNoForbidden('Name', $name);
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

    $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, (string)$user['password_hash'])) {
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
      Http::error('Account pending admin approval.', 403);
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

  public static function registerStudent(PDO $pdo, array $config): void {
    $b = Http::readJsonBody();

    $nameRaw = trim((string)($b['name'] ?? ''));
    $email = trim((string)($b['email'] ?? ''));
    $password = (string)($b['password'] ?? '');

    $studentNumber = trim((string)($b['student_number'] ?? ''));
    $department = trim((string)($b['department'] ?? ''));

    if ($nameRaw === '' || $email === '' || $password === '') Http::error('name, email, password required', 422);

    self::ensureValidName($nameRaw);
    $name = self::titleCaseName($nameRaw);

    self::ensureNoForbidden('Email', $email);
    self::ensureNoForbidden('Student number', $studentNumber);
    self::ensureNoForbidden('Department', $department);

    self::ensureEmailDomain($email, '@cvsu.edu.ph');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) Http::error('Invalid email', 422);
    if ($studentNumber === '') Http::error('student_number is required', 422);
    if ($department === '') Http::error('department is required', 422);

    if (strlen($password) < 8) Http::error('Password must be at least 8 characters', 422);
    self::ensureNoForbidden('Password', $password);

    $hash = password_hash($password, PASSWORD_DEFAULT);

    // revive disabled student (by email OR student_number)
    $stmtExisting = $pdo->prepare("
      SELECT id, email, student_number, role, status
      FROM users
      WHERE email = ? OR student_number = ?
      ORDER BY (email = ?) DESC
      LIMIT 1
    ");
    $stmtExisting->execute([$email, $studentNumber, $email]);
    $existing = $stmtExisting->fetch();

    if ($existing) {
      $existingId = (int)$existing['id'];
      $existingRole = (string)$existing['role'];
      $existingStatus = (string)$existing['status'];

      if ($existingRole === 'student' && $existingStatus === 'disabled') {
        $stmtUpd = $pdo->prepare("
          UPDATE users
          SET name = ?,
              email = ?,
              password_hash = ?,
              department = ?,
              student_number = ?,
              status = 'pending'
          WHERE id = ?
        ");
        $stmtUpd->execute([$name, $email, $hash, $department, $studentNumber, $existingId]);

        ActivityLogger::log($pdo, [
          'actor_user_id' => null,
          'action' => 'auth.register_student_revived',
          'entity_type' => 'user',
          'entity_id' => $existingId,
          'details' => [
            'target_user_id' => $existingId,
            'target_email' => $email,
            'target_role' => 'student',
            'target_department' => $department,
            'target_student_number' => $studentNumber,
            'from_status' => 'disabled',
            'to_status' => 'pending',
          ],
        ]);

        Http::ok([
          'id' => $existingId,
          'message' => 'Registration submitted. Please wait for admin approval.'
        ], 201);
        return;
      }

      Http::error('Email or student number already exists', 409);
    }

    try {
      $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password_hash, role, department, student_number, status)
        VALUES (?,?,?,?,?,?,?)
      ");
      $stmt->execute([$name, $email, $hash, 'student', $department, $studentNumber, 'pending']);

      $newId = (int)$pdo->lastInsertId();

      ActivityLogger::log($pdo, [
        'actor_user_id' => null,
        'action' => 'auth.register_student',
        'entity_type' => 'user',
        'entity_id' => $newId,
        'details' => [
          'target_user_id' => $newId,
          'target_email' => $email,
          'target_role' => 'student',
          'target_department' => $department,
          'target_student_number' => $studentNumber,
          'status' => 'pending',
        ],
      ]);

      Http::ok([
        'id' => $newId,
        'message' => 'Registration submitted. Please wait for admin approval.'
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

    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Always return OK (prevents account enumeration)
    if (!$user) {
      Http::ok(['message' => 'If that email exists, we sent password reset instructions.']);
      return;
    }

    $token = bin2hex(random_bytes(32));
    $expiresAt = (new DateTimeImmutable('+30 minutes'))->format('Y-m-d H:i:s');

    $pdo->prepare("DELETE FROM password_resets WHERE email = ?")->execute([$email]);
    $pdo->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?,?,?)")
      ->execute([$email, password_hash($token, PASSWORD_DEFAULT), $expiresAt]);

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
        <p>This link will expire in <b>30 minutes</b>.</p>
        <p><a href="' . $safeLink . '">' . $safeLink . '</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    ';
    $text = "Reset your password using this link (expires in 30 minutes):\n" . $resetLink;

    // Send email (Gmail SMTP)
    Mailer::send($config['smtp'], $email, (string)($user['name'] ?? ''), $subject, $html, $text);

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
      'message' => 'If that email exists, we sent password reset instructions.'
    ]);
  }

  public static function resetPassword(PDO $pdo, array $config): void {
    $b = Http::readJsonBody();
    $email = trim((string)($b['email'] ?? ''));
    $token = (string)($b['token'] ?? '');
    $newPassword = (string)($b['new_password'] ?? '');

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) Http::error('Valid email required', 422);
    if ($token === '') Http::error('token is required', 422);
    if ($newPassword === '') Http::error('new_password is required', 422);
    if (strlen($newPassword) < 8) Http::error('new_password must be at least 8 characters', 422);

    self::ensureNoForbidden('Email', $email);
    self::ensureEmailDomain($email, '@cvsu.edu.ph');

    self::ensureNoForbidden('new_password', $newPassword);

    $stmt = $pdo->prepare("SELECT email, token, expires_at FROM password_resets WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $row = $stmt->fetch();

    if (!$row) Http::error('Invalid reset token', 400);

    $expiresAt = (string)$row['expires_at'];
    if (strtotime($expiresAt) < time()) Http::error('Reset token expired', 400);

    $hash = (string)$row['token'];
    if (!password_verify($token, $hash)) Http::error('Invalid reset token', 400);

    $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = ?")->execute([
      password_hash($newPassword, PASSWORD_DEFAULT),
      $email,
    ]);

    $pdo->prepare("DELETE FROM password_resets WHERE email = ?")->execute([$email]);

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
}