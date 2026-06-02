<?php
declare(strict_types=1);

final class OverdueService {
  public static function refresh(PDO $pdo, array $config = []): array {
    self::ensureOverdueReminderStorage($pdo);

    $newOverdueStmt = $pdo->prepare("
      SELECT
        br.id AS record_id,
        br.user_id,
        br.book_id,
        br.borrow_date,
        br.due_date,
        u.name AS student_name,
        u.email AS student_email,
        b.title AS book_title
      FROM borrow_records br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      WHERE br.status = 'borrowed'
        AND br.return_date IS NULL
        AND br.due_date < CURDATE()
    ");
    $newOverdueStmt->execute();
    $newOverdueRecords = $newOverdueStmt->fetchAll(PDO::FETCH_ASSOC);

    $pdo->exec("
      UPDATE borrow_records
      SET status = 'overdue'
      WHERE status = 'borrowed'
        AND return_date IS NULL
        AND due_date < CURDATE()
    ");

    foreach ($newOverdueRecords as $rec) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => null,
        'action' => 'borrow.overdue',
        'entity_type' => 'borrow_record',
        'entity_id' => (int)$rec['record_id'],
        'details' => [
          'borrower_user_id' => (int)$rec['user_id'],
          'borrower_name' => (string)$rec['student_name'],
          'borrower_email' => (string)$rec['student_email'],
          'book_id' => (int)$rec['book_id'],
          'book_title' => (string)$rec['book_title'],
          'borrow_date' => (string)$rec['borrow_date'],
          'due_date' => (string)$rec['due_date'],
          'from_status' => 'borrowed',
          'to_status' => 'overdue',
        ],
      ]);
    }

    $pdo->exec("
      UPDATE borrow_records
      SET status = 'borrowed'
      WHERE status = 'overdue'
        AND return_date IS NULL
        AND due_date > CURDATE()
    ");

    $summary = self::createOverdueNotifications($pdo, $config);
    $summary['new_overdue_records'] = count($newOverdueRecords);
    return $summary;
  }

  private static function columnExists(PDO $pdo, string $table, string $column): bool {
    $stmt = $pdo->prepare("
      SELECT COUNT(*)
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    ");
    $stmt->execute([$table, $column]);
    return (int)$stmt->fetchColumn() > 0;
  }

  private static function addColumnIfMissing(PDO $pdo, string $table, string $column, string $definition): void {
    if (!self::columnExists($pdo, $table, $column)) {
      $pdo->exec("ALTER TABLE {$table} ADD COLUMN {$definition}");
    }
  }

  private static function ensureOverdueReminderStorage(PDO $pdo): void {
    $pdo->exec("
      CREATE TABLE IF NOT EXISTS overdue_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        record_id INT NOT NULL,
        notified_date DATE NOT NULL,
        student_email VARCHAR(190) NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_overdue_notification_day (record_id, notified_date),
        INDEX idx_overdue_notifications_record_id (record_id),
        INDEX idx_overdue_notifications_notified_date (notified_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    self::addColumnIfMissing($pdo, 'borrow_records', 'overdue_email_sent', 'overdue_email_sent TINYINT(1) NOT NULL DEFAULT 0');
    self::addColumnIfMissing($pdo, 'borrow_records', 'overdue_email_sent_at', 'overdue_email_sent_at DATETIME NULL AFTER overdue_email_sent');
  }

  private static function createOverdueNotifications(PDO $pdo, array $config = []): array {
    $stmt = $pdo->prepare("
      SELECT 
        br.id AS record_id,
        br.due_date,
        u.email AS student_email,
        u.name AS student_name,
        b.title AS book_title
      FROM borrow_records br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      LEFT JOIN overdue_notifications n
        ON n.record_id = br.id
       AND n.notified_date = CURDATE()
      WHERE br.status IN ('borrowed', 'overdue')
        AND br.return_date IS NULL
        AND br.due_date < CURDATE()
        AND n.id IS NULL
      LIMIT 50
    ");
    $stmt->execute();
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $summary = [
      'checked_records' => count($records),
      'sent' => 0,
      'failed' => 0,
      'skipped' => 0,
    ];

    foreach ($records as $rec) {
      if (trim((string)$rec['student_email']) === '') {
        error_log('Skipped overdue email for borrow record ' . $rec['record_id'] . ': missing student email.');
        $summary['skipped']++;
        continue;
      }

      $daysOverdue = max(0, (int) floor((strtotime(date('Y-m-d')) - strtotime($rec['due_date'])) / 86400));

      $subject = "URGENT: Overdue Book Notification - CVSU Imus Library";

      $body = "Dear {$rec['student_name']},

This is to notify you that your borrowed book from CVSU Imus Library is now OVERDUE.

Book Title: {$rec['book_title']}
Due Date: {$rec['due_date']}
Days Overdue: {$daysOverdue} day(s)

Please return the book immediately to avoid penalties.

Thank you,
CVSU Imus Library";

      $emailService = new EmailService($config);
      error_log('Sending overdue email reminder to ' . $rec['student_email'] . ' for borrow record ' . $rec['record_id']);
      $sent = $emailService->send($rec['student_email'], $subject, $body);

      if ($sent) {
        try {
          $insert = $pdo->prepare("
            INSERT INTO overdue_notifications (record_id, notified_date, student_email)
            VALUES (?, CURDATE(), ?)
          ");
          $insert->execute([
            $rec['record_id'],
            $rec['student_email']
          ]);
        } catch (PDOException $e) {
          error_log('Overdue notification duplicate/storage error for record ' . $rec['record_id'] . ': ' . $e->getMessage());
          $summary['skipped']++;
          continue;
        }

        $update = $pdo->prepare("
          UPDATE borrow_records
          SET overdue_email_sent = 1,
              overdue_email_sent_at = NOW()
          WHERE id = ?
            AND return_date IS NULL
        ");
        $update->execute([$rec['record_id']]);
        $summary['sent']++;

        ActivityLogger::log($pdo, [
          'actor_user_id' => null,
          'action' => 'borrow.overdue_email_sent',
          'entity_type' => 'borrow_record',
          'entity_id' => (int)$rec['record_id'],
          'details' => [
            'student_email' => (string)$rec['student_email'],
            'student_name' => (string)$rec['student_name'],
            'book_title' => (string)$rec['book_title'],
            'due_date' => (string)$rec['due_date'],
            'days_overdue' => $daysOverdue,
          ],
        ]);
      } else {
        error_log('Failed to send overdue email to: ' . $rec['student_email']);
        $summary['failed']++;

        ActivityLogger::log($pdo, [
          'actor_user_id' => null,
          'action' => 'borrow.overdue_email_failed',
          'entity_type' => 'borrow_record',
          'entity_id' => (int)$rec['record_id'],
          'details' => [
            'student_email' => (string)$rec['student_email'],
            'student_name' => (string)$rec['student_name'],
            'book_title' => (string)$rec['book_title'],
            'due_date' => (string)$rec['due_date'],
            'days_overdue' => $daysOverdue,
          ],
        ]);
      }
    }

    return $summary;
  }
}
