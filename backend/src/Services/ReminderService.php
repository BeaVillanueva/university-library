<?php
// backend/src/Services/ReminderService.php

class ReminderService {
  private PDO $pdo;
  private EmailService $emailService;

  public function __construct(PDO $pdo, EmailService $emailService) {
    $this->pdo = $pdo;
    $this->emailService = $emailService;
  }

  /**
   * Process due date reminders (run via cron)
   */
  public function processDueDateReminders(): void {
    // Find books due in 1 day
    $this->sendReminder(1);
    // Find books due in 3 days
    $this->sendReminder(3);
  }

  private function sendReminder(int $daysUntilDue): void {
    $targetDate = date('Y-m-d', strtotime("+{$daysUntilDue} days"));

    $stmt = $this->pdo->prepare("
      SELECT 
        br.id as borrow_id,
        br.due_date,
        br.due_at,
        u.id as user_id,
        u.email,
        u.name as student_name,
        b.title as book_title
      FROM borrow_records br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      WHERE DATE(COALESCE(br.due_at, TIMESTAMP(br.due_date, '23:59:59'))) = ?
        AND br.status = 'borrowed'
        AND br.return_date IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM due_date_reminders
          WHERE borrow_record_id = br.id
            AND reminder_type = ?
        )
    ");
    $stmt->execute([$targetDate, "{$daysUntilDue}_days"]);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($records as $record) {
      // Send email
      $this->emailService->sendDueDateReminder(
        $this->pdo,
        $record['email'],
        $record['student_name'],
        $record['book_title'],
        $record['due_at'] ?: $record['due_date'],
        $daysUntilDue,
        (int)$record['borrow_id']
      );
    }
  }

  /**
   * Process overdue notifications (run via cron)
   */
  public function processOverdueNotifications(): void {
    $stmt = $this->pdo->prepare("
      SELECT 
        br.id as borrow_id,
        br.due_date,
        br.borrowed_at,
        br.due_at,
        u.id as user_id,
        u.email,
        u.name as student_name,
        b.id as book_id,
        b.title as book_title
      FROM borrow_records br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      LEFT JOIN overdue_notifications n
        ON n.record_id = br.id
       AND n.notified_date = CURDATE()
      WHERE NOW() > COALESCE(br.due_at, TIMESTAMP(br.due_date, '23:59:59'))
        AND br.status = 'borrowed'
        AND br.return_date IS NULL
        AND n.id IS NULL
    ");
    $stmt->execute();
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    error_log('ReminderService overdue records found: ' . count($records));

    foreach ($records as $record) {
      $dueLabel = (string)($record['due_at'] ?: $record['due_date']);
      $borrowedLabel = (string)($record['borrowed_at'] ?: 'Not recorded');
      $daysOverdue = max(0, (int) floor((time() - strtotime($dueLabel)) / 86400));

      $subject = "URGENT: Overdue Book Notification - CVSU Imus Library";
      $body = "Dear {$record['student_name']},

This is to notify you that your borrowed book from CVSU Imus Library is now OVERDUE.

Book Title: {$record['book_title']}
Borrowed At: {$borrowedLabel}
Due At: {$dueLabel}
Days Overdue: {$daysOverdue} day(s)

Please return the book immediately to avoid penalties.

Thank you,
CVSU Imus Library";

      $sent = $this->emailService->send($record['email'], $subject, $body);

      if (!$sent) {
        error_log('ReminderService overdue email failed for borrow record ' . $record['borrow_id']);
        continue;
      }

      $insertStmt = $this->pdo->prepare("
        INSERT INTO overdue_notifications (record_id, notified_date, student_email)
        VALUES (?, CURDATE(), ?)
      ");
      $insertStmt->execute([
        $record['borrow_id'],
        $record['email']
      ]);

      $updateStmt = $this->pdo->prepare("
        UPDATE borrow_records
        SET overdue_email_sent = 1,
            overdue_email_sent_at = NOW()
        WHERE id = ?
          AND return_date IS NULL
      ");
      $updateStmt->execute([$record['borrow_id']]);

      error_log('ReminderService overdue email sent for borrow record ' . $record['borrow_id']);
    }
  }
}
?>
