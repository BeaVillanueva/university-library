<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

final class EmailService {
  private string $smtpHost;
  private int $smtpPort;
  private string $smtpSecure;
  private string $smtpUser;
  private string $smtpPass;
  private string $fromEmail;
  private string $fromName;
  private array $appScriptMail;

  public function __construct(array $config) {
    $emailConfig = $config['email'] ?? [];

    $this->smtpHost = $emailConfig['smtp_host'] ?? 'smtp.gmail.com';
    $this->smtpPort = (int)($emailConfig['smtp_port'] ?? 587);
    $this->smtpSecure = $emailConfig['smtp_secure'] ?? 'tls';
    $this->smtpUser = $emailConfig['smtp_user'] ?? '';
    $this->smtpPass = $emailConfig['smtp_password'] ?? '';
    $this->fromEmail = trim((string)($emailConfig['from_email'] ?? '')) ?: $this->smtpUser;
    $this->fromName = trim((string)($emailConfig['from_name'] ?? '')) ?: 'CVSU Imus Library';
    $this->appScriptMail = is_array($config['app_script_mail'] ?? null) ? $config['app_script_mail'] : [];
  }

  public static function sendOverdueNotification(PDO $pdo, array $config, int $recordId): bool {
    try {
      $stmt = $pdo->prepare("
        SELECT 
          br.id,
          br.user_id,
          br.book_id,
          br.borrow_date,
          br.due_date,
          br.borrowed_at,
          br.due_at,
          br.status,
          u.name AS student_name,
          u.email AS student_email,
          b.title AS book_title
        FROM borrow_records br
        JOIN users u ON u.id = br.user_id
        JOIN books b ON b.id = br.book_id
        WHERE br.id = ?
          AND br.status = 'overdue'
          AND br.return_date IS NULL
        LIMIT 1
      ");
      $stmt->execute([$recordId]);
      $record = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$record) {
        return false;
      }

      $checkStmt = $pdo->prepare("
        SELECT 1
        FROM overdue_notifications
        WHERE record_id = ?
          AND notified_date = CURDATE()
        LIMIT 1
      ");
      $checkStmt->execute([$recordId]);

      if ($checkStmt->fetch()) {
        return true;
      }

      $dueLabel = (string)($record['due_at'] ?: $record['due_date']);
      $borrowedLabel = (string)($record['borrowed_at'] ?: $record['borrow_date']);
      $daysOverdue = max(0, (int) floor((time() - strtotime($dueLabel)) / 86400));

      $studentName = htmlspecialchars($record['student_name']);
      $bookTitle = htmlspecialchars($record['book_title']);
      $studentEmail = $record['student_email'];

      $subject = "URGENT: Overdue Book Notification - CVSU Imus Library";

      $body = "Dear {$studentName},

This is to notify you that the following book borrowed from CVSU Imus Library is now OVERDUE:

Book Title: {$bookTitle}
Borrowed At: {$borrowedLabel}
Due At: {$dueLabel}
Days Overdue: {$daysOverdue} day(s)

Please return the book immediately to avoid any penalties or fines. If the book has already been returned, please disregard this notice.

Thank you,
CVSU Imus Library";

      $emailService = new self($config);
      $sent = $emailService->send($studentEmail, $subject, $body);

      if ($sent) {
        $insertStmt = $pdo->prepare("
          INSERT INTO overdue_notifications (record_id, notified_date, student_email)
          VALUES (?, CURDATE(), ?)
        ");
        $insertStmt->execute([$recordId, $studentEmail]);

        $updateStmt = $pdo->prepare("
          UPDATE borrow_records
          SET overdue_email_sent = 1,
              overdue_email_sent_at = NOW()
          WHERE id = ?
        ");
        $updateStmt->execute([$recordId]);

        return true;
      }

      return false;
    } catch (Throwable $e) {
      error_log("Overdue email error: " . $e->getMessage());
      return false;
    }
  }

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
      $reminderType = $daysLeft === 1 ? '1_day' : '3_days';

      $checkStmt = $pdo->prepare("
        SELECT 1
        FROM due_date_reminders
        WHERE borrow_record_id = ?
          AND reminder_type = ?
        LIMIT 1
      ");
      $checkStmt->execute([$borrowRecordId, $reminderType]);

      if ($checkStmt->fetch()) {
        return true;
      }

      $studentName = htmlspecialchars($studentName);
      $bookTitle = htmlspecialchars($bookTitle);

      $subject = "Book Due Soon Reminder - CVSU Imus Library";

      $body = "Dear {$studentName},

This is a friendly reminder that your borrowed book from CVSU Imus Library is due soon:

Book Title: {$bookTitle}
Due Date: {$dueDate}
Days Left: {$daysLeft} day(s)

Please return the book on time to avoid penalties.

Thank you,
CVSU Imus Library";

      $sent = $this->send($studentEmail, $subject, $body);

      if ($sent) {
        $insertStmt = $pdo->prepare("
          INSERT INTO due_date_reminders (borrow_record_id, user_id, reminder_type)
          SELECT ?, user_id, ?
          FROM borrow_records
          WHERE id = ?
        ");
        $insertStmt->execute([$borrowRecordId, $reminderType, $borrowRecordId]);
      }

      return $sent;
    } catch (Throwable $e) {
      error_log("Due date reminder email error: " . $e->getMessage());
      return false;
    }
  }

  public function send(string $to, string $subject, string $body, bool $isHtml = false): bool {
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
      error_log("Invalid email address: {$to}");
      return false;
    }

    $appScriptUrl = trim((string)($this->appScriptMail['url'] ?? ''));
    if ($appScriptUrl !== '') {
      try {
        $html = $isHtml ? $body : nl2br(htmlspecialchars($body, ENT_QUOTES, 'UTF-8'));
        $text = $isHtml ? trim(strip_tags($body)) : $body;
        error_log("EmailService sending via Apps Script to {$to} subject={$subject}");
        Mailer::send($this->appScriptMail, $to, '', $subject, $html, $text);
        return true;
      } catch (Throwable $e) {
        error_log("Apps Script email error: " . $e->getMessage());
        return false;
      }
    }

    if (empty($this->smtpUser) || empty($this->smtpPass)) {
      error_log("SMTP username or password is missing. smtp_user_set=" . ($this->smtpUser !== '' ? 'yes' : 'no') . " smtp_pass_set=" . ($this->smtpPass !== '' ? 'yes' : 'no'));
      return false;
    }

    if ($this->fromEmail === '') {
      error_log("SMTP from email is missing.");
      return false;
    }

    return $this->sendViaSmtp($to, $subject, $body, $isHtml);
  }

  private function sendViaSmtp(string $to, string $subject, string $body, bool $isHtml = false): bool {
    try {
      $mail = new PHPMailer(true);

      $mail->isSMTP();
      $mail->Host = $this->smtpHost;
      $mail->SMTPAuth = true;
      $mail->Username = $this->smtpUser;
      $mail->Password = $this->smtpPass;
      $mail->Port = $this->smtpPort;

      if ($this->smtpSecure === 'ssl') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
      } else {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
      }

      $mail->setFrom($this->fromEmail, $this->fromName);
      $mail->addAddress($to);

      $mail->isHTML($isHtml);
      $mail->Subject = $subject;
      $mail->Body = $body;
      $mail->CharSet = 'UTF-8';

      return $mail->send();
    } catch (Throwable $e) {
      error_log("PHPMailer error: " . $e->getMessage());
      return false;
    }
  }
}
?>
