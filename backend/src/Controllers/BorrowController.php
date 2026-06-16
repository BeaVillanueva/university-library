<?php
declare(strict_types=1);

final class BorrowController {
  private static function nextLibraryPickupDate(DateTimeImmutable $approvedAt): DateTimeImmutable {
    $startDate = $approvedAt->modify('+1 day');
    if ($startDate->format('w') === '0') {
      $startDate = $startDate->modify('+1 day');
    }
    return $startDate;
  }

  private static function addLibraryDaysSkippingSundays(DateTimeImmutable $startDate, int $libraryDays): DateTimeImmutable {
    $date = $startDate;
    $countedDays = 0;

    while ($countedDays < $libraryDays) {
      $date = $date->modify('+1 day');
      if ($date->format('w') !== '0') {
        $countedDays++;
      }
    }

    return $date;
  }

  private static function formatEmailDate(string $date): string {
    $parsed = DateTimeImmutable::createFromFormat('Y-m-d', $date);
    return $parsed instanceof DateTimeImmutable ? $parsed->format('F j, Y') : $date;
  }

  private static function sendApprovalEmail(PDO $pdo, array $config, int $recordId): bool {
    $stmt = $pdo->prepare("
      SELECT
        br.id,
        br.approval_date,
        br.borrow_date,
        br.due_date,
        br.approval_email_sent,
        u.name AS student_name,
        u.email AS student_email,
        b.title AS book_title
      FROM borrow_records br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      WHERE br.id = ?
        AND br.status = 'borrowed'
      LIMIT 1
    ");
    $stmt->execute([$recordId]);
    $record = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$record || (int)($record['approval_email_sent'] ?? 0) === 1) {
      return false;
    }

    $studentEmail = trim((string)($record['student_email'] ?? ''));
    if ($studentEmail === '') {
      return false;
    }

    $studentName = trim((string)($record['student_name'] ?? 'Student')) ?: 'Student';
    $bookTitle = (string)($record['book_title'] ?? 'Untitled book');
    $approvalDate = (string)($record['approval_date'] ?? '');
    $startDate = (string)($record['borrow_date'] ?? '');
    $dueDate = (string)($record['due_date'] ?? '');

    $subject = "Borrow Request Approved - CVSU Imus Library";
    $body = "Dear {$studentName},

Your borrowing request has been approved.

Book Title: {$bookTitle}
Approval Date: " . self::formatEmailDate($approvalDate) . "
Pickup/Start Date: " . self::formatEmailDate($startDate) . "
Due Date: " . self::formatEmailDate($dueDate) . "

Reminder: Sundays are not counted in the borrowing period.

Thank you,
CVSU Imus Library";

    $emailService = new EmailService($config);
    $sent = $emailService->send($studentEmail, $subject, $body);

    if ($sent) {
      $update = $pdo->prepare("
        UPDATE borrow_records
        SET approval_email_sent = 1,
            approval_email_sent_at = NOW()
        WHERE id = ?
          AND approval_email_sent = 0
      ");
      $update->execute([$recordId]);
    }

    return $sent;
  }

  public static function processOverdueReminders(PDO $pdo, array $config, array $auth): void {
    AuthMiddleware::requireRole($auth, ['admin', 'librarian']);

    $summary = OverdueService::refresh($pdo, $config);

    ActivityLogger::log($pdo, [
      'actor_user_id' => (int)($auth['user_id'] ?? 0) ?: null,
      'action' => 'borrow.overdue_reminders_processed',
      'entity_type' => 'borrow_record',
      'entity_id' => null,
      'details' => $summary,
    ]);

    Http::ok([
      'message' => 'Overdue reminders processed.',
      'summary' => $summary,
    ]);
  }

  /**
   * Student request borrow ONLY:
   * - creates borrow_record with status='pending'
   * - does NOT decrement copies yet
   */
  public static function borrow(PDO $pdo, array $config, array $auth): void {
    OverdueService::refresh($pdo, $config);
    OverdueService::ensureBorrowDateTimeColumns($pdo, $config);
    OverdueService::ensureBorrowApprovalColumns($pdo);

    // ✅ Student-only (extra safety kahit naka student-only na sa index.php)
    AuthMiddleware::requireRole($auth, ['student']);

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

    $userId = (int)($auth['user_id'] ?? $auth['id'] ?? 0);

    // ✅ Prevent duplicate borrow/request of the same book while still open
    $dup = $pdo->prepare("
      SELECT id, status
      FROM borrow_records
      WHERE user_id = ?
        AND book_id = ?
        AND return_date IS NULL
        AND status IN ('pending','borrowed','overdue')
      ORDER BY id DESC
      LIMIT 1
    ");
    $dup->execute([$userId, $bookId]);
    $existing = $dup->fetch();

    if ($existing) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.borrow_failed',
        'entity_type' => 'borrow',
        'entity_id' => null,
        'details' => [
          'reason' => 'duplicate_open_request',
          'book_id' => $bookId,
          'existing_record_id' => (int)$existing['id'],
          'existing_status' => (string)$existing['status'],
        ],
      ]);

      Http::error('You already have an active or pending request for this book.', 409, [
        'existing_record_id' => (int)$existing['id'],
        'existing_status' => (string)$existing['status'],
      ]);
    }

