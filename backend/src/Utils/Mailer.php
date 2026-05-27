<?php
declare(strict_types=1);

final class Mailer {
  public static function send(array $config, string $toEmail, string $toName, string $subject, string $html, string $text = ''): void {
    $url = trim((string)($config['url'] ?? ''));

    if ($url === '') {
      throw new RuntimeException('Google Apps Script mail URL is not configured.');
    }

    $payload = [
      'secret' => (string)($config['secret'] ?? ''),
      'to' => $toEmail,
      'name' => $toName !== '' ? $toName : $toEmail,
      'subject' => $subject,
      'html' => $html,
      'text' => $text !== '' ? $text : trim(strip_tags($html)),
    ];

    $context = stream_context_create([
      'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => json_encode($payload, JSON_UNESCAPED_SLASHES),
        'ignore_errors' => true,
        'timeout' => 15,
      ],
    ]);

    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
      throw new RuntimeException('Email send failed: Apps Script request failed.');
    }

    $statusLine = $http_response_header[0] ?? '';
    if (!preg_match('/\s2\d\d\s/', $statusLine)) {
      throw new RuntimeException('Email send failed: Apps Script returned ' . ($statusLine ?: 'unknown status') . '.');
    }

    $data = json_decode($response, true);
    if (!is_array($data) || ($data['ok'] ?? false) !== true) {
      $message = is_array($data) && isset($data['error']) ? (string)$data['error'] : 'Unknown Apps Script response.';
      throw new RuntimeException('Email send failed: ' . $message);
    }
  }
}
