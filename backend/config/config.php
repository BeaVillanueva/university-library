<?php
declare(strict_types=1);

return [
  'app' => [
    'env' => getenv('APP_ENV') ?: 'local',
    'base_url' => getenv('APP_URL') ?: 'http://localhost/university-library/backend/public/index.php',
    'timezone' => getenv('APP_TIMEZONE') ?: 'Asia/Manila',
  ],

  'frontend' => [
    'base_url' => getenv('FRONTEND_URL') ?: 'http://localhost:5173',
  ],

  'db' => [
    'host' => getenv('DB_HOST') ?: '127.0.0.1',
    'port' => (int)(getenv('DB_PORT') ?: 3306),
    'name' => getenv('DB_DATABASE') ?: 'university_library',
    'user' => getenv('DB_USERNAME') ?: 'root',
    'pass' => getenv('DB_PASSWORD') ?: '',
    'charset' => 'utf8mb4',
    'timezone' => getenv('DB_TIMEZONE') ?: '+08:00',
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
    'borrow_days' => 1,
    'max_active_borrows_per_student' => 3,
  ],

  'email' => [
    'smtp_host' => getenv('SMTP_HOST') ?: 'smtp.gmail.com',
    'smtp_port' => (int)(getenv('SMTP_PORT') ?: 587),
    'smtp_secure' => 'tls',
    'smtp_user' => getenv('SMTP_USER') ?: '',
    'smtp_password' => getenv('SMTP_PASSWORD') ?: '',
    'from_email' => getenv('FROM_EMAIL') ?: '',
    'from_name' => getenv('FROM_NAME') ?: 'CVSU Imus Library',
  ],

  'app_script_mail' => [
    'url' => getenv('GOOGLE_APPS_SCRIPT_MAIL_URL') ?: '',
    'secret' => getenv('GOOGLE_APPS_SCRIPT_MAIL_SECRET') ?: '',
  ],

  'reminders' => [
    'enabled' => true,
    'days_before_due' => [3, 1],
    'send_overdue_email' => true,
  ],
];
