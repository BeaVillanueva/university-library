<?php
declare(strict_types=1);

final class OverdueService {
  public static function refresh(PDO $pdo): void {
    // Mark borrowed records past due_date as overdue (if not returned)
    $pdo->exec("
      UPDATE borrow_records
      SET status = 'overdue'
      WHERE status = 'borrowed'
        AND return_date IS NULL
        AND due_date < CURDATE()
    ");

    // Mark overdue records that are no longer overdue (edge-case) back to borrowed
    $pdo->exec("
      UPDATE borrow_records
      SET status = 'borrowed'
      WHERE status = 'overdue'
        AND return_date IS NULL
        AND due_date >= CURDATE()
    ");
  }
}