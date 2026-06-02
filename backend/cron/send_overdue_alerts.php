<?php
// backend/cron/send_overdue_alerts.php
// Run this every day at 10 AM: 0 10 * * * php /path/to/send_overdue_alerts.php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/ActivityLogger.php';
require_once __DIR__ . '/../src/Utils/Mailer.php';
require_once __DIR__ . '/../src/Services/OverdueService.php';
require_once __DIR__ . '/../src/Services/ReminderService.php';
require_once __DIR__ . '/../src/Services/EmailService.php';

$config = require __DIR__ . '/../config/config.php';
date_default_timezone_set($config['app']['timezone'] ?? 'Asia/Manila');
$db = new Database($config['db']);
$pdo = $db->pdo();

OverdueService::refresh($pdo, $config);

echo "Overdue notifications processed successfully.\n";
?>
