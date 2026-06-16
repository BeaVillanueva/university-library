-- Borrow approval metadata and one-time approval email tracking.
-- Run these ALTER statements manually only if these columns are missing.

-- ALTER TABLE borrow_records ADD COLUMN approval_date DATE NULL AFTER book_id;
-- ALTER TABLE borrow_records ADD COLUMN approved_at DATETIME NULL AFTER approval_date;
-- ALTER TABLE borrow_records ADD COLUMN approval_email_sent TINYINT(1) NOT NULL DEFAULT 0;
-- ALTER TABLE borrow_records ADD COLUMN approval_email_sent_at DATETIME NULL AFTER approval_email_sent;
