<?php
declare(strict_types=1);

final class AuthController {
  public static function login(PDO $pdo, array $config): void {
    $body = Http::readJsonBody();
    $email = trim((string)($body['email'] ?? ''));
    $password = (string)($body['password'] ?? '');

    if ($email === '' || $password === '') {
      ActivityLogger::log($pdo, [
        'actor_user_id' => null,
        'action' => 'auth.login_failed',
        'entity_type' => 'user',
        'entity_id' => null,
        'details' => [
          'reason' => 'missing_fields',
          'email' => $email,
        ],
      ]);
      Http::error('Email and password are required', 422);
    }

    $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, (string)$user['password_hash'])) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $user ? (int)$user['id'] : null,
        'action' => 'auth.login_failed',
        'entity_type' => 'user',
        'entity_id' => $user ? (int)$user['id'] : null,
        'details' => [
          'reason' => 'invalid_credentials',
          'email' => $email,
        ],
      ]);
      Http::error('Invalid credentials', 401);
    }

    $now = time();
    $payload = [
      'iss' => $config['jwt']['issuer'],
      'aud' => $config['jwt']['audience'],
      'iat' => $now,
      'exp' => $now + (int)$config['jwt']['expires_in_seconds'],
      'user_id' => (int)$user['id'],
      'name' => (string)$user['name'],
      'email' => (string)$user['email'],
      'role' => (string)$user['role'],
    ];

    $token = Jwt::sign($payload, $config['jwt']['secret']);

    ActivityLogger::log($pdo, [
      'actor_user_id' => (int)$user['id'],
      'action' => 'auth.login_success',
      'entity_type' => 'user',
      'entity_id' => (int)$user['id'],
      'details' => [
        'email' => (string)$user['email'],
        'role' => (string)$user['role'],
      ],
    ]);

    Http::ok([
      'token' => $token,
      'user' => [
        'id' => (int)$user['id'],
        'name' => (string)$user['name'],
        'email' => (string)$user['email'],
        'role' => (string)$user['role'],
      ],
    ]);
  }
}