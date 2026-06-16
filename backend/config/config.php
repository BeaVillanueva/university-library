<?php
declare(strict_types=1);

$backendEnv = __DIR__ . '/../.env';
$frontendEnv = __DIR__ . '/../../frontend/.env';
$backendEnvValues = is_file($backendEnv) ? parse_ini_file($backendEnv, false, INI_SCANNER_RAW) : [];
$frontendEnvValues = is_file($frontendEnv) ? parse_ini_file($frontendEnv, false, INI_SCANNER_RAW) : [];

$env = static function (string $key, mixed $default = '') use ($backendEnvValues, $frontendEnvValues): mixed {
  $value = getenv($key);
  if ($value !== false && $value !== '') return $value;
  if (is_array($backendEnvValues) && array_key_exists($key, $backendEnvValues)) {
    return $backendEnvValues[$key];
  }
  if (is_array($frontendEnvValues) && array_key_exists($key, $frontendEnvValues)) {
    return $frontendEnvValues[$key];
  }
  return $default;
};

return [
  'app' => [
    'env' => $env('APP_ENV', 'local'),
    'base_url' => $env('APP_URL', 'http://localhost/university-library/backend/public/index.php'),
    'timezone' => $env('APP_TIMEZONE', 'Asia/Manila'),
  ],

  'frontend' => [
    'base_url' => $env('FRONTEND_URL', 'http://localhost:5173'),
  ],

  'db' => [
    'host' => $env('DB_HOST', '127.0.0.1'),
    'port' => (int)$env('DB_PORT', 3306),
    'name' => $env('DB_DATABASE', 'university_library'),
    'user' => $env('DB_USERNAME', 'root'),
    'pass' => $env('DB_PASSWORD', ''),
    'charset' => 'utf8mb4',
    'timezone' => $env('DB_TIMEZONE', '+08:00'),
  ],

  'jwt' => [
    'secret' => getenv('JWT_SECRET') ?: 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET',
    'issuer' => 'university-library-api',
    'audience' => 'university-library-web',
    'expires_in_seconds' => 60 * 5,
  ],

  'cors' => [
    'allowed_origins' => [
      'http://localhost:5173',
      'https://university-library-one-blush.vercel.app',
      'https://university-library-7xuqu47mu-beatrezvillanueva-7952s-projects.vercel.app',
    ],
  ],

  'library' => [
    'borrow_days' => 14,
    'max_active_borrows_per_student' => 3,
  ],

  'email' => [
    'smtp_host' => $env('SMTP_HOST', 'smtp.gmail.com'),
    'smtp_port' => (int)$env('SMTP_PORT', 587),
    'smtp_secure' => 'tls',
    'smtp_user' => $env('SMTP_USER', ''),
    'smtp_password' => $env('SMTP_PASSWORD', ''),
    'from_email' => $env('FROM_EMAIL', ''),
    'from_name' => $env('FROM_NAME', 'CVSU Imus Library'),
  ],

  'app_script_mail' => [
    'url' => $env('GOOGLE_APPS_SCRIPT_MAIL_URL', ''),
    'secret' => $env('GOOGLE_APPS_SCRIPT_MAIL_SECRET', ''),
  ],

  'reminders' => [
    'enabled' => true,
    'days_before_due' => [3, 1],
    'send_overdue_email' => true,
  ],
];