    // Block students from borrowing if they have ANY overdue book not yet returned.
    $stmtOverFirst = $pdo->prepare("
      SELECT COUNT(*) AS c
      FROM borrow_records
      WHERE user_id = ?
        AND status = 'overdue'
        AND return_date IS NULL
    ");
    $stmtOverFirst->execute([$userId]);
    $overCntFirst = (int)($stmtOverFirst->fetch()['c'] ?? 0);

    if ($overCntFirst > 0) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.borrow_failed',
        'entity_type' => 'borrow',
        'entity_id' => null,
        'details' => [
          'reason' => 'has_overdue',
          'overdue_count' => $overCntFirst,
          'book_id' => $bookId,
        ],
      ]);

      Http::error('You have an overdue book. Please return it before borrowing another book.', 409, [
        'overdue_count' => $overCntFirst,
      ]);
    }

    // Borrow limit (students) - count active borrowed/overdue PLUS pending requests
    $stmt = $pdo->prepare("
      SELECT COUNT(*) AS c
      FROM borrow_records
      WHERE user_id = ?
        AND return_date IS NULL
        AND status IN ('borrowed','overdue','pending')
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

    // ✅ Block students from borrowing if they have ANY overdue book not yet returned
    $stmtOver = $pdo->prepare("
      SELECT COUNT(*) AS c
      FROM borrow_records
      WHERE user_id = ?
        AND status = 'overdue'
        AND return_date IS NULL
    ");
    $stmtOver->execute([$userId]);
    $overCnt = (int)($stmtOver->fetch()['c'] ?? 0);

    if ($overCnt > 0) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.borrow_failed',
        'entity_type' => 'borrow',
        'entity_id' => null,
        'details' => [
          'reason' => 'has_overdue',
          'overdue_count' => $overCnt,
          'book_id' => $bookId,
        ],
      ]);

      Http::error('You have an overdue book. Please return it before borrowing another book.', 409, [
        'overdue_count' => $overCnt,
      ]);
    }

    // Check book availability (fetch title for logs)
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

    $borrowedAt = (new DateTimeImmutable('now'))->format('Y-m-d H:i:s');
    $dueAt = (new DateTimeImmutable('now'))
      ->modify('+' . (int)$config['library']['borrow_days'] . ' days')
      ->format('Y-m-d H:i:s');
    $borrowDate = substr($borrowedAt, 0, 10);
    $dueDate = substr($dueAt, 0, 10);

    // ✅ always pending (approval required)
    $status = 'pending';

    $pdo->beginTransaction();
    try {
      $ins = $pdo->prepare("
        INSERT INTO borrow_records (user_id, book_id, borrow_date, borrowed_at, due_date, due_at, status)
        VALUES (?,?,?,?,?,?,?)
      ");
      $ins->execute([$userId, $bookId, $borrowDate, $borrowedAt, $dueDate, $dueAt, $status]);

      $recordId = (int)$pdo->lastInsertId();

      $pdo->commit();

      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.request',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => [
          'book_id' => (int)$book['id'],
          'book_title' => (string)($book['title'] ?? ''),
          'borrow_date' => $borrowDate,
          'due_date' => $dueDate,
          'borrowed_at' => $borrowedAt,
          'due_at' => $dueAt,
          'status' => $status,
        ],
      ]);

      Http::ok([
        'message' => 'Borrow request submitted (Pending approval)',
        'due_date' => $dueDate,
        'borrowed_at' => $borrowedAt,
        'due_at' => $dueAt,
        'status' => $status,
        'record_id' => $recordId
      ], 201);
      return;
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
  }

  /**
   * ✅ Approve a pending borrow request (Librarian ONLY)
   * - changes status pending -> borrowed
   * - decrements copies_available
   */
  public static function approve(PDO $pdo, array $config, array $auth, int $recordId): void {
    OverdueService::refresh($pdo, $config);
    OverdueService::ensureBorrowDateTimeColumns($pdo, $config);
    OverdueService::ensureBorrowApprovalColumns($pdo);

    AuthMiddleware::requireRole($auth, ['librarian']);

    $actorId = (int)$auth['user_id'];

    $stmt = $pdo->prepare("
      SELECT br.*, b.title AS book_title, b.copies_available, u.name AS student_name, u.email AS student_email
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
        'actor_user_id' => $actorId,
        'action' => 'borrow.approve_failed',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => ['reason' => 'record_not_found'],
      ]);
      Http::error('Record not found', 404);
    }

    if ((string)$rec['status'] !== 'pending') {
      Http::error('Only pending requests can be approved', 409, ['status' => (string)$rec['status']]);
    }

    if ((int)$rec['copies_available'] <= 0) {
      Http::error('No copies available', 409);
    }

    $pdo->beginTransaction();
    try {
      $approvedDateTime = new DateTimeImmutable('now');
      $startDateTime = self::nextLibraryPickupDate($approvedDateTime);
      $dueDateTime = self::addLibraryDaysSkippingSundays($startDateTime, 14);

      $approvedAt = $approvedDateTime->format('Y-m-d H:i:s');
      $approvalDate = $approvedDateTime->format('Y-m-d');
      $borrowedAt = $startDateTime->format('Y-m-d H:i:s');
      $borrowDate = $startDateTime->format('Y-m-d');
      $dueAt = $dueDateTime->setTime(23, 59, 59)->format('Y-m-d H:i:s');
      $dueDate = $dueDateTime->format('Y-m-d');

      $updBook = $pdo->prepare("
        UPDATE books
        SET copies_available = copies_available - 1
        WHERE id = ? AND copies_available > 0
      ");
      $updBook->execute([(int)$rec['book_id']]);
      if ($updBook->rowCount() !== 1) {
        throw new RuntimeException('Failed to decrement availability');
      }

      $updRec = $pdo->prepare("
        UPDATE borrow_records
        SET status = 'borrowed',
            approval_date = ?,
            approved_at = ?,
            borrow_date = ?,
            borrowed_at = ?,
            due_date = ?,
            due_at = ?
        WHERE id = ? AND status = 'pending'
      ");
      $updRec->execute([$approvalDate, $approvedAt, $borrowDate, $borrowedAt, $dueDate, $dueAt, $recordId]);
      if ($updRec->rowCount() !== 1) {
        throw new RuntimeException('Failed to approve request');
      }

      $pdo->commit();

      try {
        $approvalEmailSent = self::sendApprovalEmail($pdo, $config, $recordId);
      } catch (Throwable $emailError) {
        error_log('Borrow approval email failed for record ' . $recordId . ': ' . $emailError->getMessage());
        $approvalEmailSent = false;
      }

      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'borrow.approve',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => [
          'borrower_user_id' => (int)$rec['user_id'],
          'book_id' => (int)$rec['book_id'],
          'book_title' => (string)($rec['book_title'] ?? ''),
          'approval_date' => $approvalDate,
          'approved_at' => $approvedAt,
          'borrow_date' => $borrowDate,
          'borrowed_at' => $borrowedAt,
          'due_date' => $dueDate,
          'due_at' => $dueAt,
          'approval_email_sent' => $approvalEmailSent,
        ],
      ]);

      OverdueService::refresh($pdo, $config);

      Http::ok([
        'message' => 'Approved',
        'record_id' => $recordId,
        'approval_date' => $approvalDate,
        'borrow_date' => $borrowDate,
        'due_date' => $dueDate,
        'approval_email_sent' => $approvalEmailSent,
      ]);
    } catch (Throwable $e) {
      if ($pdo->inTransaction()) {
        $pdo->rollBack();
      }
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'borrow.approve_failed',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => [
          'reason' => 'exception',
          'error' => $e->getMessage(),
        ],
      ]);
      Http::error('Approve failed: ' . $e->getMessage(), 500);
    }
  }

  /**
   * ✅ Decline a pending borrow request (Librarian ONLY)
   * - changes status pending -> declined
   * - does NOT change copies
   */
  public static function decline(PDO $pdo, array $auth, int $recordId): void {
    OverdueService::refresh($pdo);

    AuthMiddleware::requireRole($auth, ['librarian']);

    $actorId = (int)$auth['user_id'];
    $b = Http::readJsonBody();
    $reason = (string)($b['reason'] ?? '');

    $stmt = $pdo->prepare("SELECT id, user_id, book_id, status FROM borrow_records WHERE id = ? LIMIT 1");
    $stmt->execute([$recordId]);
    $rec = $stmt->fetch();

    if (!$rec) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'borrow.decline_failed',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => ['reason' => 'record_not_found'],
      ]);
      Http::error('Record not found', 404);
    }

    if ((string)$rec['status'] !== 'pending') {
      Http::error('Only pending requests can be declined', 409, ['status' => (string)$rec['status']]);
    }

    $upd = $pdo->prepare("UPDATE borrow_records SET status = 'declined' WHERE id = ? AND status = 'pending'");
    $upd->execute([$recordId]);

    ActivityLogger::log($pdo, [
      'actor_user_id' => $actorId,
      'action' => 'borrow.decline',
      'entity_type' => 'borrow_record',
      'entity_id' => $recordId,
      'details' => [
        'borrower_user_id' => (int)$rec['user_id'],
        'book_id' => (int)$rec['book_id'],
        'decline_reason' => $reason,
      ],
    ]);

    Http::ok(['message' => 'Declined', 'record_id' => $recordId]);
  }

  /**
   * ✅ Cancel a pending borrow request (Student ONLY)
   * - changes status pending -> cancelled
   * - does NOT change copies
   */
  public static function cancel(PDO $pdo, array $auth, int $recordId): void {
    OverdueService::refresh($pdo);

    AuthMiddleware::requireRole($auth, ['student']);

    $userId = (int)($auth['user_id'] ?? 0);

    $stmt = $pdo->prepare("
      SELECT br.*, b.title AS book_title
      FROM borrow_records br
      JOIN books b ON b.id = br.book_id
      WHERE br.id = ?
      LIMIT 1
    ");
    $stmt->execute([$recordId]);
    $rec = $stmt->fetch();

    if (!$rec) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.cancel_failed',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => ['reason' => 'record_not_found'],
      ]);
      Http::error('Record not found', 404);
    }

    if ((int)$rec['user_id'] !== $userId) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $userId,
        'action' => 'borrow.cancel_failed',
        'entity_type' => 'borrow_record',
        'entity_id' => $recordId,
        'details' => [
          'reason' => 'forbidden',
          'record_user_id' => (int)$rec['user_id'],
        ],
      ]);
      Http::error('Forbidden', 403);
    }

    if ((string)$rec['status'] !== 'pending') {
      Http::error('Only pending requests can be cancelled', 409, ['status' => (string)$rec['status']]);
    }

    if ($rec['return_date'] !== null) {
      Http::error('Already returned', 409);
    }

    $upd = $pdo->prepare("
      UPDATE borrow_records
      SET status = 'cancelled'
      WHERE id = ? AND user_id = ? AND status = 'pending' AND return_date IS NULL
    ");
    $upd->execute([$recordId, $userId]);

    ActivityLogger::log($pdo, [
      'actor_user_id' => $userId,
      'action' => 'borrow.cancel',
      'entity_type' => 'borrow_record',
      'entity_id' => $recordId,
      'details' => [
        'book_id' => (int)$rec['book_id'],
        'book_title' => (string)($rec['book_title'] ?? ''),
      ],
    ]);

    Http::ok(['message' => 'Cancelled', 'record_id' => $recordId]);
  }

  /**
   * ✅ Return book (Librarian ONLY) - NOW WORKS WITH OVERDUE BOOKS
   */
  public static function returnBook(PDO $pdo, array $auth, int $recordId): void {
    OverdueService::refresh($pdo);

    AuthMiddleware::requireRole($auth, ['librarian']);

    $userId = (int)$auth['user_id'];

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

    // ✅ FIX: Allow return of ANY unreturned record (borrowed, overdue, pending)
    if (!in_array((string)$rec['status'], ['borrowed', 'overdue', 'pending'], true)) {
      Http::error('Cannot return a book with status: ' . $rec['status'], 409, ['status' => (string)$rec['status']]);
    }

    $pdo->beginTransaction();
    try {
      $retDate = date('Y-m-d');
      $upd = $pdo->prepare("UPDATE borrow_records SET return_date = ?, status = 'returned', updated_at = NOW() WHERE id = ? AND return_date IS NULL");
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
          'was_overdue' => $rec['status'] === 'overdue' ? 'yes' : 'no',
        ],
      ]);

      Http::ok(['message' => 'Returned', 'record_id' => $recordId, 'return_date' => $retDate]);
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
  }

  /**
   * ✅ Student history ONLY (their own) - NOW INCLUDES COVER IMAGE
   */
  public static function myHistory(PDO $pdo, array $auth): void {
    OverdueService::refresh($pdo);

    AuthMiddleware::requireRole($auth, ['student']);

    $userId = (int)$auth['user_id'];
    $page = Query::int('page', 1, 1);
    $limit = Query::int('limit', 10, 1, 100);
    $offset = ($page - 1) * $limit;

    $countStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM borrow_records WHERE user_id = ?");
    $countStmt->execute([$userId]);
    $total = (int)($countStmt->fetch()['c'] ?? 0);

    $stmt = $pdo->prepare("
      SELECT br.*, b.title, b.author, b.isbn, b.cover_image_url
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

  /**
   * List all records (Admin or Librarian ONLY) - view-only
   */
  public static function listAll(PDO $pdo, array $auth): void {
    OverdueService::refresh($pdo);

    AuthMiddleware::requireRole($auth, ['admin', 'librarian']);

    $status = Query::str('status', ''); // pending|borrowed|returned|overdue|declined|''
    $from = Query::date('from');
    $to = Query::date('to');

    // ✅ NEW: search query
    $q = Query::str('q', '');

    $page = Query::int('page', 1, 1);
    $limit = Query::int('limit', 10, 1, 100);
    $offset = ($page - 1) * $limit;

    $where = [];
    $params = [];

    if ($status !== '') {
      if ($status === 'pending') {
        $where[] = "(br.status = 'pending' OR br.status IS NULL OR br.status = '')";
      } else if ($status === 'active') {
        // ✅ borrowed + overdue + not returned
        $where[] = "br.return_date IS NULL";
        $where[] = "br.status IN ('borrowed','overdue')";
      } else {
        $where[] = "br.status = ?";
        $params[] = $status;
      }
    }

    if ($from) { $where[] = "br.borrow_date >= ?"; $params[] = $from; }
    if ($to) { $where[] = "br.borrow_date <= ?"; $params[] = $to; }

    // ✅ NEW: search across user + book (including student number if exists)
    if ($q !== '') {
      $where[] = "("
        . "u.name LIKE ? OR u.email LIKE ? OR "
        . "COALESCE(u.student_number,'') LIKE ? OR "
        . "b.title LIKE ? OR b.isbn LIKE ?"
        . ")";
      $like = '%' . $q . '%';
      $params[] = $like;
      $params[] = $like;
      $params[] = $like;
      $params[] = $like;
      $params[] = $like;
    }

    if ($status === 'borrowed' || $status === 'overdue') {
      $where[] = "br.return_date IS NULL";
    }

    $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

    // count (needs same joins if WHERE uses u/b)
    $countStmt = $pdo->prepare("
      SELECT COUNT(*) AS c
      FROM borrow_records br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      $whereSql
    ");
    $countStmt->execute($params);
    $total = (int)($countStmt->fetch()['c'] ?? 0);

    $stmt = $pdo->prepare("
      SELECT
        br.*,
        u.name AS user_name,
        u.email AS user_email,
        u.student_number AS user_student_number,
        b.title,
        b.isbn
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
