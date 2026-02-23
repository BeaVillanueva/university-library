<?php
declare(strict_types=1);

final class ImportController {
  private static array $requiredColumns = [
    'title','author','isbn','category','year','description','copies_total','shelf_location'
  ];

  public static function preview(PDO $pdo, array $auth): void {
    $actorId = (int)($auth['user_id'] ?? 0) ?: null;

    if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'import.books_preview_failed',
        'entity_type' => 'import',
        'entity_id' => null,
        'details' => [
          'reason' => 'file_required',
        ],
      ]);
      Http::error('CSV file is required (multipart field: file)', 422);
    }

    $tmp = $_FILES['file']['tmp_name'];
    $fh = fopen($tmp, 'r');
    if ($fh === false) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'import.books_preview_failed',
        'entity_type' => 'import',
        'entity_id' => null,
        'details' => [
          'reason' => 'failed_to_open_file',
        ],
      ]);
      Http::error('Failed to read uploaded file', 400);
    }

    $header = fgetcsv($fh);
    if (!is_array($header)) {
      fclose($fh);
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'import.books_preview_failed',
        'entity_type' => 'import',
        'entity_id' => null,
        'details' => [
          'reason' => 'missing_header',
        ],
      ]);
      Http::error('CSV header row missing', 422);
    }

    $header = array_map(fn($h) => strtolower(trim((string)$h)), $header);

    foreach (self::$requiredColumns as $col) {
      if (!in_array($col, $header, true)) {
        fclose($fh);
        ActivityLogger::log($pdo, [
          'actor_user_id' => $actorId,
          'action' => 'import.books_preview_failed',
          'entity_type' => 'import',
          'entity_id' => null,
          'details' => [
            'reason' => 'missing_required_column',
            'missing_column' => $col,
          ],
        ]);
        Http::error('Missing required CSV column: ' . $col, 422, ['header' => $header]);
      }
    }

    $index = array_flip($header);
    $rows = [];
    $rowNum = 1;

    while (($data = fgetcsv($fh)) !== false) {
      $rowNum++;
      if (!is_array($data) || count($data) === 0) continue;

      $row = [];
      foreach (self::$requiredColumns as $col) {
        $row[$col] = isset($index[$col]) ? (string)($data[$index[$col]] ?? '') : '';
        $row[$col] = trim($row[$col]);
      }

      // Basic validation; deeper validation happens on commit.
      $errors = [];
      if ($row['title'] === '') $errors[] = 'title required';
      if ($row['author'] === '') $errors[] = 'author required';
      if ($row['isbn'] === '') $errors[] = 'isbn required';
      if ($row['copies_total'] === '' || !preg_match('/^\d+$/', $row['copies_total'])) $errors[] = 'copies_total must be integer >= 0';

      // Normalize types for frontend preview
      $row['year'] = $row['year'] !== '' ? (int)$row['year'] : null;
      $row['copies_total'] = $row['copies_total'] !== '' ? (int)$row['copies_total'] : 0;

      $rows[] = [
        'row_number' => $rowNum,
        'data' => $row,
        'errors' => $errors,
      ];

      if (count($rows) >= 5000) break; // safety cap
    }

    fclose($fh);

    // Log preview success (summary only)
    $invalidCount = 0;
    foreach ($rows as $r) {
      if (!empty($r['errors'])) $invalidCount++;
    }

    ActivityLogger::log($pdo, [
      'actor_user_id' => $actorId,
      'action' => 'import.books_preview',
      'entity_type' => 'import',
      'entity_id' => null,
      'details' => [
        'preview_rows' => count($rows),
        'invalid_rows' => $invalidCount,
        'note' => 'Preview only (no DB write)',
      ],
    ]);

    Http::ok([
      'required_columns' => self::$requiredColumns,
      'preview' => $rows,
      'note' => 'Preview does not write to database. Submit valid rows to /import/books/commit.',
    ]);
  }

  public static function commit(PDO $pdo, array $auth): void {
    $actorId = (int)($auth['user_id'] ?? 0) ?: null;

    $b = Http::readJsonBody();
    $rows = $b['rows'] ?? null;

    if (!is_array($rows) || count($rows) === 0) {
      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'import.books_commit_failed',
        'entity_type' => 'import',
        'entity_id' => null,
        'details' => [
          'reason' => 'rows_required',
        ],
      ]);
      Http::error('rows array is required', 422);
    }

    $inserted = 0;
    $updated = 0;
    $skipped = 0;
    $rowResults = [];

    // Map: category_name => id
    $categoryCache = [];

    $pdo->beginTransaction();
    try {
      foreach ($rows as $i => $rowWrap) {
        $rowNumber = (int)($rowWrap['row_number'] ?? ($i + 1));
        $data = $rowWrap['data'] ?? $rowWrap; // allow direct rows too
        if (!is_array($data)) { $skipped++; continue; }

        $title = trim((string)($data['title'] ?? ''));
        $author = trim((string)($data['author'] ?? ''));
        $isbn = trim((string)($data['isbn'] ?? ''));
        $categoryName = trim((string)($data['category'] ?? ''));
        $year = ($data['year'] ?? null);
        $description = (string)($data['description'] ?? '');
        $copiesTotal = (int)($data['copies_total'] ?? 0);
        $shelf = trim((string)($data['shelf_location'] ?? ''));

        $errors = [];
        if ($title === '') $errors[] = 'title required';
        if ($author === '') $errors[] = 'author required';
        if ($isbn === '') $errors[] = 'isbn required';
        if ($copiesTotal < 0) $errors[] = 'copies_total must be >= 0';

        if ($errors) {
          $skipped++;
          $rowResults[] = ['row_number' => $rowNumber, 'action' => 'skipped', 'errors' => $errors];
          continue;
        }

        // Category auto-create if provided
        $categoryId = null;
        if ($categoryName !== '') {
          if (isset($categoryCache[$categoryName])) {
            $categoryId = $categoryCache[$categoryName];
          } else {
            $stmt = $pdo->prepare("SELECT id FROM categories WHERE name = ? LIMIT 1");
            $stmt->execute([$categoryName]);
            $existing = $stmt->fetch();
            if ($existing) {
              $categoryId = (int)$existing['id'];
            } else {
              $ins = $pdo->prepare("INSERT INTO categories (name) VALUES (?)");
              $ins->execute([$categoryName]);
              $categoryId = (int)$pdo->lastInsertId();
            }
            $categoryCache[$categoryName] = $categoryId;
          }
        }

        // Does ISBN exist?
        $stmtBook = $pdo->prepare("SELECT id FROM books WHERE isbn = ? LIMIT 1");
        $stmtBook->execute([$isbn]);
        $existingBook = $stmtBook->fetch();

        if (!$existingBook) {
          // Insert: copies_available = copies_total
          $ins = $pdo->prepare("
            INSERT INTO books (title, author, isbn, category_id, year, description, copies_total, copies_available, shelf_location)
            VALUES (?,?,?,?,?,?,?,?,?)
          ");
          $ins->execute([
            $title, $author, $isbn,
            $categoryId,
            ($year === null || $year === '') ? null : (int)$year,
            $description,
            $copiesTotal,
            $copiesTotal,
            $shelf
          ]);
          $inserted++;
          $rowResults[] = ['row_number' => $rowNumber, 'action' => 'inserted', 'book_id' => (int)$pdo->lastInsertId()];
        } else {
          $bookId = (int)$existingBook['id'];

          // Option A rule on update: copies_available = copies_total - currently_borrowed
          $stmtBorrowed = $pdo->prepare("
            SELECT COUNT(*) AS c
            FROM borrow_records
            WHERE book_id = ?
              AND return_date IS NULL
              AND status IN ('borrowed','overdue')
          ");
          $stmtBorrowed->execute([$bookId]);
          $borrowedCount = (int)($stmtBorrowed->fetch()['c'] ?? 0);
          $newAvailable = max(0, $copiesTotal - $borrowedCount);

          $upd = $pdo->prepare("
            UPDATE books
            SET title = ?, author = ?, category_id = ?, year = ?, description = ?, copies_total = ?, copies_available = ?, shelf_location = ?
            WHERE id = ?
          ");
          $upd->execute([
            $title, $author,
            $categoryId,
            ($year === null || $year === '') ? null : (int)$year,
            $description,
            $copiesTotal,
            $newAvailable,
            $shelf,
            $bookId
          ]);
          $updated++;
          $rowResults[] = ['row_number' => $rowNumber, 'action' => 'updated', 'book_id' => $bookId];
        }
      }

      $pdo->commit();
    } catch (Throwable $e) {
      $pdo->rollBack();

      ActivityLogger::log($pdo, [
        'actor_user_id' => $actorId,
        'action' => 'import.books_commit_failed',
        'entity_type' => 'import',
        'entity_id' => null,
        'details' => [
          'reason' => 'exception',
          'error' => $e->getMessage(),
        ],
      ]);

      Http::error('Import failed: ' . $e->getMessage(), 500);
    }

    ActivityLogger::log($pdo, [
      'actor_user_id' => $actorId,
      'action' => 'import.books_commit',
      'entity_type' => 'import',
      'entity_id' => null,
      'details' => [
        'inserted' => $inserted,
        'updated' => $updated,
        'skipped' => $skipped,
        'total_submitted' => count($rows),
      ],
    ]);

    Http::ok([
      'summary' => [
        'inserted' => $inserted,
        'updated' => $updated,
        'skipped' => $skipped,
        'total_submitted' => count($rows),
      ],
      'rows' => $rowResults,
    ]);
  }
}