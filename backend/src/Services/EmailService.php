<?php
declare(strict_types=1);

final class EmailService {
  private string $smtpHost;
  private int $smtpPort;
  private string $smtpUser;
  private string $smtpPass;
  private string $fromEmail;
  private string $fromName;

  public function __construct(array $config) {
    $smtpConfig = $config['smtp'] ?? [];
    $this->smtpHost = $smtpConfig['host'] ?? 'localhost';
    $this->smtpPort = (int)($smtpConfig['port'] ?? 587);
    $this->smtpUser = $smtpConfig['username'] ?? '';
    $this->smtpPass = $smtpConfig['password'] ?? '';
    $this->fromEmail = $smtpConfig['from_email'] ?? 'noreply@cvsu.edu.ph';
    $this->fromName = $smtpConfig['from_name'] ?? 'CVSU Imus Library';
  }

  /**
   * ✅ Send overdue notification (EXISTING - UPDATED)
   */
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
      $record = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$record) {
        return false;
      }

      // Check if already notified today
      $checkStmt = $pdo->prepare("
        SELECT 1 FROM overdue_notifications
        WHERE borrow_record_id = ? AND DATE(email_sent_at) = CURDATE()
        LIMIT 1
      ");
      $checkStmt->execute([$recordId]);
      if ($checkStmt->fetch()) {
        return true; // Already notified today
      }

      // Calculate days overdue
      $dueDate = strtotime($record['due_date']);
      $today = strtotime(date('Y-m-d'));
      $daysOverdue = max(0, (int)floor(($today - $dueDate) / 86400));

      // Compose email
      $studentName = htmlspecialchars($record['student_name']);
      $bookTitle = htmlspecialchars($record['book_title']);
      $dueDateFormatted = $record['due_date'];
      $studentEmail = $record['student_email'];

      $subject = "URGENT: Overdue Book Notification - CVSU Imus Library";
      $body = "Dear {$studentName},

This is to notify you that the following book(s) borrowed from CVSU Imus Library is/are now OVERDUE:

📚 Book Title: {$bookTitle}
📅 Due Date: {$dueDateFormatted}
⏰ Days Overdue: {$daysOverdue} day(s)

Please return the book(s) immediately to avoid any penalties or fines. If the book(s) have already been returned, please disregard this notice.

For any concerns, please contact the library at:
📞 Library Contact: [Your Library Contact]
📧 Email: library@cvsu.edu.ph

Thank you,
CVSU Imus Library
";

      // Send email
      $emailService = new self($config);
      $sent = $emailService->send($studentEmail, $subject, $body);

      if ($sent) {
        // Record notification
        $insertStmt = $pdo->prepare("
          INSERT INTO overdue_notifications (borrow_record_id, user_id, book_id, days_overdue, email_status)
          VALUES (?, ?, ?, ?, 'sent')
        ");
        $insertStmt->execute([
          $recordId,
          $record['user_id'],
          $record['book_id'],
          $daysOverdue
        ]);

        return true;
      }

      return false;
    } catch (Throwable $e) {
      error_log("Overdue email error: " . $e->getMessage());
      return false;
    }
  }

  /**
   * ✅ Send due date reminder (NEW)
   */
  public function sendDueDateReminder(
    PDO $pdo,
    string $studentEmail,
    string $studentName,
    string $bookTitle,
    string $dueDate,
    int $daysLeft,
    int $borrowRecordId
  ): bool {
    try {
      // Check if reminder already sent
      $reminderType = $daysLeft === 1 ? '1_day' : '3_days';
      $checkStmt = $pdo->prepare("
        SELECT 1 FROM due_date_reminders
        WHERE borrow_record_id = ? AND reminder_type = ?
        LIMIT 1
      ");
      $checkStmt->execute([$borrowRecordId, $reminderType]);
      
      if ($checkStmt->fetch()) {
        return true; // Already sent
      }

      $studentName = htmlspecialchars($studentName);
      $bookTitle = htmlspecialchars($bookTitle);

      $subject = "Book Due Soon Reminder - CVSU Imus Library";
      $body = "Dear {$studentName},

This is a friendly reminder that your borrowed book from CVSU Imus Library is due soon:

📚 Book Title: {$bookTitle}
📅 Due Date: {$dueDate}
⏰ Days Left: {$daysLeft} day(s)

Please make arrangements to return the book on time to avoid any penalties.

If you need an extension, please contact the library:
📞 Library Contact: [Your Library Contact]
📧 Email: library@cvsu.edu.ph

Thank you,
CVSU Imus Library
";

      $sent = $this->send($studentEmail, $subject, $body);

      if ($sent) {
        // Record reminder
        $insertStmt = $pdo->prepare("
          INSERT INTO due_date_reminders (borrow_record_id, user_id, reminder_type)
          SELECT ?, user_id, ? FROM borrow_records WHERE id = ?
        ");
        $insertStmt->execute([$borrowRecordId, $reminderType, $borrowRecordId]);
      }

      return $sent;
    } catch (Throwable $e) {
      error_log("Due date reminder email error: " . $e->getMessage());
      return false;
    }
  }

  /**
   * ✅ Generic email sending method (NEW)
   */
  public function send(string $to, string $subject, string $body, bool $isHtml = false): bool {
    try {
      // Validate email
      if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        error_log("Invalid email address: {$to}");
        return false;
      }

      // Try SMTP first
      if (!empty($this->smtpHost) && !empty($this->smtpUser)) {
        return $this->sendViaSmtp($to, $subject, $body, $isHtml);
      }

      // Fallback to PHP mail()
      return $this->sendViaMail($to, $subject, $body, $isHtml);
    } catch (Throwable $e) {
      error_log("Email send error: " . $e->getMessage());
      return false;
    }
  }

  /**
   * ✅ Send via SMTP (NEW - ENHANCED)
   */
  private function sendViaSmtp(string $to, string $subject, string $body, bool $isHtml = false): bool {
    try {
      $headers = "From: {$this->fromName} <{$this->fromEmail}>\r\n";
      $headers .= "Reply-To: {$this->fromEmail}\r\n";
      $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

      if ($isHtml) {
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
      } else {
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
      }

      // For production, use a proper SMTP library like PHPMailer or SwiftMailer
      // This is a basic fallback using mail()
      return mail($to, $subject, $body, $headers);
    } catch (Throwable $e) {
      error_log("SMTP error: " . $e->getMessage());
      return false;
    }
  }

  /**
   * ✅ Send via PHP mail() (NEW)
   */
  private function sendViaMail(string $to, string $subject, string $body, bool $isHtml = false): bool {
    try {
      $headers = "From: {$this->fromName} <{$this->fromEmail}>\r\n";
      $headers .= "Reply-To: {$this->fromEmail}\r\n";
      $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

      if ($isHtml) {
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
      } else {
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
      }

      return mail($to, $subject, $body, $headers);
    } catch (Throwable $e) {
      error_log("Mail error: " . $e->getMessage());
      return false;
    }
  }

  /**
   * ✅ LEGACY: Keep existing method for backwards compatibility
   */
  private static function sendViaSmtp(array $config, string $to, string $subject, string $body): bool {
    try {
      $smtpConfig = $config['smtp'] ?? [];

      if (empty($smtpConfig['host']) || empty($smtpConfig['username'])) {
        // Fallback to PHP mail()
        $headers = "From: " . ($smtpConfig['from_email'] ?? 'noreply@cvsu.edu.ph') . "\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        return mail($to, $subject, $body, $headers);
      }

      return true;
    } catch (Throwable $e) {
      error_log("SMTP error: " . $e->getMessage());
      return false;
    }
  }
}
?>