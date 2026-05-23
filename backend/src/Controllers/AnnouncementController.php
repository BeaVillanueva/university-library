<?php
// backend/src/Controllers/AnnouncementController.php

final class AnnouncementController {

  /**
   * List all announcements (students see only active, admin/librarian see all)
   */
  public static function list(PDO $pdo, array $auth): void {
    $role = $auth['role'] ?? '';
    $isAdmin = in_array($role, ['admin', 'librarian'], true);

    $whereSql = $isAdmin ? '' : "WHERE status = 'active'";
    
    $stmt = $pdo->prepare("
      SELECT id, title, message, posted_by, status, created_at,
             (SELECT name FROM users WHERE id = announcements.posted_by) AS posted_by_name
      FROM announcements
      $whereSql
      ORDER BY created_at DESC
    ");
    $stmt->execute();
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Http::ok(['announcements' => $announcements]);
  }

  /**
   * Create announcement (Admin/Librarian only)
   */
  public static function create(PDO $pdo, array $auth): void {
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
    AuthMiddleware::requireRole($auth, ['admin', 'librarian']);

    $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ?");
    $stmt->execute([$id]);

    Http::ok(['message' => Translator::get('announcement.deleted_success')]);
  }
}
?>