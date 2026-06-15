-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 26, 2026 at 07:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `university_library`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `actor_user_id` int(10) UNSIGNED DEFAULT NULL,
  `action` varchar(64) NOT NULL,
  `entity_type` varchar(64) DEFAULT NULL,
  `entity_id` bigint(20) DEFAULT NULL,
  `details_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details_json`)),
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `details_json`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 14:38:37'),
(2, 21, 'auth.login_failed', 'user', 21, '{\"reason\":\"invalid_credentials\",\"email\":\"beatrez.villanueva@cvsu.edu.ph\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:25:20'),
(3, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:25:24'),
(4, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:25:45'),
(5, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:25:52'),
(6, 2, 'import.books_preview', 'import', NULL, '{\"preview_rows\":4,\"invalid_rows\":0,\"note\":\"Preview only (no DB write)\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:26:02'),
(7, 2, 'import.books_preview', 'import', NULL, '{\"preview_rows\":4,\"invalid_rows\":0,\"note\":\"Preview only (no DB write)\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:26:07'),
(8, 2, 'import.books_commit', 'import', NULL, '{\"inserted\":4,\"updated\":0,\"skipped\":0,\"total_submitted\":4}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:26:09'),
(9, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:26:26'),
(10, 21, 'auth.login_failed', 'user', 21, '{\"reason\":\"invalid_credentials\",\"email\":\"beatrez.villanueva@cvsu.edu.ph\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:37:11'),
(11, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:37:14'),
(12, 21, 'borrow.request', 'borrow_record', 1, '{\"book_id\":3,\"book_title\":\"Pride and Prejudice\",\"borrow_date\":\"2026-05-19\",\"due_date\":\"2026-06-02\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:37:21'),
(13, 21, 'borrow.request', 'borrow_record', 2, '{\"book_id\":4,\"book_title\":\"Linear Algebra Done Right\",\"borrow_date\":\"2026-05-19\",\"due_date\":\"2026-06-02\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:37:22'),
(14, 21, 'borrow.request', 'borrow_record', 3, '{\"book_id\":2,\"book_title\":\"Introduction to Algorithms\",\"borrow_date\":\"2026-05-19\",\"due_date\":\"2026-06-02\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:37:26'),
(15, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:37:29'),
(16, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-19 15:38:04'),
(17, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:33:39'),
(18, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:33:58'),
(19, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:34:04'),
(20, 2, 'borrow.approve', 'borrow_record', 3, '{\"borrower_user_id\":21,\"book_id\":2,\"book_title\":\"Introduction to Algorithms\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:34:19'),
(21, 2, 'borrow.approve', 'borrow_record', 2, '{\"borrower_user_id\":21,\"book_id\":4,\"book_title\":\"Linear Algebra Done Right\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:34:22'),
(22, 2, 'borrow.approve', 'borrow_record', 1, '{\"borrower_user_id\":21,\"book_id\":3,\"book_title\":\"Pride and Prejudice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:34:24'),
(23, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:34:41'),
(24, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:34:46'),
(25, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:52:24'),
(26, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:52:33'),
(27, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:52:40'),
(28, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:53:11'),
(29, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 02:53:18'),
(30, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 03:02:50'),
(31, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 03:03:19'),
(32, 1, 'auth.login_failed', 'user', 1, '{\"reason\":\"invalid_credentials\",\"email\":\"admin@university.test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 03:03:26'),
(33, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 03:03:31'),
(34, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 03:08:17'),
(35, 1, 'auth.login_failed', 'user', 1, '{\"reason\":\"invalid_credentials\",\"email\":\"admin@university.test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:44:32'),
(36, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:44:36'),
(37, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:49:06'),
(38, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:56:35'),
(39, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:58:53'),
(40, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:59:02'),
(41, 3, 'borrow.request', 'borrow_record', 4, '{\"book_id\":4,\"book_title\":\"Linear Algebra Done Right\",\"borrow_date\":\"2026-05-20\",\"due_date\":\"2026-06-03\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:59:06'),
(42, 3, 'borrow.request', 'borrow_record', 5, '{\"book_id\":2,\"book_title\":\"Introduction to Algorithms\",\"borrow_date\":\"2026-05-20\",\"due_date\":\"2026-06-03\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:59:08'),
(43, 3, 'borrow.request', 'borrow_record', 6, '{\"book_id\":1,\"book_title\":\"Clean Code\",\"borrow_date\":\"2026-05-20\",\"due_date\":\"2026-06-03\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:59:09'),
(44, 3, 'borrow.cancel', 'borrow_record', 5, '{\"book_id\":2,\"book_title\":\"Introduction to Algorithms\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:59:17'),
(45, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:59:19'),
(46, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:59:26'),
(47, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:59:34'),
(48, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 04:59:41'),
(49, 2, 'borrow.approve', 'borrow_record', 6, '{\"borrower_user_id\":3,\"book_id\":1,\"book_title\":\"Clean Code\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 05:00:05'),
(50, 2, 'borrow.approve', 'borrow_record', 4, '{\"borrower_user_id\":3,\"book_id\":4,\"book_title\":\"Linear Algebra Done Right\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 05:00:05'),
(51, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 05:04:40'),
(52, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 05:04:45'),
(53, 1, 'users.delete_failed', 'user', 21, '{\"reason\":\"has_active_borrow_records\",\"active_borrow_count\":3,\"target_user_id\":21,\"target_email\":\"beatrez.villanueva@cvsu.edu.ph\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 05:04:58'),
(54, 1, 'users.delete_failed', 'user', 3, '{\"reason\":\"has_active_borrow_records\",\"active_borrow_count\":2,\"target_user_id\":3,\"target_email\":\"student@university.test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 05:05:07'),
(55, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 05:14:44'),
(56, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 05:32:16'),
(57, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 09:31:39'),
(58, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 09:55:20'),
(59, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 10:01:53'),
(60, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 10:10:38'),
(61, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 10:15:09'),
(62, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 10:15:15'),
(63, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 10:19:12'),
(64, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 11:49:15'),
(65, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 11:50:54'),
(66, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 11:51:02'),
(67, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:03:33'),
(68, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:13:06'),
(69, 2, 'book.upload_cover', 'book', 4, '{\"filename\":\"book-4-1779279193.png\",\"title\":\"Linear Algebra Done Right\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:13:13'),
(70, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:38:41'),
(71, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:48:20'),
(72, 2, 'book.upload_cover', 'book', 3, '{\"filename\":\"book-3-1779281337.jpg\",\"title\":\"Pride and Prejudice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:48:57'),
(73, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:54:23'),
(74, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:54:39'),
(75, 3, 'auth.login_failed', 'user', 3, '{\"reason\":\"invalid_credentials\",\"email\":\"student@university.test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:54:47'),
(76, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:54:56'),
(77, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:55:49'),
(78, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:55:56'),
(79, 2, 'book.upload_cover', 'book', 2, '{\"filename\":\"book-2-1779281828.jpg\",\"title\":\"Introduction to Algorithms\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 12:57:08'),
(80, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:03:01'),
(81, 2, 'book.upload_cover', 'book', 2, '{\"filename\":\"book-2-1779282191.png\",\"title\":\"Introduction to Algorithms\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:03:11'),
(82, 2, 'book.upload_cover', 'book', 2, '{\"filename\":\"book-2-1779282206.jpg\",\"title\":\"Introduction to Algorithms\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:03:26'),
(83, 2, 'book.upload_cover', 'book', 2, '{\"filename\":\"book-2-1779282220.jpg\",\"title\":\"Introduction to Algorithms\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:03:40'),
(84, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:04:25'),
(85, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:07:24'),
(86, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:08:02'),
(87, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:09:15'),
(88, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:15:19'),
(89, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:17:51'),
(90, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:17:57'),
(91, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:18:41'),
(92, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:18:49'),
(93, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:28:02'),
(94, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:34:27'),
(95, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 13:47:41'),
(96, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:24:51'),
(97, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:29:04'),
(98, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:29:10'),
(99, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:40:35'),
(100, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:40:37'),
(101, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:40:43'),
(102, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:42:24'),
(103, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:44:38'),
(104, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:50:09'),
(105, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:53:41'),
(106, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:53:46'),
(107, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:53:56'),
(108, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:54:01'),
(109, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:56:31'),
(110, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:56:35'),
(111, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:59:04'),
(112, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 14:59:17'),
(113, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 15:20:19'),
(114, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 15:25:03'),
(115, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 15:53:12'),
(116, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 16:34:15'),
(117, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:01:38'),
(118, 2, 'auth.login_failed', 'user', 2, '{\"reason\":\"invalid_credentials\",\"email\":\"librarian@university.test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:10:14'),
(119, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:10:21'),
(120, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:10:26'),
(121, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:10:34'),
(122, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:18:22'),
(123, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:18:33'),
(124, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:18:39'),
(125, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:30:31'),
(126, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:30:36'),
(127, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:30:41'),
(128, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:30:51'),
(129, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:30:57'),
(130, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:31:12'),
(131, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:31:20'),
(132, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 17:36:43'),
(133, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 18:15:40'),
(134, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 18:16:12'),
(135, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 18:16:18'),
(136, 3, 'borrow.request', 'borrow_record', 7, '{\"book_id\":3,\"book_title\":\"Pride and Prejudice\",\"borrow_date\":\"2026-05-20\",\"due_date\":\"2026-06-03\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 18:16:22'),
(137, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 18:16:27'),
(138, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 18:16:40'),
(139, 2, 'borrow.approve', 'borrow_record', 7, '{\"borrower_user_id\":3,\"book_id\":3,\"book_title\":\"Pride and Prejudice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 18:16:47'),
(140, 2, 'borrow.return_failed', 'borrow_record', 7, '{\"reason\":\"exception\",\"error\":\"SQLSTATE[42S22]: Column not found: 1054 Unknown column \'updated_at\' in \'field list\'\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 18:17:19'),
(141, 2, 'borrow.return_failed', 'borrow_record', 3, '{\"reason\":\"exception\",\"error\":\"SQLSTATE[42S22]: Column not found: 1054 Unknown column \'updated_at\' in \'field list\'\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 18:17:37'),
(142, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-20 18:18:51'),
(143, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:17:07'),
(144, 2, 'borrow.return_failed', 'borrow_record', 7, '{\"reason\":\"exception\",\"error\":\"SQLSTATE[42S22]: Column not found: 1054 Unknown column \'updated_at\' in \'field list\'\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:17:46'),
(145, 2, 'borrow.return', 'borrow_record', 7, '{\"book_id\":3,\"book_title\":\"Pride and Prejudice\",\"borrower_user_id\":3,\"borrower_name\":\"Student User\",\"borrower_email\":\"student@university.test\",\"return_date\":\"2026-05-21\",\"was_overdue\":\"no\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:21:25'),
(146, 2, 'borrow.return', 'borrow_record', 6, '{\"book_id\":1,\"book_title\":\"Clean Code\",\"borrower_user_id\":3,\"borrower_name\":\"Student User\",\"borrower_email\":\"student@university.test\",\"return_date\":\"2026-05-21\",\"was_overdue\":\"no\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:21:35'),
(147, 2, 'borrow.return', 'borrow_record', 2, '{\"book_id\":4,\"book_title\":\"Linear Algebra Done Right\",\"borrower_user_id\":21,\"borrower_name\":\"Beatrez Villanueva\",\"borrower_email\":\"beatrez.villanueva@cvsu.edu.ph\",\"return_date\":\"2026-05-21\",\"was_overdue\":\"no\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:21:35'),
(148, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:21:51'),
(149, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:22:00'),
(150, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:27:08'),
(151, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:31:34'),
(152, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:32:34'),
(153, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:32:41'),
(154, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:32:50'),
(155, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:32:56'),
(156, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:33:58'),
(157, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:34:04'),
(158, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:41:28'),
(159, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 01:46:46'),
(160, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 02:00:18'),
(161, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 02:03:48'),
(162, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 02:10:57'),
(163, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 05:47:49'),
(164, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 05:54:12'),
(165, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:14:36'),
(166, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:19:17'),
(167, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:25:01'),
(168, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:35:01'),
(169, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:39:05'),
(170, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:39:13'),
(171, 3, 'borrow.request', 'borrow_record', 8, '{\"book_id\":3,\"book_title\":\"Pride and Prejudice\",\"borrow_date\":\"2026-05-21\",\"due_date\":\"2026-06-04\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:41:26'),
(172, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:41:29'),
(173, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:41:38'),
(174, 2, 'borrow.approve', 'borrow_record', 8, '{\"borrower_user_id\":3,\"book_id\":3,\"book_title\":\"Pride and Prejudice\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:41:46'),
(175, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:41:55'),
(176, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:42:01'),
(177, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:45:53'),
(178, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:51:39'),
(179, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:51:58'),
(180, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:52:04'),
(181, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:52:12'),
(182, 3, 'auth.login_failed', 'user', 3, '{\"reason\":\"invalid_credentials\",\"email\":\"student@university.test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:52:18'),
(183, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:52:25'),
(184, 3, 'borrow.borrow_failed', 'borrow', NULL, '{\"reason\":\"duplicate_open_request\",\"book_id\":4,\"existing_record_id\":4,\"existing_status\":\"borrowed\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:52:38'),
(185, 3, 'borrow.request', 'borrow_record', 9, '{\"book_id\":2,\"book_title\":\"Introduction to Algorithms\",\"borrow_date\":\"2026-05-21\",\"due_date\":\"2026-06-04\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:55:50'),
(186, 3, 'borrow.cancel', 'borrow_record', 9, '{\"book_id\":2,\"book_title\":\"Introduction to Algorithms\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 06:55:57'),
(187, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 09:56:01'),
(188, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:21:29'),
(189, 2, 'book.upload_cover', 'book', 1, '{\"filename\":\"book-1-1779358932.png\",\"title\":\"Clean Code\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:22:12'),
(190, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:22:20'),
(191, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:23:25');
INSERT INTO `activity_logs` (`id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `details_json`, `ip_address`, `user_agent`, `created_at`) VALUES
(192, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:30:07'),
(193, 3, 'borrow.request', 'borrow_record', 10, '{\"book_id\":2,\"book_title\":\"Introduction to Algorithms\",\"borrow_date\":\"2026-05-21\",\"due_date\":\"2026-06-04\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:30:27'),
(194, 3, 'borrow.cancel', 'borrow_record', 10, '{\"book_id\":2,\"book_title\":\"Introduction to Algorithms\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:30:34'),
(195, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:35:44'),
(196, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:35:46'),
(197, 21, 'auth.forgot_password', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"expires_at\":\"2026-05-21 13:05:54\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:35:58'),
(198, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:39:42'),
(199, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:41:00'),
(200, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:41:11'),
(201, 21, 'auth.forgot_password', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"expires_at\":\"2026-05-21 13:18:37\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:48:41'),
(202, 21, 'auth.forgot_password', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"expires_at\":\"2026-05-21 13:25:57\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:56:01'),
(203, 21, 'auth.forgot_password', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"expires_at\":\"2026-05-21 13:28:23\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 10:58:27'),
(204, 21, 'auth.forgot_password', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"expires_at\":\"2026-05-21 15:07:50\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 12:37:53'),
(205, 21, 'auth.forgot_password', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"expires_at\":\"2026-05-21 15:11:46\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 12:41:49'),
(206, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 13:11:33'),
(207, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 13:22:37'),
(208, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 13:35:59'),
(209, 1, 'users.update', 'user', 21, '{\"target_user_id\":21,\"target_name\":\"Beatrez Villanueva\",\"target_email\":\"beatrez.villanueva@cvsu.edu.ph\",\"target_role\":\"student\",\"target_department\":\"BS Office Administration\",\"target_student_number\":\"202310527\",\"target_status\":\"approved\",\"changed\":{\"name\":null,\"email\":null,\"role\":\"librarian\",\"department\":null,\"student_number\":null,\"status\":null,\"password_changed\":false}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 13:36:43'),
(210, 1, 'users.update', 'user', 21, '{\"target_user_id\":21,\"target_name\":\"Beatrez Villanueva\",\"target_email\":\"beatrez.villanueva@cvsu.edu.ph\",\"target_role\":\"librarian\",\"target_department\":\"BS Office Administration\",\"target_student_number\":\"202310527\",\"target_status\":\"approved\",\"changed\":{\"name\":null,\"email\":null,\"role\":\"student\",\"department\":null,\"student_number\":null,\"status\":null,\"password_changed\":false}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 13:36:45'),
(211, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 15:26:25'),
(212, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-21 15:43:20'),
(213, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 03:11:08'),
(214, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 03:12:14'),
(215, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 04:23:12'),
(216, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 05:53:04'),
(217, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-22 05:54:22'),
(218, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-22 05:56:08'),
(219, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-22 05:56:19'),
(220, 21, 'auth.forgot_password', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"expires_at\":\"2026-05-22 08:33:21\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 06:03:26'),
(221, NULL, 'auth.reset_password', 'user', NULL, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 06:03:45'),
(222, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 06:03:55'),
(223, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 06:03:57'),
(224, 21, 'auth.login_failed', 'user', 21, '{\"reason\":\"invalid_credentials\",\"email\":\"beatrez.villanueva@cvsu.edu.ph\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 06:04:04'),
(225, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 06:04:12'),
(226, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 06:04:13'),
(227, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-22 06:06:19'),
(228, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-22 06:07:33'),
(229, 3, 'auth.login_failed', 'user', 3, '{\"reason\":\"invalid_credentials\",\"email\":\"student@university.test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-22 06:07:40'),
(230, 21, 'auth.login_failed', 'user', 21, '{\"reason\":\"invalid_credentials\",\"email\":\"beatrez.villanueva@cvsu.edu.ph\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 08:34:00'),
(231, 21, 'auth.login_failed', 'user', 21, '{\"reason\":\"invalid_credentials\",\"email\":\"beatrez.villanueva@cvsu.edu.ph\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 08:34:03'),
(232, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 08:34:07'),
(233, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 08:45:35'),
(234, 1, 'auth.login_failed', 'user', 1, '{\"reason\":\"invalid_credentials\",\"email\":\"admin@university.test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 09:05:08'),
(235, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 09:05:13'),
(236, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 09:06:03'),
(237, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 15:20:38'),
(238, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 15:23:59'),
(239, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 15:24:15'),
(240, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 16:09:24'),
(241, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 16:11:16'),
(242, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 16:11:25'),
(243, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 16:19:39'),
(244, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 17:19:49'),
(245, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 17:20:20'),
(246, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 17:20:28'),
(247, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-22 17:20:52'),
(248, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 01:17:58'),
(249, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 01:46:16'),
(250, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 01:47:36'),
(251, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 01:47:42'),
(252, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 01:48:15'),
(253, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 01:48:21'),
(254, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 01:48:54'),
(255, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 01:49:17'),
(256, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 01:49:43'),
(257, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 01:49:57'),
(258, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 01:50:31'),
(259, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 05:03:52'),
(260, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 05:56:54'),
(261, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 09:15:24'),
(262, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 09:19:23'),
(263, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 09:20:25'),
(264, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 09:21:25'),
(265, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 09:21:31'),
(266, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 09:31:52'),
(267, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 09:47:59'),
(268, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:01:56'),
(269, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:07:39'),
(270, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:08:29'),
(271, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:08:35'),
(272, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:09:06'),
(273, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:09:12'),
(274, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:13:28'),
(275, 2, 'announcement.create', 'announcement', 1, '{\"title\":\"\\\"LIBRARY CLOSED TOMORROW\\\"\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:13:48'),
(276, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:14:56'),
(277, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:15:02'),
(278, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:45:47'),
(279, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:46:30'),
(280, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:46:38'),
(281, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:58:45'),
(282, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:59:09'),
(283, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:59:20'),
(284, 2, 'announcement.create', 'announcement', 2, '{\"title\":\"HEESAY MEET UP\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:59:51'),
(285, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 10:59:55'),
(286, 3, 'auth.login_failed', 'user', 3, '{\"reason\":\"invalid_credentials\",\"email\":\"student@university.test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:00:01'),
(287, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:00:07'),
(288, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:04:09'),
(289, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:09:52'),
(290, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:13:44'),
(291, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:17:46'),
(292, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:17:53'),
(293, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:20:41'),
(294, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:20:49'),
(295, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:27:33'),
(296, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:30:31'),
(297, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:30:38'),
(298, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:31:00'),
(299, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:31:06'),
(300, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:31:11'),
(301, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 11:36:15'),
(302, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:04:04'),
(303, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:05:06'),
(304, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:05:20'),
(305, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:05:28'),
(306, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:05:43'),
(307, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:05:47'),
(308, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:05:57'),
(309, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:06:02'),
(310, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:06:10'),
(311, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:06:16'),
(312, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:30:59'),
(313, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:33:57'),
(314, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:34:06'),
(315, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:34:32'),
(316, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:34:41'),
(317, 2, 'announcement.create', 'announcement', 3, '{\"title\":\"NO CLASSES\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:35:06'),
(318, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:35:09'),
(319, 3, 'auth.login_failed', 'user', 3, '{\"reason\":\"invalid_credentials\",\"email\":\"student@university.test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:35:15'),
(320, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:35:20'),
(321, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:35:28'),
(322, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:35:35'),
(323, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 13:36:47'),
(324, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:19:09'),
(325, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:20:14'),
(326, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:20:30'),
(327, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:21:19'),
(328, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:21:25'),
(329, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:28:19'),
(330, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:28:41'),
(331, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:28:53'),
(332, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:32:25'),
(333, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:32:31'),
(334, 2, 'announcement.create', 'announcement', 4, '{\"title\":\"test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:32:54'),
(335, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:32:56'),
(336, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:33:04'),
(337, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:33:13'),
(338, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:33:23'),
(339, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:45:20'),
(340, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:55:56'),
(341, 2, 'import.books_preview', 'import', NULL, '{\"preview_rows\":1,\"invalid_rows\":0,\"note\":\"Preview only (no DB write)\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:56:36'),
(342, 2, 'import.books_commit', 'import', NULL, '{\"inserted\":1,\"updated\":0,\"skipped\":0,\"total_submitted\":1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:56:40'),
(343, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:57:47'),
(344, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 15:57:55'),
(345, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 16:16:32'),
(346, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 16:16:40'),
(347, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 16:16:49'),
(348, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 16:18:26'),
(349, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 16:18:33'),
(350, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-23 16:19:01'),
(351, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-24 12:47:04'),
(352, 2, 'book.upload_cover', 'book', 5, '{\"filename\":\"book-5-1779626933.jpg\",\"title\":\"Dont cry angel\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-24 12:48:53'),
(353, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-24 13:15:32'),
(354, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-24 13:15:53'),
(355, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-24 13:16:02'),
(356, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-24 13:17:32'),
(357, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 01:51:19'),
(358, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 01:55:24'),
(359, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 01:58:46'),
(360, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 01:58:52'),
(361, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 01:58:59'),
(362, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 01:59:04'),
(363, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 01:59:10'),
(364, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 01:59:17'),
(365, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:08:57'),
(366, 1, 'announcement.create', 'announcement', 5, '{\"title\":\"test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:12:05'),
(367, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:12:08'),
(368, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:12:13'),
(369, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:20:28'),
(370, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:37:25'),
(371, 1, 'announcement.create', 'announcement', 6, '{\"title\":\"test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:37:51'),
(372, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:37:52'),
(373, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:38:00'),
(374, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:43:17'),
(375, 3, 'borrow.borrow_failed', 'borrow', NULL, '{\"reason\":\"duplicate_open_request\",\"book_id\":4,\"existing_record_id\":4,\"existing_status\":\"borrowed\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:43:37'),
(376, 3, 'borrow.borrow_failed', 'borrow', NULL, '{\"reason\":\"duplicate_open_request\",\"book_id\":3,\"existing_record_id\":8,\"existing_status\":\"borrowed\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:43:40'),
(377, 3, 'borrow.request', 'borrow_record', 11, '{\"book_id\":5,\"book_title\":\"Dont cry angel\",\"borrow_date\":\"2026-05-25\",\"due_date\":\"2026-06-08\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:43:42'),
(378, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:43:53'),
(379, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 02:43:58'),
(380, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:01:38'),
(381, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:01:50'),
(382, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:01:55'),
(383, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:14:03'),
(384, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:14:10'),
(385, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:14:15');
INSERT INTO `activity_logs` (`id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `details_json`, `ip_address`, `user_agent`, `created_at`) VALUES
(386, 21, 'borrow.request', 'borrow_record', 12, '{\"book_id\":1,\"book_title\":\"Clean Code\",\"borrow_date\":\"2026-05-25\",\"due_date\":\"2026-06-08\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:15:37'),
(387, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:15:44'),
(388, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:15:56'),
(389, 2, 'borrow.approve', 'borrow_record', 12, '{\"borrower_user_id\":21,\"book_id\":1,\"book_title\":\"Clean Code\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:16:22'),
(390, 2, 'borrow.approve', 'borrow_record', 11, '{\"borrower_user_id\":3,\"book_id\":5,\"book_title\":\"Dont cry angel\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:16:22'),
(391, 2, 'borrow.return', 'borrow_record', 12, '{\"book_id\":1,\"book_title\":\"Clean Code\",\"borrower_user_id\":21,\"borrower_name\":\"Beatrez Villanueva\",\"borrower_email\":\"beatrez.villanueva@cvsu.edu.ph\",\"return_date\":\"2026-05-25\",\"was_overdue\":\"no\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:20:02'),
(392, 2, 'borrow.return', 'borrow_record', 11, '{\"book_id\":5,\"book_title\":\"Dont cry angel\",\"borrower_user_id\":3,\"borrower_name\":\"Student User\",\"borrower_email\":\"student@university.test\",\"return_date\":\"2026-05-25\",\"was_overdue\":\"no\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:20:02'),
(393, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:29:51'),
(394, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:31:06'),
(395, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:31:11'),
(396, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:49:46'),
(397, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:49:58'),
(398, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:50:11'),
(399, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:50:20'),
(400, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:50:29'),
(401, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:50:57'),
(402, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:51:03'),
(403, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:51:05'),
(404, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 03:51:10'),
(405, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 04:18:32'),
(406, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 04:56:08'),
(407, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 04:56:11'),
(408, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 07:37:04'),
(409, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 07:37:56'),
(410, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 08:06:10'),
(411, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 08:06:21'),
(412, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 08:08:21'),
(413, 1, 'auth.logout', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 08:08:28'),
(414, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 08:29:32'),
(415, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 08:29:50'),
(416, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 08:30:00'),
(417, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 12:27:35'),
(418, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 12:54:24'),
(419, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 12:54:33'),
(420, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 12:54:43'),
(421, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 12:59:21'),
(422, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 13:30:42'),
(423, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 13:30:45'),
(424, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 13:31:29'),
(425, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 13:31:57'),
(426, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 15:23:23'),
(427, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 15:36:19'),
(428, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 15:36:45'),
(429, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 15:36:57'),
(430, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 15:37:01'),
(431, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 15:38:50'),
(432, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 15:43:30'),
(433, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 15:43:38'),
(434, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 15:43:53'),
(435, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 15:44:01'),
(436, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 15:55:37'),
(437, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 16:13:30'),
(438, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 16:16:31'),
(439, 1, 'auth.login_success', 'user', 1, '{\"email\":\"admin@university.test\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 16:16:37'),
(440, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 16:40:44'),
(441, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 16:51:03'),
(442, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 17:04:27'),
(443, 2, 'borrow.return', 'borrow_record', 2, '{\"book_id\":4,\"book_title\":\"Linear Algebra Done Right\",\"borrower_user_id\":21,\"borrower_name\":\"Beatrez Villanueva\",\"borrower_email\":\"beatrez.villanueva@cvsu.edu.ph\",\"return_date\":\"2026-05-25\",\"was_overdue\":\"yes\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 17:07:25'),
(444, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-25 17:10:32'),
(445, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:28:23'),
(446, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:28:30'),
(447, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:28:42'),
(448, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:28:58'),
(449, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:29:11'),
(450, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:29:32'),
(451, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:29:40'),
(452, 21, 'borrow.request', 'borrow_record', 13, '{\"book_id\":5,\"book_title\":\"Dont cry angel\",\"borrow_date\":\"2026-05-26\",\"due_date\":\"2026-06-09\",\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:29:43'),
(453, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:29:46'),
(454, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:29:54'),
(455, 2, 'borrow.approve', 'borrow_record', 13, '{\"borrower_user_id\":21,\"book_id\":5,\"book_title\":\"Dont cry angel\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:30:15'),
(456, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:30:30'),
(457, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:30:38'),
(458, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:30:56'),
(459, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 00:31:05'),
(460, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 01:09:29'),
(461, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 01:13:10'),
(462, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 01:17:59'),
(463, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 01:26:29'),
(464, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 01:29:24'),
(465, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 01:29:35'),
(466, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 01:37:04'),
(467, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 01:38:47'),
(468, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 01:38:53'),
(469, 21, 'auth.login_success', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 02:16:36'),
(470, 21, 'auth.logout', 'user', 21, '{\"email\":\"beatrez.villanueva@cvsu.edu.ph\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 02:17:09'),
(471, 2, 'auth.login_success', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 02:17:17'),
(472, 2, 'auth.logout', 'user', 2, '{\"email\":\"librarian@university.test\",\"role\":\"librarian\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 02:17:55'),
(473, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 02:18:04'),
(474, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 02:20:58'),
(475, 3, 'auth.login_success', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 02:21:08'),
(476, 3, 'auth.logout', 'user', 3, '{\"email\":\"student@university.test\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 02:21:33');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `posted_by` int(11) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcement_reads`
--

CREATE TABLE `announcement_reads` (
  `id` int(10) UNSIGNED NOT NULL,
  `announcement_id` int(11) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `message`, `posted_by`, `status`, `created_at`, `updated_at`) VALUES
(1, '\"LIBRARY CLOSED\"', 'Operating hours: M-F / 8AM - 6PM', 2, 'active', '2026-05-23 10:13:48', '2026-05-23 15:45:46'),
(2, 'HEESAY MEET UP', 'SM BACOOR - 10PM NG GABI. ANO G?', 2, 'active', '2026-05-23 10:59:51', '2026-05-25 01:59:09'),
(6, 'test', 'sample', 1, 'active', '2026-05-25 02:37:51', '2026-05-25 02:37:51');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `isbn` varchar(32) NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `copies_total` int(11) NOT NULL DEFAULT 0,
  `copies_available` int(11) NOT NULL DEFAULT 0,
  `shelf_location` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `cover_image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `category_id`, `year`, `description`, `copies_total`, `copies_available`, `shelf_location`, `created_at`, `cover_image_url`) VALUES
(1, 'Clean Code', 'Robert C. Martin', '9780132350884', 1, 2008, 'A Handbook of Agile Software Craftsmanship', 5, 5, 'A1-CS', '2026-05-19 15:26:09', '/covers/book-1-1779358932.png'),
(2, 'Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 1, 2010, 'CLRS algorithms bible', 5, 4, 'A2-CS', '2026-05-19 15:26:09', '/covers/book-2-1779282220.jpg'),
(3, 'Pride and Prejudice', 'Jane Austen', '9780141439518', 2, 1813, 'Classic novel', 4, 2, 'B1-LIT', '2026-05-19 15:26:09', '/covers/book-3-1779281337.jpg'),
(4, 'Linear Algebra Done Right', 'Sheldon Axler', '9783319110790', 3, 2015, 'Linear algebra textbook', 2, 2, 'C1-MATH', '2026-05-19 15:26:09', '/covers/book-4-1779279193.png'),
(5, 'Dont cry angel', 'J.K. Rowling', '9.78014E+12', 4, 2026, 'Classic Novel', 0, 0, 'A2 - CS', '2026-05-23 15:56:40', '/covers/book-5-1779626933.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `borrow_records`
--

CREATE TABLE `borrow_records` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `book_id` int(10) UNSIGNED NOT NULL,
  `borrow_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `overdue_email_sent` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `borrow_records`
--

INSERT INTO `borrow_records` (`id`, `user_id`, `book_id`, `borrow_date`, `due_date`, `return_date`, `status`, `created_at`, `updated_at`, `overdue_email_sent`) VALUES
(1, 21, 3, '2026-05-19', '2026-06-01', NULL, 'borrowed', '2026-05-25 16:40:04', '2026-05-25 15:25:28', 0),
(2, 21, 4, '2026-05-19', '2026-05-23', '2026-05-25', 'returned', '2026-05-25 16:40:04', '2026-05-25 17:07:25', 1),
(3, 21, 2, '2026-05-19', '2026-06-02', NULL, 'borrowed', '2026-05-25 16:40:04', '2026-05-21 01:20:55', 0),
(4, 3, 4, '2026-05-20', '2026-06-03', NULL, 'borrowed', '2026-05-25 16:40:04', '2026-05-21 01:20:55', 0),
(5, 3, 2, '2026-05-20', '2026-06-03', NULL, 'cancelled', '2026-05-25 16:40:04', '2026-05-21 01:20:55', 0),
(6, 3, 1, '2026-05-20', '2026-06-03', '2026-05-21', 'returned', '2026-05-25 16:40:04', '2026-05-21 01:21:35', 0),
(7, 3, 3, '2026-05-20', '2026-06-03', '2026-05-21', 'returned', '2026-05-25 16:40:04', '2026-05-21 01:21:25', 0),
(8, 3, 3, '2026-05-21', '2026-06-04', NULL, 'borrowed', '2026-05-25 16:40:04', '2026-05-21 06:41:46', 0),
(9, 3, 2, '2026-05-21', '2026-06-04', NULL, 'cancelled', '2026-05-25 16:40:04', '2026-05-21 06:55:57', 0),
(10, 3, 2, '2026-05-21', '2026-06-04', NULL, 'cancelled', '2026-05-25 16:40:04', '2026-05-21 10:30:34', 0),
(11, 3, 5, '2026-05-25', '2026-06-08', '2026-05-25', 'returned', '2026-05-25 16:40:04', '2026-05-25 03:20:02', 0),
(12, 21, 1, '2026-05-25', '2026-06-08', '2026-05-25', 'returned', '2026-05-25 16:40:04', '2026-05-25 03:20:02', 0),
(13, 21, 5, '2026-05-26', '2026-06-09', NULL, 'borrowed', '2026-05-26 00:29:43', '2026-05-26 00:30:15', 0);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Computer Science'),
(2, 'Literature'),
(3, 'Mathematics'),
(4, 'Romance');

-- --------------------------------------------------------

--
-- Table structure for table `due_date_reminders`
--

CREATE TABLE `due_date_reminders` (
  `id` int(11) NOT NULL,
  `borrow_record_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reminder_type` enum('1_day','3_days') NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `ip` varchar(64) NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  `last_attempt_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `overdue_notifications`
--

CREATE TABLE `overdue_notifications` (
  `id` int(11) NOT NULL,
  `record_id` int(11) NOT NULL,
  `notified_date` date NOT NULL,
  `student_email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `overdue_notifications`
--

INSERT INTO `overdue_notifications` (`id`, `record_id`, `notified_date`, `student_email`, `created_at`) VALUES
(4, 2, '2026-05-25', 'beatrez.villanueva@cvsu.edu.ph', '2026-05-25 15:41:06'),
(5, 2, '2026-05-26', 'beatrez.villanueva@cvsu.edu.ph', '2026-05-25 16:13:30');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','librarian','student') NOT NULL DEFAULT 'student',
  `department` varchar(50) DEFAULT NULL,
  `student_number` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) NOT NULL DEFAULT 'approved'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `department`, `student_number`, `created_at`, `status`) VALUES
(1, 'Admin User', 'admin@university.test', '$2y$10$1XpL..F7gcAwtIaQ4CvIl.JNRH2UX69MMoVsHfqYmCFW4Fl5aRnCq', 'admin', NULL, NULL, '2026-02-21 14:38:45', 'approved'),
(2, 'Librarian User', 'librarian@university.test', '$2y$10$1XpL..F7gcAwtIaQ4CvIl.JNRH2UX69MMoVsHfqYmCFW4Fl5aRnCq', 'librarian', NULL, NULL, '2026-02-21 14:38:45', 'approved'),
(3, 'Student User', 'student@university.test', '$2y$10$1XpL..F7gcAwtIaQ4CvIl.JNRH2UX69MMoVsHfqYmCFW4Fl5aRnCq', 'student', NULL, NULL, '2026-02-21 14:38:45', 'approved'),
(21, 'Beatrez Villanueva', 'beatrez.villanueva@cvsu.edu.ph', '$2y$10$Q0LqlmUYNH6/27qBRkCnkOxn.SvURS3TsdHDKF7lOgBUppsHiw0lK', 'student', 'BS Office Administration', '202310527', '2026-05-19 14:27:18', 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `language` varchar(10) DEFAULT 'en',
  `theme_mode` varchar(10) DEFAULT 'system',
  `font_size` varchar(10) DEFAULT 'normal',
  `text_to_speech_enabled` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_logs_created` (`created_at`),
  ADD KEY `idx_logs_actor` (`actor_user_id`),
  ADD KEY `idx_logs_action` (`action`),
  ADD KEY `idx_logs_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_announcement_reads_user` (`announcement_id`,`user_id`),
  ADD KEY `idx_announcement_reads_user` (`user_id`),
  ADD KEY `idx_announcement_reads_announcement` (`announcement_id`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `isbn` (`isbn`),
  ADD UNIQUE KEY `uniq_books_isbn` (`isbn`),
  ADD KEY `idx_books_title` (`title`),
  ADD KEY `idx_books_author` (`author`),
  ADD KEY `idx_books_isbn` (`isbn`),
  ADD KEY `idx_books_category` (`category_id`),
  ADD KEY `idx_books_avail` (`copies_available`);

--
-- Indexes for table `borrow_records`
--
ALTER TABLE `borrow_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_borrow_user_status` (`user_id`,`status`),
  ADD KEY `idx_borrow_book_status` (`book_id`,`status`),
  ADD KEY `idx_borrow_due` (`due_date`),
  ADD KEY `idx_borrow_dates` (`borrow_date`,`return_date`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `due_date_reminders`
--
ALTER TABLE `due_date_reminders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_reminder` (`borrow_record_id`,`reminder_type`),
  ADD KEY `idx_sent_at` (`sent_at`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email` (`email`),
  ADD KEY `idx_locked_until` (`locked_until`),
  ADD KEY `idx_last_attempt_at` (`last_attempt_at`);

--
-- Indexes for table `overdue_notifications`
--
ALTER TABLE `overdue_notifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_record_date` (`record_id`,`notified_date`),
  ADD KEY `idx_record` (`record_id`),
  ADD KEY `idx_date` (`notified_date`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_password_resets_email` (`email`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `uniq_users_student_number` (`student_number`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=477;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `borrow_records`
--
ALTER TABLE `borrow_records`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `due_date_reminders`
--
ALTER TABLE `due_date_reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `overdue_notifications`
--
ALTER TABLE `overdue_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_logs_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `borrow_records`
--
ALTER TABLE `borrow_records`
  ADD CONSTRAINT `fk_borrow_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_borrow_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
