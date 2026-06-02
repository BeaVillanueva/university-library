-- Borrow due times must preserve the exact borrowing time.
-- Run the ALTER statements manually only if these columns are missing.

-- ALTER TABLE borrow_records ADD COLUMN borrowed_at DATETIME NULL AFTER borrow_date;
-- ALTER TABLE borrow_records ADD COLUMN due_at DATETIME NULL AFTER due_date;

UPDATE borrow_records
SET borrowed_at = TIMESTAMP(borrow_date, '00:00:00')
WHERE borrowed_at IS NULL
  AND borrow_date IS NOT NULL;

UPDATE borrow_records
SET due_at = TIMESTAMP(
  due_date,
  CASE
    WHEN borrowed_at IS NOT NULL AND TIME(borrowed_at) <> '00:00:00'
      THEN TIME(borrowed_at)
    ELSE '23:59:59'
  END
)
WHERE due_date IS NOT NULL
  AND (
    due_at IS NULL
    OR DATE(due_at) <> due_date
    OR TIME(due_at) = '00:00:00'
  );

-- Optional reminder columns if they were not added by the previous migration.
-- ALTER TABLE borrow_records ADD COLUMN overdue_email_sent TINYINT(1) NOT NULL DEFAULT 0;
-- ALTER TABLE borrow_records ADD COLUMN overdue_email_sent_at DATETIME NULL AFTER overdue_email_sent;
