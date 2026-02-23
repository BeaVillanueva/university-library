<?php
declare(strict_types=1);

return [
  'app' => [
    'env' => 'local',
    'base_url' => 'http://localhost/university-library/backend/public',
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
    // IMPORTANT: change this in production
    'secret' => 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET',
    'issuer' => 'university-library-api',
    'audience' => 'university-library-web',
    'expires_in_seconds' => 60 * 60 * 8, // 8 hours
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
];