<?php
declare(strict_types=1);

final class ReportsController {
  public static function summary(PDO $pdo): void {
    OverdueService::refresh($pdo);

    $totalBooks = (int)($pdo->query("SELECT COUNT(*) AS c FROM books")->fetch()['c'] ?? 0);
    $availableCopies = (int)($pdo->query("SELECT COALESCE(SUM(copies_available),0) AS s FROM books")->fetch()['s'] ?? 0);
    $totalCopies = (int)($pdo->query("SELECT COALESCE(SUM(copies_total),0) AS s FROM books")->fetch()['s'] ?? 0);

    $borrowed = (int)($pdo->query("SELECT COUNT(*) AS c FROM borrow_records WHERE status = 'borrowed' AND return_date IS NULL")->fetch()['c'] ?? 0);
    $overdue = (int)($pdo->query("SELECT COUNT(*) AS c FROM borrow_records WHERE status = 'overdue' AND return_date IS NULL")->fetch()['c'] ?? 0);
    $returned = (int)($pdo->query("SELECT COUNT(*) AS c FROM borrow_records WHERE status = 'returned'")->fetch()['c'] ?? 0);

    Http::ok([
      'kpis' => [
        'total_books' => $totalBooks,
        'total_copies' => $totalCopies,
        'available_copies' => $availableCopies,
        'borrowed_active' => $borrowed,
        'overdue_active' => $overdue,
        'returned_total' => $returned,
      ],
    ]);
  }

