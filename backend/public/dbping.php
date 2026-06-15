<?php
declare(strict_types=1);

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/../src/Database.php';

$config = require __DIR__ . '/../config/config.php';

try {
  $db = new Database($config['db']);
  $pdo = $db->pdo();
  $stmt = $pdo->query("SELECT 1 AS ok");
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  header('Content-Type: application/json');
  echo json_encode(['ok' => true, 'result' => $row]);
} catch (Throwable $e) {
  header('Content-Type: application/json', true, 500);
  echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}