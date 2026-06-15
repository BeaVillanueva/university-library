<?php
declare(strict_types=1);

final class Cors
{
  public static function handle(array $cors): void
  {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    // Allow all localhost/IP during development
    if ($origin) {
      header("Access-Control-Allow-Origin: {$origin}");
      header("Vary: Origin");
      header("Access-Control-Allow-Credentials: true");
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 86400");

    // Handle preflight requests
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
      http_response_code(204);
      exit;
    }
  }
}