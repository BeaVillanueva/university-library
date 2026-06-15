<?php
declare(strict_types=1);

final class ActivityLogsController {
  public static function list(PDO $pdo, array $config): void {
    $payload = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($payload, ['admin', 'librarian']);

    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = (int)($_GET['limit'] ?? 20);
    if ($limit < 1) $limit = 20;
    if ($limit > 100) $limit = 100;
    $offset = ($page - 1) * $limit;

    $q = trim((string)($_GET['q'] ?? ''));
    $action = trim((string)($_GET['action'] ?? ''));
    $entityType = trim((string)($_GET['entity_type'] ?? ''));

    $where = [];
    $params = [];

    if ($action !== '') {
      $where[] = "l.action = ?";
      $params[] = $action;
    }
    if ($entityType !== '') {
      $where[] = "l.entity_type = ?";
      $params[] = $entityType;
    }
    if ($q !== '') {
      $where[] = "(u.email LIKE ? OR u.name LIKE ? OR l.action LIKE ? OR l.entity_type LIKE ?)";
      $like = '%' . $q . '%';
      array_push($params, $like, $like, $like, $like);
    }

    $whereSql = $where ? ("WHERE " . implode(" AND ", $where)) : "";

    $countStmt = $pdo->prepare(
      "SELECT COUNT(*) AS cnt
       FROM activity_logs l
       LEFT JOIN users u ON u.id = l.actor_user_id
       $whereSql"
    );
    $countStmt->execute($params);
    $total = (int)($countStmt->fetch()['cnt'] ?? 0);
    $totalPages = (int)max(1, (int)ceil($total / $limit));

    $stmt = $pdo->prepare(
      "SELECT
         l.id, l.actor_user_id, l.action, l.entity_type, l.entity_id,
         l.details_json, l.ip_address, l.user_agent, l.created_at,
         u.name AS actor_name, u.email AS actor_email, u.role AS actor_role
       FROM activity_logs l
       LEFT JOIN users u ON u.id = l.actor_user_id
       $whereSql
       ORDER BY l.id DESC
       LIMIT $limit OFFSET $offset"
    );
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    // decode JSON
    foreach ($rows as &$r) {
      $r['details'] = null;
      if (!empty($r['details_json'])) {
        $decoded = json_decode((string)$r['details_json'], true);
        $r['details'] = is_array($decoded) ? $decoded : null;
      }
      unset($r['details_json']);
    }

    Http::ok([
      'items' => $rows,
      'page' => $page,
      'limit' => $limit,
      'total' => $total,
      'total_pages' => $totalPages,
    ]);
  }
}