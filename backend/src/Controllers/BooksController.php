<?php
declare(strict_types=1);

final class BooksController {
  public static function list(PDO $pdo): void {
    $page = Query::int('page', 1, 1);
    $limit = Query::int('limit', 10, 1, 100);
    $offset = ($page - 1) * $limit;

    $q = Query::str('q', '');
    $categoryId = Query::int('category_id', 0, 0);
    $availability = Query::str('availability', ''); // 'available' | 'unavailable' | ''

    $where = [];
    $params = [];

    if ($q !== '') {
      $where[] = "(b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)";
      $like = '%' . $q . '%';
      $params[] = $like; $params[] = $like; $params[] = $like;
    }

    if ($categoryId > 0) {
      $where[] = "b.category_id = ?";
      $params[] = $categoryId;
    }

    if ($availability === 'available') $where[] = "b.copies_available > 0";
    if ($availability === 'unavailable') $where[] = "b.copies_available <= 0";

    $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

    $countStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM books b $whereSql");
    $countStmt->execute($params);
    $total = (int)($countStmt->fetch()['c'] ?? 0);

    $sql = "
      SELECT
        b.id, b.title, b.author, b.isbn, b.year, b.description,
        b.copies_total, b.copies_available, b.shelf_location, b.created_at,
        b.category_id, c.name AS category_name
      FROM books b
      LEFT JOIN categories c ON c.id = b.category_id
      $whereSql
      ORDER BY b.id DESC
      LIMIT $limit OFFSET $offset
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $items = $stmt->fetchAll();

    Http::ok([
      'items' => $items,
      'page' => $page,
      'limit' => $limit,
      'total' => $total,
      'total_pages' => (int)ceil($total / $limit),
    ]);
  }

  public static function get(PDO $pdo, int $id): void {
    $stmt = $pdo->prepare("
      SELECT b.*, c.name AS category_name
      FROM books b
      LEFT JOIN categories c ON c.id = b.category_id
      WHERE b.id = ?
      LIMIT 1
    ");
    $stmt->execute([$id]);
    $book = $stmt->fetch();
    if (!$book) Http::error('Book not found', 404);
    Http::ok(['book' => $book]);
  }

  public static function update(PDO $pdo, int $id): void {
    $b = Http::readJsonBody();

    $fields = [];
    $params = [];

    $allow = ['title','author','isbn','year','description','copies_total','shelf_location','category_id'];
    foreach ($allow as $key) {
      if (!array_key_exists($key, $b)) continue;
      $fields[] = "$key = ?";
      $params[] = $b[$key];
    }

    if (!$fields) Http::error('No fields to update', 422);

    // If copies_total is being updated, enforce Option A rule:
    // copies_available = copies_total - currently_borrowed (borrowed+overdue)
    $updatingCopiesTotal = array_key_exists('copies_total', $b);
    if ($updatingCopiesTotal) {
      $newTotal = (int)$b['copies_total'];
      if ($newTotal < 0) Http::error('copies_total must be >= 0', 422);

      $stmtBorrowed = $pdo->prepare("
        SELECT COUNT(*) AS c
        FROM borrow_records
        WHERE book_id = ?
          AND return_date IS NULL
          AND status IN ('borrowed','overdue')
      ");
      $stmtBorrowed->execute([$id]);
      $borrowedCount = (int)($stmtBorrowed->fetch()['c'] ?? 0);

      $newAvailable = max(0, $newTotal - $borrowedCount);

      $fields[] = "copies_available = ?";
      $params[] = $newAvailable;
    }

    $params[] = $id;

    try {
      $stmt = $pdo->prepare("UPDATE books SET " . implode(', ', $fields) . " WHERE id = ?");
      $stmt->execute($params);
      Http::ok();
    } catch (PDOException $e) {
      Http::error('Failed to update book (ISBN may already exist)', 409);
    }
  }
}