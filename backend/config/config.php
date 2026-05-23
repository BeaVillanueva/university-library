<?php
declare(strict_types=1);

return [
  'app' => [
    'env' => 'local',
    'base_url' => 'http://localhost/university-library/backend/public/index.php',
  ],

  // ✅ ADD THIS (frontend URL for reset link)
  'frontend' => [
    'base_url' => 'http://localhost:5173',
  ],

  // ✅ ADD THIS (Gmail SMTP)
  'smtp' => [
    'host' => 'smtp.gmail.com',
    'port' => 587,
    'secure' => 'tls',
    'username' => 'vbea011@gmail.com',
    'password' => 'bfmlpfriqzifyxgt',
    'from_email' => 'vbea011@gmail.com',
    'from_name' => 'CVSU Imus Library',
  ],

  'db' => [
    'host' => '127.0.0.1',
    'port' => 3306,<?php
declare(strict_types=1);

return [

  'app' => [
    'env' => 'local',
    'base_url' => 'http://localhost/university-library/backend/public/index.php',
  ],

  // Frontend URL (used for reset password links)
  'frontend' => [
    'base_url' => 'http://localhost:5173',
  ],

  'db' => [
    'host' => '127.0.0.1',
    'port' => 3306,
    'name' => 'university_library',
    'user' => 'root',
    'pass' => '',
    'charset' => 'utf8mb4',
  ],

  'jwt' => [
    'secret' => 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET',
    'issuer' => 'university-library-api',
    'audience' => 'university-library-web',
    'expires_in_seconds' => 60 * 5,
  ],

  'cors' => [
    'allowed_origins' => [
      'http://localhost:5173',
    ],
  ],

  'library' => [
    'borrow_days' => 14,
    'max_active_borrows_per_student' => 3,
  ],

  // EMAIL CONFIG
  // Used for:
  // - Reset Password
  // - Due Date Reminder
  // - Overdue Alerts
  'email' => [
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_secure' => 'tls',

    'smtp_user' => 'vbea011@gmail.com',
    'smtp_password' => 'bfmlpfriqzifyxgt',

    'from_email' => 'vbea011@gmail.com',
    'from_name' => 'CVSU Imus Library',
  ],

  // Borrowing reminders
  'reminders' => [
    'enabled' => true,

    // Notify 3 days and 1 day before due date
    'days_before_due' => [3, 1],

    // Enable overdue emails
    'send_overdue_email' => true,
  ],

];
    'name' => 'university_library',
    'user' => 'root',
    'pass' => '',
    'charset' => 'utf8mb4',
  ],
  'jwt' => [
    'secret' => 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET',
    'issuer' => 'university-library-api',
    'audience' => 'university-library-web',
    'expires_in_seconds' => 60 * 5, // 5 minutes
  ],
  'cors' => [
    'allowed_origins' => [
      'http://localhost:5173',
    ],
  ],
  'library' => [
    'borrow_days' => 14,
    'max_active_borrows_per_student' => 3,
  ],

  'email' => [
    'smtp_host' => getenv('SMTP_HOST') ?: 'localhost',
    'smtp_port' => (int)(getenv('SMTP_PORT') ?: 587),
    'smtp_user' => getenv('SMTP_USER') ?: '',
    'smtp_password' => getenv('SMTP_PASSWORD') ?: '',
    'from_email' => getenv('FROM_EMAIL') ?: 'noreply@university.local',
    'from_name' => getenv('FROM_NAME') ?: 'University Library',
  ],

  'reminders' => [
    'enabled' => true,
    'days_before_due' => [1, 3],
  ],
  
];