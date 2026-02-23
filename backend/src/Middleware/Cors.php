<?php
declare(strict_types=1);

final class Cors {
  public static function handle(array $config): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = $config['allowed_origins'] ?? [];

    if ($origin && in_array($origin, $allowed, true)) {
      header("Access-Control-Allow-Origin: {$origin}");
      header('Vary: Origin');
      header('Access-Control-Allow-Credentials: true');
    }

    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
      http_response_code(204);
      exit;
    }
  }
}