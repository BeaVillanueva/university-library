<?php
// backend/src/Controllers/AnnouncementController.php

final class AnnouncementController {
  private static function ensureReadTable(PDO $pdo): void {
    $pdo->exec("
      CREATE TABLE IF NOT EXISTS announcement_reads (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        announcement_id INT NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_announcement_reads_user (announcement_id, user_id),
        KEY idx_announcement_reads_user (user_id),
        KEY idx_announcement_reads_announcement (announcement_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
  }

  /**
   * List all announcements (students see only active, admin/librarian see all)
   */
  public static function list(PDO $pdo, array $auth): void {
    self::ensureReadTable($pdo);

    $role = $auth['role'] ?? '';
    $userId = (int)($auth['user_id'] ?? 0);
    $isAdmin = in_array($role, ['admin', 'librarian'], true);

    $whereSql = $isAdmin ? '' : "WHERE status = 'active'";
    
    $stmt = $pdo->prepare("
      SELECT
        announcements.id,
        announcements.title,
        announcements.message,
        announcements.posted_by,
        announcements.status,
        announcements.created_at,
        announcements.updated_at,
        (SELECT name FROM users WHERE id = announcements.posted_by) AS posted_by_name,
        ar.read_at
      FROM announcements
      LEFT JOIN announcement_reads ar
        ON ar.announcement_id = announcements.id
       AND ar.user_id = ?
      $whereSql
      ORDER BY announcements.created_at DESC
    ");
    $stmt->execute([$userId]);
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $unreadCount = 0;
    if ($role === 'student') {
      $countStmt = $pdo->prepare("
        SELECT COUNT(*) AS c
        FROM announcements a
        LEFT JOIN announcement_reads ar
          ON ar.announcement_id = a.id
         AND ar.user_id = ?
        WHERE a.status = 'active'
          AND ar.id IS NULL
          AND a.posted_by <> ?
      ");
      $countStmt->execute([$userId, $userId]);
      $unreadCount = (int)($countStmt->fetch()['c'] ?? 0);
    }

    Http::ok([
      'announcements' => $announcements,
      'unread_count' => $unreadCount,
    ]);
  }

  public static function markRead(PDO $pdo, array $auth): void {
    self::ensureReadTable($pdo);
    AuthMiddleware::requireRole($auth, ['student']);

    $userId = (int)($auth['user_id'] ?? 0);

    $stmt = $pdo->prepare("
      INSERT IGNORE INTO announcement_reads (announcement_id, user_id)
      SELECT id, ?
      FROM announcements
      WHERE status = 'active'
        AND posted_by <> ?
    ");
    $stmt->execute([$userId, $userId]);

    Http::ok(['message' => 'Announcements marked as read.']);
  }

  /**
   * Create announcement (Admin/Librarian only)
   */
  public static function create(PDO $pdo, array $auth): void {
    self::ensureReadTable($pdo);
    AuthMiddleware::requireRole($auth, ['admin', 'librarian']);

    $data = Http::readJsonBody();
    $title = trim((string)($data['title'] ?? ''));
    $message = trim((string)($data['message'] ?? ''));

    if (!$title) Http::error(Translator::get('announcement.error.title_required'), 422);
    if (!$message) Http::error(Translator::get('announcement.error.message_required'), 422);

    $stmt = $pdo->prepare("
      INSERT INTO announcements (title, message, posted_by, status)
      VALUES (?, ?, ?, 'active')
    ");
    $stmt->execute([$title, $message, $auth['user_id']]);

    $id = (int)$pdo->lastInsertId();

    ActivityLogger::log($pdo, [
      'actor_user_id' => (int)($auth['user_id'] ?? 0),
      'action' => 'announcement.create',
      'entity_type' => 'announcement',
      'entity_id' => $id,
      'details' => ['title' => $title],
    ]);

    Http::ok([
      'message' => Translator::get('announcement.created_success'),
      'announcement_id' => $id
    ], 201);
  }

  /**
   * Update announcement
   */
  public static function update(PDO $pdo, array $auth, int $id): void {
    AuthMiddleware::requireRole($auth, ['admin', 'librarian']);

    $data = Http::readJsonBody();
    $title = trim((string)($data['title'] ?? ''));
    $message = trim((string)($data['message'] ?? ''));
    $status = trim((string)($data['status'] ?? ''));

    if (!$title) Http::error(Translator::get('announcement.error.title_required'), 422);
    if (!$message) Http::error(Translator::get('announcement.error.message_required'), 422);
    if (!in_array($status, ['active', 'inactive'], true)) {
      Http::error(Translator::get('announcement.error.invalid_status'), 422);
    }

    $stmt = $pdo->prepare("
      UPDATE announcements
      SET title = ?, message = ?, status = ?
      WHERE id = ?
    ");
    $stmt->execute([$title, $message, $status, $id]);

    Http::ok(['message' => Translator::get('announcement.updated_success')]);
  }

  /**
   * Delete announcement
   */
  public static function delete(PDO $pdo, array $auth, int $id): void {
    self::ensureReadTable($pdo);
    AuthMiddleware::requireRole($auth, ['admin', 'librarian']);

    $pdo->prepare("DELETE FROM announcement_reads WHERE announcement_id = ?")->execute([$id]);

    $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ?");
    $stmt->execute([$id]);

    Http::ok(['message' => Translator::get('announcement.deleted_success')]);
  }
}
?>
