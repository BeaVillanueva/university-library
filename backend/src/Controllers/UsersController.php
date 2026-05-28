<?php
declare(strict_types=1);

final class UsersController {
  public static function list(PDO $pdo, array $auth): void {
    $page = Query::int('page', 1, 1);
    $limit = Query::int('limit', 10, 1, 100);
    $q = Query::str('q', '');
    $statusFilter = Query::str('status', 'active');

    $offset = ($page - 1) * $limit;

    if (!in_array($statusFilter, ['active', 'archived', 'all'], true)) {
      $statusFilter = 'active';
    }

    if ($statusFilter === 'archived') {
      $whereParts = ["status = 'archived'"];
    } else if ($statusFilter === 'all') {
      $whereParts = ["1=1"];
    } else {
      $whereParts = ["status NOT IN ('disabled', 'archived')"];
    }
    $params = [];

    if ($q !== '') {
      $whereParts[] = "(name LIKE ? OR email LIKE ? OR role LIKE ? OR department LIKE ? OR student_number LIKE ?)";
      $like = '%' . $q . '%';
      $params = [$like, $like, $like, $like, $like];
    }

    $where = 'WHERE ' . implode(' AND ', $whereParts);

    $countStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM users $where");
    $countStmt->execute($params);
    $total = (int)($countStmt->fetch()['c'] ?? 0);

    $stmt = $pdo->prepare("
      SELECT id, name, email, role, department, student_number, created_at, status
      FROM users
      $where
      ORDER BY id DESC
      LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $items = $stmt->fetchAll();

    Http::ok([
      'items' => $items,
      'page' => $page,
      'limit' => $limit,
      'total' => $total,
      'total_pages' => (int)ceil($total / $limit),
    ]);
  }

  public static function listPending(PDO $pdo, array $auth): void {
    $stmt = $pdo->prepare("
      SELECT id, name, email, role, department, student_number, created_at, status
      FROM users
      WHERE role = 'student' AND status = 'pending'
      ORDER BY id DESC
    ");
    $stmt->execute();
    $items = $stmt->fetchAll();
    Http::ok(['items' => $items]);
  }

  public static function approve(PDO $pdo, array $auth, int $id): void {
    $actorId = (int)($auth['user_id'] ?? 0) ?: null;

    $stmtOld = $pdo->prepare("SELECT id, email, role, status FROM users WHERE id = ? LIMIT 1");
    $stmtOld->execute([$id]);
    $old = $stmtOld->fetch();
    if (!$old) Http::error('User not found', 404);

    $pdo->prepare("UPDATE users SET status = 'approved' WHERE id = ?")->execute([$id]);

    ActivityLogger::log($pdo, [
      'actor_user_id' => $actorId,
      'action' => 'users.approve',
      'entity_type' => 'user',
      'entity_id' => $id,
      'details' => [
        'target_user_id' => $id,
        'target_email' => (string)$old['email'],
        'target_role' => (string)$old['role'],
        'from_status' => (string)$old['status'],
        'to_status' => 'approved',
      ],
    ]);

    Http::ok(['message' => 'Approved']);
  }

  public static function decline(PDO $pdo, array $auth, int $id): void {
    $actorId = (int)($auth['user_id'] ?? 0) ?: null;

    $b = Http::readJsonBody();
    $reason = array_key_exists('reason', $b) ? trim((string)$b['reason']) : '';

    $stmtOld = $pdo->prepare("SELECT id, email, role, status FROM users WHERE id = ? LIMIT 1");
    $stmtOld->execute([$id]);
    $old = $stmtOld->fetch();
    if (!$old) Http::error('User not found', 404);

    $pdo->prepare("UPDATE users SET status = 'disabled' WHERE id = ?")->execute([$id]);

    ActivityLogger::log($pdo, [
      'actor_user_id' => $actorId,
      'action' => 'users.decline',
      'entity_type' => 'user',
      'entity_id' => $id,
      'details' => [
        'target_user_id' => $id,
        'target_email' => (string)$old['email'],
        'target_role' => (string)$old['role'],
        'from_status' => (string)$old['status'],
        'to_status' => 'disabled',
        'reason' => $reason !== '' ? $reason : null,
      ],
    ]);

    Http::ok(['message' => 'Declined']);
  }

  public static function create(PDO $pdo, array $auth): void {
    $actorId = (int)($auth['user_id'] ?? 0) ?: null;

    $b = Http::readJsonBody();
    $name = Text::titleCaseName((string)($b['name'] ?? ''));
    $email = trim((string)($b['email'] ?? ''));
    $password = (string)($b['password'] ?? '');
    $role = (string)($b['role'] ?? 'student');

    $department = array_key_exists('department', $b) ? trim((string)$b['department']) : null;
    $studentNumber = array_key_exists('student_number', $b) ? trim((string)$b['student_number']) : null;

    if ($name === '' || $email === '' || $password === '') {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'users.create_failed',
        'entity_type' => 'user',
        'entity_id' => null,
        'details' => [
          'reason' => 'missing_fields',
          'email' => $email,
          'role' => $role,
        ],
      ]);
      Http::error('name, email, password required', 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'users.create_failed',
        'entity_type' => 'user',
        'entity_id' => null,
        'details' => [
          'reason' => 'invalid_email',
          'email' => $email,
        ],
      ]);
      Http::error('Invalid email', 422);
    }

