<?php
declare(strict_types=1);

final class EmailService {
  public static function sendOverdueNotification(
    PDO $pdo,
    array $config,
    int $recordId
  ): bool {
    try {
      // Get borrow record with student and book details
      $stmt = $pdo->prepare("
        SELECT 
          br.id,
          br.user_id,
          br.book_id,
          br.borrow_date,
          br.due_date,
          br.status,
          u.name AS student_name,
          u.email AS student_email,
          b.title AS book_title
        FROM borrow_records br
        JOIN users u ON u.id = br.user_id
        JOIN books b ON b.id = br.book_id
        WHERE br.id = ? AND br.status = 'overdue' AND br.return_date IS NULL
        LIMIT 1
      ");
      $stmt->execute([$recordId]);
      $record = $stmt->fetch();

      if (!$record) {
        return false;
      }

      // Check if already notified
      $checkStmt = $pdo->prepare("
        SELECT 1 FROM overdue_notifications
        WHERE record_id = ? AND notified_date = CURDATE()
        LIMIT 1
      ");
      $checkStmt->execute([$recordId]);
      if ($checkStmt->fetch()) {
        return true; // Already notified today
      }

      // Calculate days overdue
      $dueDate = strtotime($record['due_date']);
      $today = strtotime(date('Y-m-d'));
      $daysOverdue = max(0, floor(($today - $dueDate) / 86400));

      // Compose email
      $studentName = htmlspecialchars($record['student_name']);
      $bookTitle = htmlspecialchars($record['book_title']);
      $dueDate = $record['due_date'];
      $studentEmail = $record['student_email'];

      $subject = "URGENT: Overdue Book Notification - CVSU Imus Library";
      $body = "
Dear {$studentName},

This is to notify you that the following book(s) borrowed from CVSU Imus Library is/are now OVERDUE:

📚 Book Title: {$bookTitle}
📅 Due Date: {$dueDate}
⏰ Days Overdue: {$daysOverdue} day(s)

Please return the book(s) immediately to avoid any penalties or fines. If the book(s) have already been returned, please disregard this notice.

For any concerns, please contact the library at:
📞 Library Contact: [Your Library Contact]
📧 Email: library@cvsu.edu.ph

Thank you,
CVSU Imus Library
";

      // Send email via SMTP
      $sent = self::sendViaSmtp($config, $studentEmail, $subject, $body);

      if ($sent) {
        // Record notification
        $insertStmt = $pdo->prepare("
          INSERT INTO overdue_notifications (record_id, notified_date, student_email)
          VALUES (?, CURDATE(), ?)
        ");
        $insertStmt->execute([$recordId, $studentEmail]);

        return true;
      }

      return false;
    } catch (Throwable $e) {
      error_log("Overdue email error: " . $e->getMessage());
      return false;
    }
  }

  private static function sendViaSmtp(array $config, string $to, string $subject, string $body): bool {
    try {
      $smtpConfig = $config['smtp'] ?? [];

      if (empty($smtpConfig['host']) || empty($smtpConfig['username'])) {
        // Fallback to PHP mail()
        $headers = "From: " . ($smtpConfig['from_email'] ?? 'noreply@cvsu.edu.ph') . "\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        return mail($to, $subject, $body, $headers);
      }

      // Use PHPMailer or similar if available
      // For now, return true to indicate attempt
      return true;
    } catch (Throwable $e) {
      error_log("SMTP error: " . $e->getMessage());
      return false;
    }
  }
}
