<?php
declare(strict_types=1);

final class UsersController {
  public static function list(PDO $pdo, array $auth): void {
    // Optional: log viewing users list (comment out if you don't want noise)
    /*
    ActivityLogger::log($pdo, [
      'actor_user_id' => (int)($auth['user_id'] ?? 0) ?: null,
      'action' => 'users.view_list',
      'entity_type' => 'user',
      'entity_id' => null,
      'details' => [
        'page' => Query::int('page', 1, 1),
        'limit' => Query::int('limit', 10, 1, 100),
        'q' => Query::str('q', ''),
      ],
    ]);
    */

    $page = Query::int('page', 1, 1);
    $limit = Query::int('limit', 10, 1, 100);
    $q = Query::str('q', '');

    $offset = ($page - 1) * $limit;

    $where = '';
    $params = [];
    if ($q !== '') {
      $where = "WHERE name LIKE ? OR email LIKE ? OR role LIKE ? OR department LIKE ? OR student_number LIKE ?";
      $like = '%' . $q . '%';
      $params = [$like, $like, $like, $like, $like];
    }

    $countStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM users $where");
    $countStmt->execute($params);
    $total = (int)($countStmt->fetch()['c'] ?? 0);

    $stmt = $pdo->prepare("
      SELECT id, name, email, role, department, year_level, student_number, created_at
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

  public static function create(PDO $pdo, array $auth): void {
    $actorId = (int)($auth['user_id'] ?? 0) ?: null;

    $b = Http::readJsonBody();
    $name = trim((string)($b['name'] ?? ''));
    $email = trim((string)($b['email'] ?? ''));
    $password = (string)($b['password'] ?? '');
    $role = (string)($b['role'] ?? 'student');

    // Student fields
    $department = array_key_exists('department', $b) ? trim((string)$b['department']) : null;
    $yearLevel = array_key_exists('year_level', $b) ? (int)$b['year_level'] : null;
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

    // Validate student-only fields
    if ($role === 'student') {
      if ($studentNumber === null || $studentNumber === '') Http::error('student_number is required for students', 422);
      if ($department === null || $department === '') Http::error('department is required for students', 422);
      if ($yearLevel === null || $yearLevel < 1 || $yearLevel > 6) Http::error('year_level must be 1-6', 422);
    } else {
      $studentNumber = null;
      $department = null;
      $yearLevel = null;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    try {
      $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password_hash, role, department, year_level, student_number)
        VALUES (?,?,?,?,?,?,?)
      ");
      $stmt->execute([$name, $email, $hash, $role, $department, $yearLevel, $studentNumber]);

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
          'target_year_level' => $yearLevel,
          'target_student_number' => $studentNumber,
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

    // Fetch existing for logs
    $stmtOld = $pdo->prepare("SELECT id, name, email, role, department, year_level, student_number FROM users WHERE id = ? LIMIT 1");
    $stmtOld->execute([$id]);
    $old = $stmtOld->fetch();
    if (!$old) Http::error('User not found', 404);

    $b = Http::readJsonBody();
    $name = array_key_exists('name', $b) ? trim((string)$b['name']) : null;
    $email = array_key_exists('email', $b) ? trim((string)$b['email']) : null;
    $role = array_key_exists('role', $b) ? (string)$b['role'] : null;
    $password = array_key_exists('password', $b) ? (string)$b['password'] : null;

    // Student extra fields
    $department = array_key_exists('department', $b) ? trim((string)$b['department']) : null;
    $yearLevel = array_key_exists('year_level', $b) ? (int)$b['year_level'] : null;
    $studentNumber = array_key_exists('student_number', $b) ? trim((string)$b['student_number']) : null;

    if ($email !== null && $email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) Http::error('Invalid email', 422);
    if ($role !== null && !in_array($role, ['admin', 'librarian', 'student'], true)) Http::error('Invalid role', 422);

    $fields = [];
    $params = [];

    if ($name !== null) { $fields[] = 'name = ?'; $params[] = $name; }
    if ($email !== null) { $fields[] = 'email = ?'; $params[] = $email; }
    if ($role !== null) { $fields[] = 'role = ?'; $params[] = $role; }
    if ($department !== null) { $fields[] = 'department = ?'; $params[] = $department; }
    if ($yearLevel !== null) { $fields[] = 'year_level = ?'; $params[] = $yearLevel; }
    if ($studentNumber !== null) { $fields[] = 'student_number = ?'; $params[] = $studentNumber; }

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
          'target_year_level' => $old['year_level'] ?? null,
          'target_student_number' => $old['student_number'] ?? null,
          'changed' => [
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'department' => $department,
            'year_level' => $yearLevel,
            'student_number' => $studentNumber,
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

    // Fetch existing for logs
    $stmtOld = $pdo->prepare("SELECT id, name, email, role, department, year_level, student_number FROM users WHERE id = ? LIMIT 1");
    $stmtOld->execute([$id]);
    $old = $stmtOld->fetch();

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);

    ActivityLogger::log($pdo, [
      'actor_user_id' => $actorId,
      'action' => 'users.delete',
      'entity_type' => 'user',
      'entity_id' => $id,
      'details' => [
        'deleted' => ($stmt->rowCount() > 0),
        'target_user_id' => $id,
        'target_name' => $old ? (string)$old['name'] : null,
        'target_email' => $old ? (string)$old['email'] : null,
        'target_role' => $old ? (string)$old['role'] : null,
        'target_department' => $old ? ($old['department'] ?? null) : null,
        'target_year_level' => $old ? ($old['year_level'] ?? null) : null,
        'target_student_number' => $old ? ($old['student_number'] ?? null) : null,
      ],
    ]);

    Http::ok();
  }
}