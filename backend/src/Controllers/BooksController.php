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

  /**
   * ✅ Create new book (Admin/Librarian only)
   * POST /books
   * If ISBN already exists -> 409 (do NOT override stock)
   */
  public static function create(PDO $pdo, array $auth): void {
    AuthMiddleware::requireRole($auth, ['admin','librarian']);

    $b = Http::readJsonBody();

    $title = trim((string)($b['title'] ?? ''));
    $author = trim((string)($b['author'] ?? ''));
    $isbn = trim((string)($b['isbn'] ?? ''));

    $categoryId = (array_key_exists('category_id', $b) && $b['category_id'] !== '' && $b['category_id'] !== null)
      ? (int)$b['category_id']
      : null;

    $year = (array_key_exists('year', $b) && $b['year'] !== '' && $b['year'] !== null)
      ? (int)$b['year']
      : null;

    $description = (string)($b['description'] ?? '');
    $copiesTotal = (int)($b['copies_total'] ?? 1);
    $shelf = trim((string)($b['shelf_location'] ?? ''));

    if ($title === '') Http::error('Title is required', 422);
    if ($copiesTotal < 0) Http::error('Copies must be 0 or more', 422);

    // ✅ prevent override: if ISBN exists, block create
    if ($isbn !== '') {
      $chk = $pdo->prepare("SELECT id, title, copies_total, copies_available FROM books WHERE isbn = ? LIMIT 1");
      $chk->execute([$isbn]);
      $existing = $chk->fetch();

      if ($existing) {
        Http::error('Book already exists in the book list. Use Add Stock instead.', 409, [
          'existing_book_id' => (int)$existing['id'],
          'existing_title' => (string)($existing['title'] ?? ''),
          'copies_total' => (int)($existing['copies_total'] ?? 0),
          'copies_available' => (int)($existing['copies_available'] ?? 0),
        ]);
      }
    }

    try {
      $ins = $pdo->prepare("
        INSERT INTO books (title, author, isbn, category_id, year, description, copies_total, copies_available, shelf_location)
        VALUES (?,?,?,?,?,?,?,?,?)
      ");
      $ins->execute([
        $title,
        $author !== '' ? $author : null,
        $isbn !== '' ? $isbn : null,
        $categoryId,
        $year,
        $description !== '' ? $description : null,
        $copiesTotal,
        $copiesTotal,
        $shelf !== '' ? $shelf : null,
      ]);

      $newId = (int)$pdo->lastInsertId();

      ActivityLogger::log($pdo, [
        'actor_user_id' => (int)($auth['user_id'] ?? 0) ?: null,
        'action' => 'book.create',
        'entity_type' => 'book',
        'entity_id' => $newId,
        'details' => [
          'title' => $title,
          'isbn' => $isbn,
          'copies_total' => $copiesTotal,
        ],
      ]);

      Http::ok(['message' => 'Book created', 'book_id' => $newId], 201);
    } catch (PDOException $e) {
      Http::error('Failed to create book (ISBN may already exist)', 409);
    }
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

    // If copies_total is being updated, enforce:
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

  /**
   * ✅ Add stock (Librarian/Admin)
   * POST /books/{id}/stock  body: { qty: number }
   * Increases copies_total AND copies_available by qty.
   */
  public static function addStock(PDO $pdo, array $auth, int $id): void {
    AuthMiddleware::requireRole($auth, ['admin','librarian']);

    $b = Http::readJsonBody();
    $qty = (int)($b['qty'] ?? 0);
    if ($qty <= 0) Http::error('qty must be greater than 0', 422);

    $stmt = $pdo->prepare("SELECT id, title FROM books WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $book = $stmt->fetch();
    if (!$book) Http::error('Book not found', 404);

    $upd = $pdo->prepare("
      UPDATE books
      SET copies_total = copies_total + ?,
          copies_available = copies_available + ?
      WHERE id = ?
    ");
    $upd->execute([$qty, $qty, $id]);

    ActivityLogger::log($pdo, [
      'actor_user_id' => (int)($auth['user_id'] ?? 0),
      'action' => 'book.add_stock',
      'entity_type' => 'book',
      'entity_id' => $id,
      'details' => [
        'qty' => $qty,
        'title' => (string)($book['title'] ?? ''),
      ],
    ]);

    Http::ok(['message' => 'Stock added', 'book_id' => $id, 'qty' => $qty]);
  }
}