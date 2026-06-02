CREATE TABLE IF NOT EXISTS overdue_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_id INT NOT NULL,
  notified_date DATE NOT NULL,
  student_email VARCHAR(190) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_overdue_notification_day (record_id, notified_date),
  INDEX idx_overdue_notifications_record_id (record_id),
  INDEX idx_overdue_notifications_notified_date (notified_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add these manually only if missing on older MySQL/MariaDB versions:
-- ALTER TABLE borrow_records ADD COLUMN overdue_email_sent TINYINT(1) NOT NULL DEFAULT 0;
-- ALTER TABLE borrow_records ADD COLUMN overdue_email_sent_at DATETIME NULL AFTER overdue_email_sent;

