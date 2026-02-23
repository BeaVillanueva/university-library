<?php
declare(strict_types=1);

final class AuthMiddleware {
  public static function requireAuth(array $appConfig): array {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$auth || !preg_match('/^Bearer\s+(.+)$/i', $auth, $m)) {
      Http::error('Missing Authorization Bearer token', 401);
    }

    $token = trim($m[1]);
    $check = Jwt::verify($token, $appConfig['jwt']['secret']);
    if (!$check['valid']) {
      Http::error('Invalid token: ' . ($check['error'] ?? 'unknown'), 401);
    }

    /** @var array $payload */
    $payload = $check['payload'];
    return $payload; // includes user_id, role, email, name
  }

  public static function requireRole(array $payload, array $roles): void {
    $role = (string)($payload['role'] ?? '');

    // If you want case-insensitive roles, uncomment:
    // $role = strtolower($role);
    // $roles = array_map('strtolower', $roles);

    if (!in_array($role, $roles, true)) {
      Http::error('Forbidden: insufficient role', 403);
    }
  }
}