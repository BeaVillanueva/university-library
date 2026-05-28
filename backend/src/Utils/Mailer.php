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

    [$statusLine, $response] = self::postJson($url, $payload);

    if (!preg_match('/\s2\d\d(?:\s|$)/', $statusLine)) {
      throw new RuntimeException('Email send failed: Apps Script returned ' . ($statusLine ?: 'unknown status') . '.');
    }

    $data = json_decode($response, true);
    if (!is_array($data) || ($data['ok'] ?? false) !== true) {
      $message = is_array($data) && isset($data['error']) ? (string)$data['error'] : 'Unknown Apps Script response.';
      throw new RuntimeException('Email send failed: ' . $message);
    }
  }

  private static function postJson(string $url, array $payload): array {
    $json = json_encode($payload, JSON_UNESCAPED_SLASHES);
    if ($json === false) {
      throw new RuntimeException('Email send failed: Unable to encode request.');
    }

    if (function_exists('curl_init')) {
      $ch = curl_init($url);
      if ($ch === false) {
        throw new RuntimeException('Email send failed: Unable to initialize cURL.');
      }

      curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => $json,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 20,
      ]);

      $response = curl_exec($ch);
      $statusCode = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
      $err = curl_error($ch);
      curl_close($ch);

      if ($response === false) {
        throw new RuntimeException('Email send failed: Apps Script request failed' . ($err ? " ({$err})" : '') . '.');
      }

      return ['HTTP/1.1 ' . $statusCode, (string)$response];
    }

    $context = stream_context_create([
      'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $json,
        'ignore_errors' => true,
        'timeout' => 15,
      ],
    ]);

    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
      $err = error_get_last();
      $message = is_array($err) && isset($err['message']) ? (string)$err['message'] : '';
      throw new RuntimeException('Email send failed: Apps Script request failed' . ($message ? " ({$message})" : '') . '.');
    }

    return [$http_response_header[0] ?? '', (string)$response];
  }
}