    if (!in_array($role, ['admin', 'librarian', 'student'], true)) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'users.create_failed',
        'entity_type' => 'user',
        'entity_id' => null,
        'details' => [
          'reason' => 'invalid_role',
          'role' => $role,
        ],
      ]);
      Http::error('Invalid role', 422);
    }

    if ($role === 'student') {
      if ($studentNumber === null || $studentNumber === '') Http::error('student_number is required for students', 422);
      if ($department === null || $department === '') Http::error('department is required for students', 422);
    } else {
      $studentNumber = null;
      $department = null;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $status = 'approved';

    try {
      $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password_hash, role, department, student_number, status)
        VALUES (?,?,?,?,?,?,?)
      ");
      $stmt->execute([$name, $email, $hash, $role, $department, $studentNumber, $status]);

      $newId = (int)$pdo->lastInsertId();

      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'users.create',
        'entity_type' => 'user',
        'entity_id' => $newId,
        'details' => [
          'target_user_id' => $newId,
          'target_name' => $name,
          'target_email' => $email,
          'target_role' => $role,
          'target_department' => $department,
          'target_student_number' => $studentNumber,
          'status' => $status,
        ],
      ]);

      Http::ok(['id' => $newId], 201);
    } catch (PDOException $e) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'users.create_failed',
        'entity_type' => 'user',
        'entity_id' => null,
        'details' => [
          'reason' => 'conflict',
          'email' => $email,
          'student_number' => $studentNumber,
        ],
      ]);
      Http::error('Failed to create user (email or student number may already exist)', 409);
    }
  }

  public static function update(PDO $pdo, array $auth, int $id): void {
    $actorId = (int)($auth['user_id'] ?? 0) ?: null;

    $stmtOld = $pdo->prepare("SELECT id, name, email, role, department, student_number, status FROM users WHERE id = ? LIMIT 1");
    $stmtOld->execute([$id]);
    $old = $stmtOld->fetch();
    if (!$old) Http::error('User not found', 404);

    $b = Http::readJsonBody();
    $name = array_key_exists('name', $b) ? Text::titleCaseName((string)$b['name']) : null;
    $email = array_key_exists('email', $b) ? trim((string)$b['email']) : null;
    $role = array_key_exists('role', $b) ? (string)$b['role'] : null;
    $password = array_key_exists('password', $b) ? (string)$b['password'] : null;

    $department = array_key_exists('department', $b) ? trim((string)$b['department']) : null;
    $studentNumber = array_key_exists('student_number', $b) ? trim((string)$b['student_number']) : null;

    $status = array_key_exists('status', $b) ? trim((string)$b['status']) : null;
    if ($status !== null && !in_array($status, ['pending', 'approved', 'disabled', 'archived'], true)) {
      Http::error('Invalid status', 422);
    }

    if ($email !== null && $email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) Http::error('Invalid email', 422);
    if ($role !== null && !in_array($role, ['admin', 'librarian', 'student'], true)) Http::error('Invalid role', 422);

    $fields = [];
    $params = [];

    if ($name !== null) { $fields[] = 'name = ?'; $params[] = $name; }
    if ($email !== null) { $fields[] = 'email = ?'; $params[] = $email; }
    if ($role !== null) { $fields[] = 'role = ?'; $params[] = $role; }
    if ($department !== null) { $fields[] = 'department = ?'; $params[] = $department; }
    if ($studentNumber !== null) { $fields[] = 'student_number = ?'; $params[] = $studentNumber; }
    if ($status !== null) { $fields[] = 'status = ?'; $params[] = $status; }

    if ($password !== null && $password !== '') {
      $fields[] = 'password_hash = ?';
      $params[] = password_hash($password, PASSWORD_DEFAULT);
    }

    if (!$fields) Http::error('No fields to update', 422);

    $params[] = $id;

    try {
      $stmt = $pdo->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?");
      $stmt->execute($params);

      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'users.update',
        'entity_type' => 'user',
        'entity_id' => $id,
        'details' => [
          'target_user_id' => (int)$old['id'],
          'target_name' => (string)$old['name'],
          'target_email' => (string)$old['email'],
          'target_role' => (string)$old['role'],
          'target_department' => $old['department'] ?? null,
          'target_student_number' => $old['student_number'] ?? null,
          'target_status' => $old['status'] ?? null,
          'changed' => [
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'department' => $department,
            'student_number' => $studentNumber,
            'status' => $status,
            'password_changed' => ($password !== null && $password !== ''),
          ],
        ],
      ]);

      Http::ok();
    } catch (PDOException $e) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'users.update_failed',
        'entity_type' => 'user',
        'entity_id' => $id,
        'details' => [
          'reason' => 'conflict',
          'email' => $email,
          'student_number' => $studentNumber,
        ],
      ]);
      Http::error('Failed to update user (email or student number may already exist)', 409);
    }
  }

 public static function delete(PDO $pdo, array $auth, int $id): void {
    $actorId = (int)($auth['user_id'] ?? 0) ?: null;

    $stmtOld = $pdo->prepare("SELECT id, name, email, role, department, student_number, status FROM users WHERE id = ? LIMIT 1");
    $stmtOld->execute([$id]);
    $old = $stmtOld->fetch();

    if (!$old) {
      Http::error('User not found', 404);
    }

    // ✅ NEW: Check for active borrow records (pending, borrowed, or overdue)
    $stmtBorrow = $pdo->prepare("
      SELECT COUNT(*) AS c FROM borrow_records
      WHERE user_id = ?
        AND return_date IS NULL
        AND status IN ('pending', 'borrowed', 'overdue')
    ");
    $stmtBorrow->execute([$id]);
    $activeBorrows = (int)($stmtBorrow->fetch()['c'] ?? 0);

    if ($activeBorrows > 0) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'users.delete_failed',
        'entity_type' => 'user',
        'entity_id' => $id,
        'details' => [
          'reason' => 'has_active_borrow_records',
          'active_borrow_count' => $activeBorrows,
          'target_user_id' => $id,
          'target_email' => (string)$old['email'],
        ],
      ]);

      Http::error(
        "Cannot archive user with active borrow records ({$activeBorrows}). Please resolve all pending, borrowed, or overdue books first.",
        409,
        ['active_borrow_count' => $activeBorrows]
      );
    }

    if ((string)$old['status'] === 'archived') {
      Http::ok(['message' => 'User is already archived.']);
      return;
    }

    $stmt = $pdo->prepare("UPDATE users SET status = 'archived' WHERE id = ?");
    $stmt->execute([$id]);

    ActivityLogger::log($pdo, [
      'actor_user_id' => $actorId,
      'action' => 'users.archive',
      'entity_type' => 'user',
      'entity_id' => $id,
      'details' => [
        'archived' => ($stmt->rowCount() > 0),
        'target_user_id' => $id,
        'target_name' => $old ? (string)$old['name'] : null,
        'target_email' => $old ? (string)$old['email'] : null,
        'target_role' => $old ? (string)$old['role'] : null,
        'target_department' => $old ? ($old['department'] ?? null) : null,
        'target_student_number' => $old ? ($old['student_number'] ?? null) : null,
        'target_status' => $old ? ($old['status'] ?? null) : null,
        'to_status' => 'archived',
      ],
    ]);

    Http::ok(['message' => 'User archived.']);
  }
}
