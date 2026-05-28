<?php
// backend/cron/send_due_reminders.php
// Run this every day at 8 AM: 0 8 * * * php /path/to/send_due_reminders.php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Services/ReminderService.php';
require_once __DIR__ . '/../src/Services/EmailService.php';

$config = require __DIR__ . '/../config/config.php';
date_default_timezone_set($config['app']['timezone'] ?? 'Asia/Manila');
$db = new Database($config['db']);
$pdo = $db->pdo();

$emailService = new EmailService($config['email']);
$reminderService = new ReminderService($pdo, $emailService);

$reminderService->processDueDateReminders();

echo "Due date reminders processed successfully.\n";
?>