  /**
   * Student-only KPI summary (personal stats)
   * Expects $auth payload to include: user_id
   */
  public static function mySummary(PDO $pdo, array $auth): void {
    OverdueService::refresh($pdo);

    $userId = (int)($auth['user_id'] ?? 0);
    if ($userId <= 0) {
      Http::error('Invalid user', 401);
    }

    $stmt = $pdo->prepare("
      SELECT COUNT(*) AS c
      FROM borrow_records
      WHERE user_id = ?
        AND status IN ('borrowed','overdue','returned')
    ");
    $stmt->execute([$userId]);
    $myTotalBorrowed = (int)($stmt->fetch()['c'] ?? 0);

    $stmt = $pdo->prepare("
      SELECT COUNT(*) AS c
      FROM borrow_records
      WHERE user_id = ?
        AND status IN ('borrowed','overdue')
        AND return_date IS NULL
    ");
    $stmt->execute([$userId]);
    $myBorrowedActive = (int)($stmt->fetch()['c'] ?? 0);

    $stmt = $pdo->prepare("
      SELECT COUNT(*) AS c
      FROM borrow_records
      WHERE user_id = ?
        AND status = 'overdue'
        AND return_date IS NULL
    ");
    $stmt->execute([$userId]);
    $myOverdueActive = (int)($stmt->fetch()['c'] ?? 0);

    $stmt = $pdo->prepare("
      SELECT COUNT(*) AS c
      FROM borrow_records
      WHERE user_id = ?
        AND status = 'returned'
    ");
    $stmt->execute([$userId]);
    $myReturnedTotal = (int)($stmt->fetch()['c'] ?? 0);

    Http::ok([
      'kpis' => [
        'my_total_borrowed' => $myTotalBorrowed,
        'my_borrowed_active' => $myBorrowedActive,
        'my_overdue_active' => $myOverdueActive,
        'my_returned_total' => $myReturnedTotal,
      ],
    ]);
  }

  /**
   * NEW: Pie chart distribution for Admin/Librarian.
   * Uses your existing column names:
   * - books.copies_available
   * - borrow_records.status and borrow_records.return_date
   */
  public static function distribution(PDO $pdo, array $auth): void {
    OverdueService::refresh($pdo);

    $available = (int)($pdo->query("
      SELECT COALESCE(SUM(copies_available), 0) AS s
      FROM books
    ")->fetch()['s'] ?? 0);

    $borrowedActive = (int)($pdo->query("
      SELECT COUNT(*) AS c
      FROM borrow_records
      WHERE status = 'borrowed' AND return_date IS NULL
    ")->fetch()['c'] ?? 0);

    $overdueActive = (int)($pdo->query("
      SELECT COUNT(*) AS c
      FROM borrow_records
      WHERE status = 'overdue' AND return_date IS NULL
    ")->fetch()['c'] ?? 0);

    Http::ok([
      'distribution' => [
        'available' => $available,
        'borrowed_active' => $borrowedActive,
        'overdue_active' => $overdueActive,
      ],
    ]);
  }

  /**
   * NEW: Weekly borrows trend (Admin/Librarian).
   * Uses your existing column name borrow_records.borrow_date.
   * Returns last 7 days including today.
   */
  public static function weeklyBorrows(PDO $pdo, array $auth): void {
    $today = new DateTimeImmutable('today');

    $start = $today->sub(new DateInterval('P6D'))->format('Y-m-d');
    $end = $today->add(new DateInterval('P1D'))->format('Y-m-d'); // exclusive end

    $stmt = $pdo->prepare("
      SELECT DATE(borrow_date) AS d, COUNT(*) AS c
      FROM borrow_records
      WHERE borrow_date >= ? AND borrow_date < ?
      GROUP BY DATE(borrow_date)
      ORDER BY d ASC
    ");
    $stmt->execute([$start, $end]);
    $rows = $stmt->fetchAll();

    $map = [];
    foreach ($rows as $r) {
      $map[(string)$r['d']] = (int)$r['c'];
    }

    $labels = [];
    $data = [];
    for ($i = 6; $i >= 0; $i--) {
      $day = $today->sub(new DateInterval('P' . $i . 'D'));
      $key = $day->format('Y-m-d');
      $labels[] = $day->format('D'); // Mon Tue...
      $data[] = $map[$key] ?? 0;
    }

    Http::ok([
      'trend' => [
        'labels' => $labels,
        'data' => $data,
      ],
    ]);
  }

  /**
   * NEW: Weekly borrows trend for Student (only their borrows).
   */
  public static function myWeeklyBorrows(PDO $pdo, array $auth): void {
    $userId = (int)($auth['user_id'] ?? 0);
    if ($userId <= 0) Http::error('Invalid user', 401);

    $today = new DateTimeImmutable('today');
    $start = $today->sub(new DateInterval('P6D'))->format('Y-m-d');
    $end = $today->add(new DateInterval('P1D'))->format('Y-m-d'); // exclusive end

    $stmt = $pdo->prepare("
      SELECT DATE(borrow_date) AS d, COUNT(*) AS c
      FROM borrow_records
      WHERE user_id = ? AND borrow_date >= ? AND borrow_date < ?
      GROUP BY DATE(borrow_date)
      ORDER BY d ASC
    ");
    $stmt->execute([$userId, $start, $end]);
    $rows = $stmt->fetchAll();

    $map = [];
    foreach ($rows as $r) {
      $map[(string)$r['d']] = (int)$r['c'];
    }

    $labels = [];
    $data = [];
    for ($i = 6; $i >= 0; $i--) {
      $day = $today->sub(new DateInterval('P' . $i . 'D'));
      $key = $day->format('Y-m-d');
      $labels[] = $day->format('D');
      $data[] = $map[$key] ?? 0;
    }

    Http::ok([
      'trend' => [
        'labels' => $labels,
        'data' => $data,
      ],
    ]);
  }

    /**
   * NEW: Student statistics (Admin/Librarian)
   * - total approved students
   * - approved students grouped by course/department
   */
  public static function studentStats(PDO $pdo): void {
    // total approved students
    $stmt = $pdo->prepare("
      SELECT COUNT(*) AS c
      FROM users
      WHERE role = 'student' AND status = 'approved'
    ");
    $stmt->execute();
    $totalApproved = (int)($stmt->fetch()['c'] ?? 0);

    // by course/department (approved students only)
    $stmt2 = $pdo->prepare("
      SELECT COALESCE(department,'(No department)') AS department, COUNT(*) AS c
      FROM users
      WHERE role = 'student' AND status = 'approved'
      GROUP BY COALESCE(department,'(No department)')
      ORDER BY c DESC, department ASC
      LIMIT 20
    ");
    $stmt2->execute();
    $rows = $stmt2->fetchAll();

    $items = [];
    foreach ($rows as $r) {
      $items[] = [
        'department' => (string)$r['department'],
        'count' => (int)$r['c'],
      ];
    }

    Http::ok([
      'total_students_approved' => $totalApproved,
      'students_by_course' => $items,
    ]);
  }

  public static function list(PDO $pdo): void {
    OverdueService::refresh($pdo);

    $type = Query::str('type', 'borrowed'); // borrowed|returned|overdue
    $from = Query::date('from');
    $to = Query::date('to');

    if (!in_array($type, ['borrowed','returned','overdue'], true)) {
      Http::error('Invalid report type', 422);
    }

    $where = ["br.status = ?"];
    $params = [$type];

    if ($from) { $where[] = "br.borrow_date >= ?"; $params[] = $from; }
    if ($to) { $where[] = "br.borrow_date <= ?"; $params[] = $to; }

    $whereSql = 'WHERE ' . implode(' AND ', $where);

    $stmt = $pdo->prepare("
      SELECT br.id, br.user_id, u.name AS user_name, u.email AS user_email,
             br.book_id, b.title AS book_title, b.isbn,
             br.borrow_date, br.due_date, br.return_date, br.status
      FROM borrow_records br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      $whereSql
      ORDER BY br.id DESC
    ");
    $stmt->execute($params);
    Http::ok(['items' => $stmt->fetchAll()]);
  }

  public static function exportCsv(PDO $pdo): void {
    OverdueService::refresh($pdo);

    $type = Query::str('type', 'borrowed');
    $from = Query::date('from');
    $to = Query::date('to');

    if (!in_array($type, ['borrowed','returned','overdue'], true)) {
      Http::error('Invalid report type', 422);
    }

    $where = ["br.status = ?"];
    $params = [$type];

    if ($from) { $where[] = "br.borrow_date >= ?"; $params[] = $from; }
    if ($to) { $where[] = "br.borrow_date <= ?"; $params[] = $to; }

    $whereSql = 'WHERE ' . implode(' AND ', $where);

    $stmt = $pdo->prepare("
      SELECT br.id, u.name AS user_name, u.email AS user_email,
             b.title AS book_title, b.isbn,
             br.borrow_date, br.due_date, br.return_date, br.status
      FROM borrow_records br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      $whereSql
      ORDER BY br.id DESC
    ");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $headers = ['id','user_name','user_email','book_title','isbn','borrow_date','due_date','return_date','status'];
    $filename = "report_{$type}_" . date('Ymd_His') . ".csv";
    Csv::outputDownload($filename, $headers, $rows);
  }
}