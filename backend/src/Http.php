<?php
declare(strict_types=1);

final class Http {
  public static function json(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
  }

  public static function error(string $message, int $status = 400, array $extra = []): void {
    self::json(array_merge([
      'ok' => false,
      'error' => $message,
    ], $extra), $status);
  }

  public static function ok(array $data = [], int $status = 200): void {
    self::json(array_merge(['ok' => true], $data), $status);
  }

  public static function readJsonBody(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
  }
}