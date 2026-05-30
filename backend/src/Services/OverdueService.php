<?php
declare(strict_types=1);

final class OverdueService {
  public static function refresh(PDO $pdo, array $config = []): void {
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
        AND br.due_date <= CURDATE()
    ");
    $newOverdueStmt->execute();
    $newOverdueRecords = $newOverdueStmt->fetchAll(PDO::FETCH_ASSOC);

    $pdo->exec("
      UPDATE borrow_records
      SET status = 'overdue'
      WHERE status = 'borrowed'
        AND return_date IS NULL
        AND due_date <= CURDATE()
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

    self::createOverdueNotifications($pdo, $config);
  }

  private static function createOverdueNotifications(PDO $pdo, array $config = []): void {
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
      WHERE br.status = 'overdue'
        AND br.return_date IS NULL
        AND n.id IS NULL
      LIMIT 50
    ");
    $stmt->execute();
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($records as $rec) {
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
      $sent = $emailService->send($rec['student_email'], $subject, $body);

      if ($sent) {
        $insert = $pdo->prepare("
          INSERT INTO overdue_notifications (record_id, notified_date, student_email)
          VALUES (?, CURDATE(), ?)
        ");
        $insert->execute([
          $rec['record_id'],
          $rec['student_email']
        ]);

        $update = $pdo->prepare("
          UPDATE borrow_records
          SET overdue_email_sent = 1
          WHERE id = ?
        ");
        $update->execute([$rec['record_id']]);

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
  }
}
