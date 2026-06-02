-- Borrow due times must preserve the exact borrowing time.
-- Run the ALTER statements manually only if these columns are missing.

-- ALTER TABLE borrow_records ADD COLUMN borrowed_at DATETIME NULL AFTER borrow_date;
-- ALTER TABLE borrow_records ADD COLUMN due_at DATETIME NULL AFTER due_date;

UPDATE borrow_records
SET borrowed_at = TIMESTAMP(borrow_date, '00:00:00')
WHERE borrowed_at IS NULL
  AND borrow_date IS NOT NULL;

UPDATE borrow_records
SET due_at = DATE_ADD(borrowed_at, INTERVAL 1 DAY)
WHERE due_at IS NULL
  AND borrowed_at IS NOT NULL;

-- Optional reminder columns if they were not added by the previous migration.
-- ALTER TABLE borrow_records ADD COLUMN overdue_email_sent TINYINT(1) NOT NULL DEFAULT 0;
-- ALTER TABLE borrow_records ADD COLUMN overdue_email_sent_at DATETIME NULL AFTER overdue_email_sent;
