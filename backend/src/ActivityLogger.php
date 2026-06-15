<?php
declare(strict_types=1);

final class ActivityLogger {
  public static function log(PDO $pdo, array $event): void {
    // event fields
    $actorUserId = isset($event['actor_user_id']) ? (int)$event['actor_user_id'] : null;
    $action = (string)($event['action'] ?? '');
    $entityType = $event['entity_type'] ?? null;
    $entityId = $event['entity_id'] ?? null;
    $details = $event['details'] ?? null;

    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;

    if ($action === '') return;

    // 1) DB write (best effort)
    try {
      $stmt = $pdo->prepare(
        "INSERT INTO activity_logs (actor_user_id, action, entity_type, entity_id, details_json, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
      );

      $detailsJson = $details === null ? null : json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

      $stmt->execute([
        $actorUserId,
        $action,
        $entityType,
        $entityId,
        $detailsJson,
        $ip,
        $ua ? mb_substr($ua, 0, 255) : null
      ]);
    } catch (Throwable $e) {
      // ignore DB logging errors to avoid breaking main actions
    }

    // 2) File write (best effort)
    try {
      $dir = __DIR__ . '/../storage/logs';
      if (!is_dir($dir)) @mkdir($dir, 0775, true);

      $line = json_encode([
        'ts' => date('c'),
        'actor_user_id' => $actorUserId,
        'action' => $action,
        'entity_type' => $entityType,
        'entity_id' => $entityId,
        'ip' => $ip,
        'ua' => $ua,
        'details' => $details
      ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

      @file_put_contents($dir . '/activity.log', $line . PHP_EOL, FILE_APPEND);
    } catch (Throwable $e) {
      // ignore
    }
  }
}