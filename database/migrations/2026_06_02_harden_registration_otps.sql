CREATE TABLE IF NOT EXISTS registration_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL,
  student_number VARCHAR(50) NOT NULL,
  payload_json TEXT NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_registration_otps_email (email),
  INDEX idx_registration_otps_used (used),
  INDEX idx_registration_otps_used_at (used_at),
  INDEX idx_registration_otps_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE registration_otps
  ADD COLUMN IF NOT EXISTS used TINYINT(1) NOT NULL DEFAULT 0 AFTER expires_at,
  ADD COLUMN IF NOT EXISTS used_at DATETIME NULL AFTER used;

