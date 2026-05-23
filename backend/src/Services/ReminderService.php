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
        u.id as user_id,
        u.email,
        u.name as student_name,
        b.title as book_title
      FROM borrow_records br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      WHERE DATE(br.due_date) = ?
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
        $record['email'],
        $record['student_name'],
        $record['book_title'],
        $record['due_date'],
        $daysUntilDue
      );

      // Log reminder
      $insertStmt = $this->pdo->prepare("
        INSERT INTO due_date_reminders (borrow_record_id, user_id, reminder_type)
        VALUES (?, ?, ?)
      ");
      $insertStmt->execute([$record['borrow_id'], $record['user_id'], "{$daysUntilDue}_days"]);
    }
  }

  /**
   * Process overdue notifications (run via cron)
   */
  public function processOverdueNotifications(): void {
    $today = date('Y-m-d');

    $stmt = $this->pdo->prepare("
      SELECT 
        br.id as borrow_id,
        br.due_date,
        u.id as user_id,
        u.email,
        u.name as student_name,
        b.id as book_id,
        b.title as book_title
      FROM borrow_records br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      WHERE br.due_date < ?
        AND br.status = 'borrowed'
        AND br.return_date IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM overdue_notifications
          WHERE borrow_record_id = br.id
        )
    ");
    $stmt->execute([$today]);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($records as $record) {
      $daysOverdue = (int) date_diff(
        date_create($record['due_date']),
        date_create($today)
      )->format('%r%a');

      // Send email
      $this->emailService->sendOverdueNotification(
        $record['email'],
        $record['student_name'],
        $record['book_title'],
        $record['due_date'],
        abs($daysOverdue)
      );

      // Log notification
      $insertStmt = $this->pdo->prepare("
        INSERT INTO overdue_notifications (borrow_record_id, user_id, book_id, days_overdue)
        VALUES (?, ?, ?, ?)
      ");
      $insertStmt->execute([
        $record['borrow_id'],
        $record['user_id'],
        $record['book_id'],
        $daysOverdue
      ]);
    }
  }
}
?>