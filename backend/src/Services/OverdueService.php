<?php
declare(strict_types=1);

final class OverdueService {
  /**
   * ✅ Refresh overdue status AND send notifications
   */
  public static function refresh(PDO $pdo, array $config = []): void {
    // Mark borrowed records past due_date as overdue (if not returned)
    $pdo->exec("
      UPDATE borrow_records
      SET status = 'overdue'
      WHERE status = 'borrowed'
        AND return_date IS NULL
        AND due_date < CURDATE()
    ");

    // Mark overdue records that are no longer overdue back to borrowed (edge-case)
    $pdo->exec("
      UPDATE borrow_records
      SET status = 'borrowed'
      WHERE status = 'overdue'
        AND return_date IS NULL
        AND due_date >= CURDATE()
    ");

    // ✅ NEW: Send email notifications for newly overdue books
    if (!empty($config)) {
      self::sendOverdueNotifications($pdo, $config);
    }
  }

  /**
   * ✅ Send email notifications for overdue books
   */
  private static function sendOverdueNotifications(PDO $pdo, array $config): void {
    try {
      // Get all overdue records that haven't been notified today
      $stmt = $pdo->prepare("
        SELECT br.id, br.user_id, br.book_id, br.due_date, u.email, u.name
        FROM borrow_records br
        JOIN users u ON u.id = br.user_id
        LEFT JOIN overdue_notifications on_ ON on_.record_id = br.id AND on_.notified_date = CURDATE()
        WHERE br.status = 'overdue'
          AND br.return_date IS NULL
          AND on_.id IS NULL
        LIMIT 50
      ");
      $stmt->execute();
      $records = $stmt->fetchAll();

      foreach ($records as $rec) {
        EmailService::sendOverdueNotification($pdo, $config, $rec['id']);
      }
    } catch (Throwable $e) {
      error_log("Error sending overdue notifications: " . $e->getMessage());
    }
  }
}
