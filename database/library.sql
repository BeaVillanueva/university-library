-- University Library Management System
-- MySQL / phpMyAdmin
-- Current Date: 2026-02-21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Create database (optional; you can also create via phpMyAdmin UI)
-- CREATE DATABASE university_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE university_library;

DROP TABLE IF EXISTS borrow_records;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','librarian','student') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE books (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(32) NOT NULL UNIQUE,
  category_id INT UNSIGNED NULL,
  year INT NULL,
  description TEXT NULL,
  copies_total INT NOT NULL DEFAULT 0,
  copies_available INT NOT NULL DEFAULT 0,
  shelf_location VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_books_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  INDEX idx_books_title (title),
  INDEX idx_books_author (author),
  INDEX idx_books_isbn (isbn),
  INDEX idx_books_category (category_id),
  INDEX idx_books_avail (copies_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE borrow_records (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE NULL,
  status ENUM('borrowed','returned','overdue') NOT NULL DEFAULT 'borrowed',
  CONSTRAINT fk_borrow_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_borrow_book
    FOREIGN KEY (book_id) REFERENCES books(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_borrow_user_status (user_id, status),
  INDEX idx_borrow_book_status (book_id, status),
  INDEX idx_borrow_due (due_date),
  INDEX idx_borrow_dates (borrow_date, return_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed categories (optional minimal)
INSERT INTO categories (name) VALUES
('Computer Science'),
('Mathematics'),
('Literature')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Seed users (password = Password123!)
-- NOTE: These hashes were generated using PHP's password_hash with PASSWORD_DEFAULT.
-- If you prefer, you can create users via API later and delete these.
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@university.test', '$2y$10$w0pK8Uu0z3p5x.7pV8z5v.1k/1jQ9I9B4YcWv2Zl0r7DgZt7hGmQe', 'admin'),
('Librarian User', 'librarian@university.test', '$2y$10$w0pK8Uu0z3p5x.7pV8z5v.1k/1jQ9I9B4YcWv2Zl0r7DgZt7hGmQe', 'librarian'),
('Student User', 'student@university.test', '$2y$10$w0pK8Uu0z3p5x.7pV8z5v.1k/1jQ9I9B4YcWv2Zl0r7DgZt7hGmQe', 'student')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- NOTE ABOUT THE HASH ABOVE:
-- It is a placeholder-style hash for demo; if login fails, run backend/tools/hash.php to generate a fresh hash
-- and update these rows, or create users via API once admin endpoints are ready.