<?php
declare(strict_types=1);

final class OverdueService {
  public static function refresh(PDO $pdo, array $config = []): void {
    $pdo->exec("
      UPDATE borrow_records
      SET status = 'overdue'
      WHERE status = 'borrowed'
        AND return_date IS NULL
        AND due_date < CURDATE()
    ");

    $pdo->exec("
      UPDATE borrow_records
      SET status = 'borrowed'
      WHERE status = 'overdue'
        AND return_date IS NULL
        AND due_date >= CURDATE()
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
      } else {
        error_log('Failed to send overdue email to: ' . $rec['student_email']);
      }
    }
  }
}