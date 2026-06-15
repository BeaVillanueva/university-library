<?php
declare(strict_types=1);

final class Database {
  private PDO $pdo;

  public function __construct(array $config) {
    $dsn = sprintf(
      'mysql:host=%s;port=%d;dbname=%s;charset=%s',
      $config['host'],
      (int)$config['port'],
      $config['name'],
      $config['charset'] ?? 'utf8mb4'
    );

    $this->pdo = new PDO($dsn, $config['user'], $config['pass'], [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $timezone = (string)($config['timezone'] ?? '+08:00');
    $this->pdo->exec("SET time_zone = " . $this->pdo->quote($timezone));
  }

  public function pdo(): PDO {
    return $this->pdo;
  }
}
