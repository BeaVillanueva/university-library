<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

final class Mailer {
  public static function send(array $smtp, string $toEmail, string $toName, string $subject, string $html, string $text = ''): void {
    $mail = new PHPMailer(true);

    try {
      $mail->isSMTP();
      $mail->Host = (string)$smtp['host'];
      $mail->SMTPAuth = true;
      $mail->Username = (string)$smtp['username'];
      $mail->Password = (string)$smtp['password'];

      $secure = (string)($smtp['secure'] ?? 'tls'); // tls|ssl
      $mail->SMTPSecure = $secure === 'ssl'
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;

      $mail->Port = (int)($smtp['port'] ?? 587);

      $fromEmail = (string)$smtp['from_email'];
      $fromName = (string)($smtp['from_name'] ?? $fromEmail);

      $mail->setFrom($fromEmail, $fromName);
      $mail->addAddress($toEmail, $toName !== '' ? $toName : $toEmail);

      $mail->isHTML(true);
      $mail->Subject = $subject;
      $mail->Body = $html;
      $mail->AltBody = $text !== '' ? $text : strip_tags($html);

      $mail->send();
    } catch (Exception $e) {
      throw new RuntimeException('Email send failed: ' . $mail->ErrorInfo);
    }
  }
}