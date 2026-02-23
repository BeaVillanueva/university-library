<?php
declare(strict_types=1);

final class BorrowController {
  public static function borrow(PDO $pdo, array $config, array $auth): void {
    OverdueService::refresh($pdo);

    $b = Http::readJsonBody();
    $bookId = (int)($b['book_id'] ?? 0);
    if ($bookId <= 0) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => (int)($auth['user_id'] ?? 0) ?: null,
        'action' => 'borrow.borrow_failed',
        'entity_type' => 'borrow',
        'entity_id' => null,
        'details' => [
          'reason' => 'book_id_required',
        ],
      ]);
      Http::error('book_id required', 422);
    }

    $userId = (int)$auth['user_id'];

    // Borrow limit (students only)
    $role = (string)($auth['role'] ?? '');
    if ($role === 'student') {
      $stmt = $pdo->prepare("
        SELECT COUNT(*) AS c
        FROM borrow_records
        WHERE user_id = ?
          AND return_date IS NULL
          AND status IN ('borrowed','overdue')
      ");
      $stmt->execute([$userId]);
      $active = (int)($stmt->fetch()['c'] ?? 0);
      $max = (int)$config['library']['max_active_borrows_per_student'];

      if ($active >= $max) {
        ActivityLogger::log($pdo, [
          'actor_user_id' => $userId,
          'action' => 'borrow.borrow_failed',
          'entity_type' => 'borrow',
          'entity_id' => null,
          'details' => [
            'reason' => 'borrow_limit_reached',
            'max_active' => $max,
            'active' => $active,
            'book_id' => $bookId,
          ],
        ]);
        Http::error('Borrow limit reached', 409, ['max_active' => $max]);
      }
    }

    // Check book availability (also fetch title for logs)
    $stmtBook = $pdo->prepare("SELECT id, title, copies_available FROM books WHERE id = ? LIMIT 1");
    $stmtBook->execute([$bookId]);
    $book = $stmtBook->fetch();

    if (!$book) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.borrow_failed',
        'entity_type' => 'book',
        'entity_id' => $bookId,
        'details' => [
          'reason' => 'book_not_found',
          'book_id' => $bookId,
        ],
      ]);
      Http::error('Book not found', 404);
    }

    if ((int)$book['copies_available'] <= 0) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.borrow_failed',
        'entity_type' => 'book',
        'entity_id' => (int)$book['id'],
        'details' => [
          'reason' => 'no_copies_available',
          'book_id' => (int)$book['id'],
          'book_title' => (string)($book['title'] ?? ''),
          'copies_available' => (int)$book['copies_available'],
        ],
      ]);
      Http::error('No copies available', 409);
    }

    $borrowDate = date('Y-m-d');
    $dueDate = date('Y-m-d', strtotime('+' . (int)$config['library']['borrow_days'] . ' days'));

    $pdo->beginTransaction();
    try {
      // Insert record
      $ins = $pdo->prepare("
        INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status)
        VALUES (?,?,?,?, 'borrowed')
      ");
      $ins->execute([$userId, $bookId, $borrowDate, $dueDate]);

      $recordId = (int)$pdo->lastInsertId();

      // Decrement available
      $upd = $pdo->prepare("UPDATE books SET copies_available = copies_available - 1 WHERE id = ? AND copies_available > 0");
      $upd->execute([$bookId]);
      if ($upd->rowCount() !== 1) {
        throw new RuntimeException('Failed to decrement availability');
      }

      $pdo->commit();

      // Log success
      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.borrow',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => [
          'book_id' => (int)$book['id'],
          'book_title' => (string)($book['title'] ?? ''),
          'borrow_date' => $borrowDate,
          'due_date' => $dueDate,
        ],
      ]);
    } catch (Throwable $e) {
      $pdo->rollBack();

      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.borrow_failed',
        'entity_type' => 'borrow',
        'entity_id' => null,
        'details' => [
          'reason' => 'exception',
          'book_id' => $bookId,
          'error' => $e->getMessage(),
        ],
      ]);

      Http::error('Borrow failed: ' . $e->getMessage(), 500);
    }

    Http::ok(['message' => 'Borrowed', 'due_date' => $dueDate], 201);
  }

  public static function returnBook(PDO $pdo, array $auth, int $recordId): void {
    OverdueService::refresh($pdo);

    // Librarian/Admin can return any; student can return their own (optional)
    $role = (string)($auth['role'] ?? '');
    $userId = (int)$auth['user_id'];

    // Join book/user for readable logs
    $stmt = $pdo->prepare("
      SELECT br.*, b.title AS book_title, u.name AS borrower_name, u.email AS borrower_email
      FROM borrow_records br
      JOIN books b ON b.id = br.book_id
      JOIN users u ON u.id = br.user_id
      WHERE br.id = ?
      LIMIT 1
    ");
    $stmt->execute([$recordId]);
    $rec = $stmt->fetch();

    if (!$rec) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.return_failed',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => [
          'reason' => 'record_not_found',
        ],
      ]);
      Http::error('Record not found', 404);
    }

    if ($rec['return_date'] !== null) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.return_failed',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => [
          'reason' => 'already_returned',
        ],
      ]);
      Http::error('Already returned', 409);
    }

    if ($role === 'student' && (int)$rec['user_id'] !== $userId) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.return_failed',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => [
          'reason' => 'forbidden',
          'borrower_user_id' => (int)$rec['user_id'],
        ],
      ]);
      Http::error('Forbidden', 403);
    }

    $pdo->beginTransaction();
    try {
      $retDate = date('Y-m-d');
      $upd = $pdo->prepare("UPDATE borrow_records SET return_date = ?, status = 'returned' WHERE id = ? AND return_date IS NULL");
      $upd->execute([$retDate, $recordId]);

      $bookId = (int)$rec['book_id'];
      $upd2 = $pdo->prepare("UPDATE books SET copies_available = copies_available + 1 WHERE id = ?");
      $upd2->execute([$bookId]);

      $pdo->commit();

      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.return',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => [
          'book_id' => (int)$rec['book_id'],
          'book_title' => (string)($rec['book_title'] ?? ''),
          'borrower_user_id' => (int)$rec['user_id'],
          'borrower_name' => (string)($rec['borrower_name'] ?? ''),
          'borrower_email' => (string)($rec['borrower_email'] ?? ''),
          'return_date' => $retDate,
        ],
      ]);
    } catch (Throwable $e) {
      $pdo->rollBack();

      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.return_failed',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => [
          'reason' => 'exception',
          'error' => $e->getMessage(),
        ],
      ]);

      Http::error('Return failed: ' . $e->getMessage(), 500);
    }

    Http::ok(['message' => 'Returned']);
  }

  public static function myHistory(PDO $pdo, array $auth): void {
    OverdueService::refresh($pdo);

    $userId = (int)$auth['user_id'];
    $page = Query::int('page', 1, 1);
    $limit = Query::int('limit', 10, 1, 100);
    $offset = ($page - 1) * $limit;

    $countStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM borrow_records WHERE user_id = ?");
    $countStmt->execute([$userId]);
    $total = (int)($countStmt->fetch()['c'] ?? 0);

    $stmt = $pdo->prepare("
      SELECT br.*, b.title, b.author, b.isbn
      FROM borrow_records br
      JOIN books b ON b.id = br.book_id
      WHERE br.user_id = ?
      ORDER BY br.id DESC
      LIMIT $limit OFFSET $offset
    ");
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll();

    Http::ok([
      'items' => $items,
      'page' => $page,
      'limit' => $limit,
      'total' => $total,
      'total_pages' => (int)ceil($total / $limit),
    ]);
  }

  public static function listAll(PDO $pdo): void {
    OverdueService::refresh($pdo);

    $status = Query::str('status', ''); // borrowed|returned|overdue|''
    $from = Query::date('from');
    $to = Query::date('to');

    $page = Query::int('page', 1, 1);
    $limit = Query::int('limit', 10, 1, 100);
    $offset = ($page - 1) * $limit;

    $where = [];
    $params = [];

    if ($status !== '') { $where[] = "br.status = ?"; $params[] = $status; }
    if ($from) { $where[] = "br.borrow_date >= ?"; $params[] = $from; }
    if ($to) { $where[] = "br.borrow_date <= ?"; $params[] = $to; }

    $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

    $countStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM borrow_records br $whereSql");
    $countStmt->execute($params);
    $total = (int)($countStmt->fetch()['c'] ?? 0);

    $stmt = $pdo->prepare("
      SELECT br.*, u.name AS user_name, u.email AS user_email, b.title, b.isbn
      FROM borrow_records br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      $whereSql
      ORDER BY br.id DESC
      LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);

    Http::ok([
      'items' => $stmt->fetchAll(),
      'page' => $page,
      'limit' => $limit,
      'total' => $total,
      'total_pages' => (int)ceil($total / $limit),
    ]);
  }
}