-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 03, 2026 at 06:22 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kainafresh`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth_tokens`
--

CREATE TABLE `auth_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `token` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_tokens`
--

INSERT INTO `auth_tokens` (`id`, `user_id`, `token`, `ip_address`, `user_agent`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InNoeWFrYSIsImVtYWlsIjoic2h5YWthQGdtYWlsLmNvbSIsImV4cCI6MTc4Njg5OTYxOCwiaWF0IjoxNzg2ODk2MDE4LCJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3Q6ODAwMCJ9.9RRqYpMRp9Gimp7KZRPXuWrLJCJtydiaSXUuQ8BmQqY', '127.0.0.1', 'PostmanRuntime/7.56.0', '2026-08-16 19:00:18', '2026-08-16 16:00:18', '2026-08-16 16:00:18'),
(2, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg3MjM2NTc3LCJpYXQiOjE3ODcyMzI5NzcsImlzcyI6ImxvY2FsaG9zdCJ9.8zS6Fh0hFopPDLg0InbLIn73gczUFtPIlYPT_54ZbU4', '::1', 'PostmanRuntime/7.49.1', '2026-08-20 14:36:17', '2026-08-20 13:36:17', '2026-08-20 13:36:17'),
(3, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg3MjM4ODQ2LCJpYXQiOjE3ODcyMzUyNDYsImlzcyI6ImxvY2FsaG9zdCJ9.8ANGrpgm9Y0VpSeNwLg0PDZ5epcRofLfw5btR5XjKOM', '::1', 'PostmanRuntime/7.49.1', '2026-08-20 15:14:06', '2026-08-20 14:14:06', '2026-08-20 14:14:06'),
(4, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg3MjQxODQ5LCJpYXQiOjE3ODcyMzgyNDksImlzcyI6ImxvY2FsaG9zdCJ9.Jld01uLMzj1apDU0GhU10TrrG5vbVq3OoX_OSqeIhmY', '::1', 'PostmanRuntime/7.49.1', '2026-08-20 16:04:09', '2026-08-20 15:04:09', '2026-08-20 15:04:09'),
(5, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg3MzE3NjAyLCJpYXQiOjE3ODczMTQwMDIsImlzcyI6ImxvY2FsaG9zdCJ9._tbornKI1xaxbmYUDp6bibJWttXbeiPJDD0c3wd008o', '::1', 'PostmanRuntime/7.49.1', '2026-08-21 13:06:42', '2026-08-21 12:06:42', '2026-08-21 12:06:42'),
(6, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg3NTY1MzIzLCJpYXQiOjE3ODc1NjE3MjMsImlzcyI6ImxvY2FsaG9zdCJ9.hSX11Utss3FAmlRO2WHxRdp8sPLADHhNA4sljA3Q0hs', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-24 09:55:23', '2026-08-24 08:55:23', '2026-08-24 08:55:23'),
(7, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg3OTIxNDg1LCJpYXQiOjE3ODc5MTc4ODUsImlzcyI6ImxvY2FsaG9zdCJ9.hQNxHMpCMQlCrffKFc2uq1Cspo7d-MpdFvGwSYTStgI', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 12:51:25', '2026-08-28 11:51:25', '2026-08-28 11:51:25'),
(8, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg3OTQ0NDE2LCJpYXQiOjE3ODc5NDA4MTYsImlzcyI6ImxvY2FsaG9zdCJ9.7ny64mnSkzFaqOcPO7H3WjS2F5FDoa8MqauZv-jKQnI', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-28 19:13:36', '2026-08-28 18:13:36', '2026-08-28 18:13:36'),
(9, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4MDIxMzU1LCJpYXQiOjE3ODgwMTc3NTUsImlzcyI6ImxvY2FsaG9zdCJ9.1bwdmfNyEOe6_wfJPcsfb47HrLAAr0a9X7fzhhqqP9I', '127.0.0.1', 'PostmanRuntime/7.49.1', '2026-08-29 16:35:55', '2026-08-29 15:35:55', '2026-08-29 15:35:55'),
(10, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4MDI1MDAxLCJpYXQiOjE3ODgwMjE0MDEsImlzcyI6ImxvY2FsaG9zdCJ9.mBKxTnLec7DmxYRAWU2mlwe-B2KjWMR2nR6J-OLrQoo', '127.0.0.1', 'PostmanRuntime/7.49.1', '2026-08-29 17:36:41', '2026-08-29 16:36:41', '2026-08-29 16:36:41'),
(11, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4MDI4NjY2LCJpYXQiOjE3ODgwMjUwNjYsImlzcyI6ImxvY2FsaG9zdCJ9.gS47iTqRCo1H14tSBN82cO5QxiRlvgqGy0TRYx7hVCk', '127.0.0.1', 'PostmanRuntime/7.49.1', '2026-08-29 18:37:46', '2026-08-29 17:37:46', '2026-08-29 17:37:46'),
(12, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4MDI4ODg1LCJpYXQiOjE3ODgwMjUyODUsImlzcyI6ImxvY2FsaG9zdCJ9.4PjiBpS-uaa-cGGAo1T3UeVX81X-1dNifZAHqvDh3Us', '127.0.0.1', 'PostmanRuntime/7.49.1', '2026-08-29 18:41:25', '2026-08-29 17:41:25', '2026-08-29 17:41:25'),
(13, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4MDMzMTAwLCJpYXQiOjE3ODgwMjk1MDAsImlzcyI6ImxvY2FsaG9zdCJ9.sudggROJtzIr4cFfUkyW9KySW_2vNUli4yb9WzI77TY', '127.0.0.1', 'PostmanRuntime/7.49.1', '2026-08-29 19:51:40', '2026-08-29 18:51:40', '2026-08-29 18:51:40'),
(14, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4MDM2OTIxLCJpYXQiOjE3ODgwMzMzMjEsImlzcyI6ImxvY2FsaG9zdCJ9.rMVow6hHyNRtGIg7wFNTfB2KWdqmonq2kBP4dx2LahE', '127.0.0.1', 'PostmanRuntime/7.49.1', '2026-08-29 20:55:21', '2026-08-29 19:55:21', '2026-08-29 19:55:21'),
(15, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4MjAzMjI5LCJpYXQiOjE3ODgxOTk2MjksImlzcyI6ImxvY2FsaG9zdCJ9.ERKluj-NxUex4PLhS2RKzcDSN22AWPCyyh5oxHkPe1U', '127.0.0.1', 'PostmanRuntime/7.49.1', '2026-08-31 19:07:09', '2026-08-31 18:07:09', '2026-08-31 18:07:09'),
(16, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4MjEzNzUyLCJpYXQiOjE3ODgyMTAxNTIsImlzcyI6ImxvY2FsaG9zdCJ9.n8CKBau3gFqZ8DbNjLJKEOjaqFvJermGX_0u79wO40Q', '127.0.0.1', 'PostmanRuntime/7.49.1', '2026-08-31 22:02:32', '2026-08-31 21:02:32', '2026-08-31 21:02:32'),
(17, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4MjE1NzQ3LCJpYXQiOjE3ODgyMTIxNDcsImlzcyI6ImxvY2FsaG9zdCJ9.nhoxJYIGMWVP2uWso8PH81TyAMPh1QsFGK7KMlY8azM', '127.0.0.1', 'PostmanRuntime/7.49.1', '2026-08-31 22:35:47', '2026-08-31 21:35:47', '2026-08-31 21:35:47'),
(18, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4MzQwNzUzLCJpYXQiOjE3ODgzMzcxNTMsImlzcyI6ImxvY2FsaG9zdCJ9.4Xxn33iXNQZAsFU6y1tsFJX4BQOJtvCLpwBww-oqkQ0', '127.0.0.1', 'PostmanRuntime/7.49.1', '2026-09-02 09:19:13', '2026-09-02 08:19:13', '2026-09-02 08:19:13'),
(19, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4MzQ3ODY4LCJpYXQiOjE3ODgzNDQyNjgsImlzcyI6ImxvY2FsaG9zdCJ9.ksGahn9W1t90ZgOYEKbPmwfZ90ju0nnu7Z-EWHuXaiw', '127.0.0.1', 'PostmanRuntime/7.49.1', '2026-09-02 11:17:48', '2026-09-02 10:17:48', '2026-09-02 10:17:48'),
(20, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4NDUzMzk3LCJpYXQiOjE3ODg0NDk3OTcsImlzcyI6ImxvY2FsaG9zdCJ9.1H1BDt3QbjQTvAQBNZ5UQetxl6HSqsyUgWpqD4rtVDg', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-09-03 16:36:37', '2026-09-03 15:36:37', '2026-09-03 15:36:37'),
(21, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4NDUzOTYzLCJpYXQiOjE3ODg0NTAzNjMsImlzcyI6ImxvY2FsaG9zdCJ9._R3KoZ0krPDCh_4sMIKf0QK08zSQP6oYtPBH2_C6m-4', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-09-03 16:46:03', '2026-09-03 15:46:03', '2026-09-03 15:46:03'),
(22, 3, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6IkFsaWNlIiwiZW1haWwiOiJhbGljZUBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4NDU0NDYxLCJpYXQiOjE3ODg0NTA4NjEsImlzcyI6ImxvY2FsaG9zdCJ9.-Vf0TZ3ybS_JNdhx-SBedb8RGJua3z1XAWjVIpunVlU', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-09-03 16:54:21', '2026-09-03 15:54:21', '2026-09-03 15:54:21'),
(23, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4NDU2MDcyLCJpYXQiOjE3ODg0NTI0NzIsImlzcyI6ImxvY2FsaG9zdCJ9.oGh3f7EYk_X7201w49mo2advEW-JbKf6-yXUTqF4oio', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-09-03 17:21:12', '2026-09-03 16:21:12', '2026-09-03 16:21:12'),
(24, 3, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6IkFsaWNlIiwiZW1haWwiOiJhbGljZUBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4NDU2MTI3LCJpYXQiOjE3ODg0NTI1MjcsImlzcyI6ImxvY2FsaG9zdCJ9.KYmFpDWYTK5FuTqgVMNySnGHuh-YLxdtWz8mNIamfDg', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-09-03 17:22:07', '2026-09-03 16:22:07', '2026-09-03 16:22:07'),
(25, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg4NDU2MTQwLCJpYXQiOjE3ODg0NTI1NDAsImlzcyI6ImxvY2FsaG9zdCJ9.bZ7nTbRH7H8pCkRfMpzAecvhmWMi2VmuS_S8SmJoWlg', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-09-03 17:22:20', '2026-09-03 16:22:20', '2026-09-03 16:22:20');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('new','replied') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Fulgence IRADUKUNDA', 'iradukunda@gmail.com', '0788860610', 'Fresh Vegetables', 'I would like to ask if that quantity is exportable', 'new', '2026-08-27 12:22:13', '2026-08-27 12:22:13'),
(2, 'Grace', 'Okekeshayne137@gmail.com', '2567788965', 'Product Question', 'testing', 'new', '2026-08-27 12:34:17', '2026-08-27 12:34:17');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `first_name`, `last_name`, `phone`, `email`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Jeanluc', 'Mugisha', '+250788123456', 'jean@example.com', 'Kigali, Rwanda', '2026-08-26 10:50:12', '2026-08-26 10:50:39');

-- --------------------------------------------------------

--
-- Table structure for table `inquiry`
--

CREATE TABLE `inquiry` (
  `id` int(11) NOT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `contactName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `productInterest` varchar(255) DEFAULT NULL,
  `estimatedQuantity` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('new','replied') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inquiry`
--

INSERT INTO `inquiry` (`id`, `companyName`, `contactName`, `email`, `phone`, `country`, `productInterest`, `estimatedQuantity`, `message`, `status`, `created_at`, `updated_at`) VALUES
(1, 'MTN service center Nyarutarama', 'Fulgence IRADUKUNDA', 'iradukunda@gmail.com', '0788860610', 'Burundi', 'Fresh Vegetables', '50kg', 'I would like to ask if that quantity is exportable', 'new', '2026-08-25 07:38:21', '2026-08-25 07:38:21'),
(2, 'MTN service center Nyarutarama', 'Fulgence IRADUKUNDA', 'iradukunda@gmail.com', '0788860610', 'Burundi', 'Fresh Vegetables', '50kg', 'I would like to ask if that quantity is exportable', 'new', '2026-08-25 07:38:54', '2026-08-25 07:38:54'),
(3, 'LUSTREY GLOBAL', 'Arsene INGENZI', 'arsene@kainafresh.rw', '250788860610', 'Burundi', 'Fresh Vegetables', '500kg', 'testing the vibe', 'new', '2026-08-25 08:01:42', '2026-08-25 08:01:42');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(11) NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES
(1, '20260816093909_create_users_table.php', 1, '2026-08-16 15:56:01'),
(2, '20260816094423_create_auth_tokens_table.php', 1, '2026-08-16 15:56:01'),
(3, '20260816182603_create_pages_table.php', 2, '2026-08-16 17:08:52'),
(4, '20260816192535_create_page_sections_table.php', 3, '2026-08-16 17:29:07'),
(5, '20260816145957_create_settings_table.php', 4, '2026-08-20 13:38:35'),
(6, '20260816153813_create_navlinks_table.php', 4, '2026-08-20 13:38:35'),
(7, '20260822183225_create_team_table.php', 5, '2026-08-22 18:40:51'),
(8, '20260824095433_create_inquiry_table.php', 6, '2026-08-24 19:08:24'),
(9, '20260824095452_create_contacts_table.php', 6, '2026-08-24 19:08:24'),
(11, '20260824125142_create_units_table.php', 7, '2026-08-29 14:53:10'),
(12, '20260824131136_create_products_table.php', 7, '2026-08-29 14:53:10'),
(13, '20260826101448_create_stocks_table.php', 7, '2026-08-29 14:53:10'),
(14, '20260826124741_create_customers_table.php', 7, '2026-08-29 14:53:10'),
(15, '20260826130334_create_orders_table.php', 7, '2026-08-29 14:53:10'),
(16, '20260826132608_create_order_items_table.php', 7, '2026-08-29 14:53:10'),
(17, '20260829143714_create_partners_table.php', 7, '2026-08-29 14:53:10');

-- --------------------------------------------------------

--
-- Table structure for table `navlinks`
--

CREATE TABLE `navlinks` (
  `id` int(11) NOT NULL,
  `link_name` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `link_type` varchar(20) DEFAULT 'main_nav',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `navlinks`
--

INSERT INTO `navlinks` (`id`, `link_name`, `link`, `link_type`, `created_at`, `updated_at`) VALUES
(1, 'Home', '/', 'nav', '2026-08-20 13:39:26', '2026-08-21 14:33:48'),
(7, 'Our Farms', '/about', 'nav', '2026-09-03 15:40:36', '2026-09-03 15:40:36'),
(8, 'Our Products', '/products', 'nav', '2026-09-03 15:40:54', '2026-09-03 15:40:54'),
(9, 'Wholesale & Exports', '/wholesale', 'nav', '2026-09-03 15:41:13', '2026-09-03 15:41:13'),
(12, 'Contact', '/contact', 'nav', '2026-09-03 15:45:27', '2026-09-03 15:45:27');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `order_source` enum('ecommerce','externalorder') NOT NULL DEFAULT 'ecommerce',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `customer_id`, `order_date`, `status`, `total`, `order_source`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, '2026-08-26 12:00:00', 'pending', 30000.00, 'ecommerce', '2026-08-26 11:17:25', '2026-08-26 11:17:25');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` decimal(12,3) NOT NULL DEFAULT 0.000,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 10.000, 30000.00, 300000.00, '2026-08-26 11:35:07', '2026-08-26 11:35:07');

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `seo_image_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`id`, `title`, `slug`, `status`, `seo_title`, `seo_description`, `seo_image_id`, `created_at`, `updated_at`) VALUES
(1, 'Home', 'home', 'published', 'Kaina Fresh - Home', 'Welcome to Kaina Fresh', NULL, '2026-08-16 17:19:08', '2026-08-16 17:19:08'),
(2, 'About Us', 'about', 'published', 'About Kaina Fresh', 'Learn more about Kaina Fresh.', NULL, '2026-08-17 09:27:28', '2026-08-22 13:12:07'),
(3, 'Wholesale', 'wholesale', 'published', NULL, NULL, NULL, '2026-08-23 14:58:53', '2026-08-23 14:58:53'),
(4, 'Contact', 'contact', 'published', NULL, NULL, NULL, '2026-08-25 14:32:09', '2026-08-25 14:32:09');

-- --------------------------------------------------------

--
-- Table structure for table `page_sections`
--

CREATE TABLE `page_sections` (
  `id` int(11) NOT NULL,
  `page_id` int(11) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`content`)),
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `position` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `page_sections`
--

INSERT INTO `page_sections` (`id`, `page_id`, `type`, `title`, `content`, `settings`, `position`, `status`, `created_at`, `updated_at`) VALUES
(5, 1, 'hero', 'Hero', '{\"badge\":\"100% Organic \\u00b7 Farm to Table \",\"heading\":\"Elevate Your Health with Our Proven\",\"headingAccent\":\"Organic\",\"headingAccentSecondary\":\"Farming!\",\"subheading\":\"Our expert team crafts tailored strategies, executes effective farming, and drives sustainable growth for your family\'s nutrition.\",\"primaryCta\":{\"label\":\"Shop Now\",\"to\":\"\\/products\"},\"secondaryCta\":{\"label\":\"Wholesale & Exports\",\"to\":\"\\/wholesale\"}}', '[]', 0, 'active', '2026-08-20 12:12:16', '2026-08-20 13:12:36'),
(7, 1, 'value_props', 'Value Propositions', '{\"tag\":\"Why Kaina Fresh\",\"heading\":\"Fresh Food, Done Right\",\"items\":[{\"iconName\":\"Leaf\",\"title\":\"OrganicallyGrown\",\"description\":\"No synthetic chemicals. Every crop is grown using eco-friendly practices that are good for the soil and good for you.\"},{\"iconName\":\"truck\",\"title\":\"Fast Delivery\",\"description\":\"Order today, receive tomorrow. Our cold-chain logistics ensure your produce arrives as fresh as the day it was picked.\"},{\"iconName\":\"ShieldCheck\",\"title\":\"Quality Guaranteed\",\"description\":\"Every product is hand-inspected and graded before packing. If it\'s not perfect, it doesn\'t leave our farm.\"},{\"iconName\":\"Package\",\"title\":\"Bulk & Wholesale\",\"description\":\"Need large volumes? We supply restaurants, supermarkets, and exporters with consistent, certified bulk produce.\"}]}', '[]', 1, 'active', '2026-08-21 18:05:07', '2026-08-22 08:43:16'),
(11, 1, 'faqs', 'FAQS', '{\"tag\":\"Got Questions?\",\"heading\":\"Frequently Asked Questions\",\"subheading\":\"Everything you need to know about our farming solutions and how we support agriculture\",\"items\":[{\"question\":\"Where is Kaina Fresh Farm located?\",\"answer\":\"Our primary 12-hectare farm is located in the Rwamagana district, Eastern province, Rwanda. This location provides the perfect climate and soil for our premium crops.\"},{\"question\":\"What specific varieties of avocados and pineapples do you grow?\",\"answer\":\"We specialize in Hass and Fuerte avocados, known for their creamy texture and long shelf life. Our pineapples are the local sweet variety (Inanasi), harvested at peak ripeness for maximum flavor.\"},{\"question\":\"Can I request a mix of different products in one order?\",\"answer\":\"Yes. We cater to bulk buyers and supermarkets who require a variety of fresh produce. Simply list your requirements in our inquiry form or contact our sales team.\"},{\"question\":\"How does the wholesale ordering process work?\",\"answer\":\"For local supermarkets and markets, we offer scheduled deliveries and bulk pricing. You can open a local account by emailing sales@kainafresh.rw to receive our weekly price list and availability.\"},{\"question\":\"Do you handle international export logistics?\",\"answer\":\"Kaina Fresh is export-ready. We manage professional packing, cold chain logistics, and all necessary documentation to ensure our produce meets international standards upon arrival.\"},{\"question\":\"What is the minimum order quantity (MOQ) for export?\",\"answer\":\"MOQs vary depending on the product and destination. Please contact exports@kainafresh.rw for a custom quote and to discuss global partnership opportunities.\"}]}', '[]', 3, 'active', '2026-08-22 11:16:58', '2026-08-22 11:16:58'),
(12, 1, 'home-cta', 'Home CTA', '{\"heading\":\"Ready to taste farm-fresh produce?\",\"paragraph\":\"Join over 350 households and businesses already ordering from Kaina Fresh.\",\"primary_cta\":{\"to\":\"\\/product\",\"label\":\"Our Products\"},\"secondary_cta\":{\"to\":\"\\/wholesale\",\"label\":\"Wholesale & Exports\"}}', '[]', 4, 'active', '2026-08-22 11:54:38', '2026-08-22 11:54:38'),
(13, 2, 'about-hero', 'About Hero section', '{\"location\":\"Rwamagana-Rwanda\",\"heading\":\"Growing Fresh\",\"headingHighlight\":\"Sustainable farming. Strict quality standards. Reliable supply.\",\"description\":\"Our 12-hectare farm is the core of our operation. We leverage the fertile soil and favourable climate to produce crops of outstanding quality\",\"cta\":{\"to\":\"\\/contact\",\"label\":\"Get in touch\"},\"stat_top\":{\"stat_number\":\"500\",\"stat_label\":\"Happy customers\"},\"stat_bottom\":{\"stat_number\":\"100%\",\"stat_label\":\"Organic certified\"}}', '[]', 0, 'active', '2026-08-22 13:00:35', '2026-08-22 13:06:53'),
(14, 2, 'about-stats-bar', 'About Stat section', '{\"items\":[{\"value\":\"500+\",\"label\":\"Happy customers\"},{\"value\":\"5+\",\"label\":\"Years Farming\"},{\"value\":\"100%\",\"label\":\"Organic certified\"},{\"value\":\"20+\",\"label\":\"Produce varieties\"}]}', '[]', 1, 'active', '2026-08-22 14:05:55', '2026-08-22 14:05:55'),
(15, 2, 'about-story', 'About Story section', '{\"tag\":\"Our Story\",\"heading\":\"From a small plot of land to a thriving farm.\",\"paragraphs\":\"Kaina Fresh Ltd was established in the rich agricultural heartland of Rwamagana District with a clear goal: to cultivate top-tier produce for both Rwandan and international consumers. Operating on 12 hectares of dedicated farmland, we have honed our practices to grow exceptional avocados, pineapples (inanasi), French beans (imiteja), eggplants (intoryi), and green pepper (puwavuro). Our name, \\u201cKaina,\\u201d reflects our commitment to providing wholesome, natural goodness. We bridge the gap between our farm and your market, delivering a promise of quality, reliability, and authentic Rwandan flavour.\"}', '[]', 2, 'active', '2026-08-22 15:38:45', '2026-08-24 09:00:29'),
(16, 2, 'about-values', 'Mission and values section', '{\"tag\":\"What we stand for\",\"heading\":\"Our Mission,Vision & Values\",\"subheading\":\"Everything we do is guided by a commitment to freshness, sustainability, and the communities that make our farm possible.\",\"vision\":\"To be a leading East African producer and exporter of fresh, high-quality horticultural products, recognized for our sustainable practices and unwavering commitment to excellence.\",\"mission\":\"To consistently cultivate and supply premium, safe, and healthy produce to local and international markets while fostering sustainable agriculture and empowering our local community in Rwamagana.\",\"items\":[{\"icon\":\"Leaf\",\"title\":\"Sustainable Farming\",\"description\":\"We use eco-friendly practices that protect the soil, water, and biodiversity for generations to come.\"},{\"icon\":\"ShieldCheck\",\"title\":\"Quality & Safety\",\"description\":\"Every product is inspected, packed, and handled under strict quality standards before it reaches you.\"},{\"icon\":\"Users\",\"title\":\"Community First\",\"description\":\"We work directly with local communities, creating fair employment and supporting local economies.\"},{\"icon\":\"Award\",\"title\":\"Farm Transparency\",\"description\":\"From seed to delivery, we believe you deserve to know exactly where your food comes from.\"}]}', '[]', 3, 'active', '2026-08-22 16:52:23', '2026-08-22 16:52:23'),
(17, 3, 'wholesale-hero', 'Wholesale Hero', '{\"badge\":\"Wholesale & Exports\",\"heading\":\"Fresh Produce at Scale.\",\"headingHighlight\":\"Direct from Our Farm.\",\"description\":\"Supplying restaurants, supermarkets, distributors, and exporters across East Africa and beyond.Kaina Fresh Ltd is structured to be your reliable B2B partner. We understand the demands of retail and export and are equipped to meet them.\",\"primaryCta\":{\"to\":\"#inquiry-form\",\"label\":\"Submit an inquiry\"},\"secondaryCta\":{\"to\":\"#how-it-works\",\"label\":\"How it works\"},\"client_stat\":{\"stat_number\":\"500+\",\"stat_label\":\"Wholesale clients\"},\"export_stat\":{\"stat_number\":\"6+\",\"stat_label\":\"Export destinations\"},\"product_stat\":{\"stat_number\":\"20\",\"stat_label\":\"Product varieties\"}}', '[]', 0, 'active', '2026-08-23 15:22:20', '2026-08-23 15:30:06'),
(18, 3, 'ws-benefits', 'Why us Section', '{\"tag\":\"Why Kaina Fresh\",\"heading\":\"The Smart Choice for Bulk Buyers\",\"paragraphs\":\"We make large-scale procurement simple, reliable, and cost-effective.\",\"items\":[{\"icon\":\"Package\",\"title\":\"Bulk Pricing\",\"description\":\"Competitive tiered pricing for large volume orders. The more you order, the better the rate.\"},{\"icon\":\"Truck\",\"title\":\"Reliable Delivery\",\"description\":\"Scheduled, on-time delivery with cold-chain logistics to preserve freshness throughout transit.\"},{\"icon\":\"Globe\",\"title\":\"Exported Ready\",\"description\":\"All produce is certified and packaged to meet international export standards and phytosanitary requirements.\"},{\"icon\":\"TrendingUp\",\"title\":\"Consistent Supply\",\"description\":\"Year-round availability on most produce lines. We plan our harvests to match your supply needs.\"},{\"icon\":\"Handshake\",\"title\":\"Dedicated Account Manager\",\"description\":\"Every wholesale client gets a dedicated point of contact for orders, queries, and custom arrangements.\"},{\"icon\":\"CheckCircle\",\"title\":\"Certified Quality\",\"description\":\"All products are organically certified, inspected, and graded before any bulk order is dispatched.\"}]}', '[]', 0, 'active', '2026-08-23 16:02:32', '2026-08-23 16:48:45'),
(19, 3, 'ws-exports', 'Export capabilities Section', '{\"tag\":\"Export Capabilities\",\"heading\":\"We Export Across East Africa & Beyond\",\"paragraphs\":\"KainaFresh is certified for export and has established logistics partnerships for cross-border deliveries. All export produce is packed to international phytosanitary and food safety standards.\",\"items\":[{\"destination\":\"Uganda\"},{\"destination\":\"Burundi\"},{\"destination\":\"Tanzania\"},{\"destination\":\"Kenya\"},{\"destination\":\"DRC\"},{\"destination\":\"Europe (Selected countries\"}]}', '[]', 0, 'active', '2026-08-23 18:29:59', '2026-08-23 18:29:59'),
(20, 3, 'ws-process', 'How it works Section', '{\"tag\":\"The Process\",\"heading\":\"How It Works\",\"paragraphs\":\"From first inquiry to delivery a simple, transparent process\",\"items\":[{\"number\":\"01\",\"title\":\"Submit an Inquiry\",\"description\":\"Fill in the inquiry form below or email us directly. Tell us what you need, quantities, and your preferred delivery schedule.\"},{\"number\":\"02\",\"title\":\"Get a Custom Quote\",\"description\":\"Our team reviews your requirements and sends back a tailored pricing proposal within 24 hours.\"},{\"number\":\"03\",\"title\":\"Confirm & Sign\",\"description\":\"Review the quote, agree on terms, and sign a supply agreement. A deposit confirms your order slot.\"},{\"number\":\"04\",\"title\":\"Harvest, Pack & Deliver\",\"description\":\"We harvest to your schedule, pack under quality control, and dispatch with full tracking.\"}]}', '[]', 0, 'active', '2026-08-23 19:45:18', '2026-08-23 19:45:18'),
(22, 4, 'contact-hero', 'Contact hero Section', '{\"tag\":\"Contact Kaina Fresh\",\"heading\":\"Get in\",\"headingAccesnt\":\" touch with us\",\"subheading\":\"We\'d love to hear from you. Reach out with questions, wholesale inquiries, or feedback.\",\"feedbackHeading\":\"Message Sent!\",\"feedbackMessage\":\"Thank you for reaching out. Our team will get back to you within 24 business hours.\",\"contactheading\":\"Send us a message\",\"contactformsub\":\"Fill in the form below and we\'ll get back to you.\"}', '[]', 0, 'active', '2026-08-27 11:58:04', '2026-08-28 11:47:00'),
(23, 1, 'story-spotlight', 'Story Spotlight Section', '{\"tag\":\"Our Sustainable Farm\",\"heading\":\"Cultivating Organic Goodness Direct From Soil to Table\",\"paragraphs\":\"At KainaFresh, we believe high quality food starts with healthy soil and chemical-free agriculture.We work directly with certified organic farmers to deliver produce picked at peak ripeness.\",\"primaryCta\":{\"label\":\"Read our full story\",\"to\":\"\\/about\"},\"secondaryCta\":{\"label\":\"Learn about bulk supply\",\"to\":\"\\/wholesale\"},\"organic\":{\"label\":\"Organic certified\",\"number\":\"100%\"},\"working_hours\":{\"label\":\"Farm to door\",\"number\":\"24\\/7\"}}', '[]', 0, 'active', '2026-09-03 13:43:16', '2026-09-03 13:43:16'),
(24, 1, 'product_catalog', 'Product Catalog Section', '{\"heading\":\"Looking for more varieties?\",\"paragraphs\":\"Explore our complete catalog of organic root crops, seasonal fruits, leafy greens, and farm produce.\",\"primaryCta\":{\"label\":\"View complete products catalog\",\"to\":\"\\/products\"}}', '[]', 0, 'active', '2026-09-03 14:18:50', '2026-09-03 14:18:50');

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `id` int(11) NOT NULL,
  `partner_name` varchar(255) DEFAULT NULL,
  `partner_logo` text DEFAULT NULL,
  `partner_link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `partners`
--

INSERT INTO `partners` (`id`, `partner_name`, `partner_logo`, `partner_link`, `created_at`, `updated_at`) VALUES
(2, 'ICT CHamber', '/uploads/logos/6a95ec22dc6be.jpeg', 'ictchamber', '2026-08-31 21:03:30', '2026-08-31 21:03:30');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `unit_id` int(11) NOT NULL,
  `shelf_life` int(11) NOT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `product_image`, `unit_id`, `shelf_life`, `price`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Fresh Potatoes ', 'Farm fresh Potatoes', NULL, 1, 14, 2500.00, 'active', '2026-08-24 11:22:00', '2026-08-24 11:37:53'),
(2, 'Avocado products', 'best avocado -african', '/uploads/products/6a8c2ae47bbfe.jpg', 1, 10, 30000.00, 'active', '2026-08-24 11:28:36', '2026-09-03 08:21:46');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `site_title` varchar(255) DEFAULT NULL,
  `site_logo` text DEFAULT NULL,
  `primary_email` varchar(255) DEFAULT NULL,
  `secondary_email` varchar(255) DEFAULT NULL,
  `other_email` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `tiktok` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `youtube` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `primary_number` varchar(15) DEFAULT NULL,
  `secondary_number` varchar(255) DEFAULT NULL,
  `other_numbers` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `site_title`, `site_logo`, `primary_email`, `secondary_email`, `other_email`, `facebook`, `instagram`, `tiktok`, `linkedin`, `youtube`, `address`, `primary_number`, `secondary_number`, `other_numbers`, `created_at`, `updated_at`) VALUES
(1, 'kaina fresh ltd', '/uploads/logos/6a870362e35cc.png', 'info@kainafresh.rw', 'export@kainafresh.rw', 'test@kainafresh.rw', NULL, NULL, NULL, NULL, NULL, 'Rwamagana District, Rwanda', '+250788721238', NULL, NULL, '2026-08-20 13:38:42', '2026-08-20 15:05:03');

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `id` int(11) NOT NULL,
  `productid` int(11) NOT NULL,
  `variety` varchar(150) DEFAULT NULL,
  `grade` varchar(100) DEFAULT NULL,
  `quantity` decimal(12,3) NOT NULL DEFAULT 0.000,
  `farm_plot` varchar(150) DEFAULT NULL,
  `harvest_date` date DEFAULT NULL,
  `pack_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stocks`
--

INSERT INTO `stocks` (`id`, `productid`, `variety`, `grade`, `quantity`, `farm_plot`, `harvest_date`, `pack_date`, `created_at`, `updated_at`) VALUES
(1, 2, 'Hass', 'A', 500.500, 'Plot A-01', '2026-08-20', '2026-08-23', '2026-08-26 08:27:45', '2026-08-26 08:27:45');

-- --------------------------------------------------------

--
-- Table structure for table `team`
--

CREATE TABLE `team` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `role` text DEFAULT NULL,
  `initials` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team`
--

INSERT INTO `team` (`id`, `name`, `role`, `initials`, `phone_number`, `email`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Esther Esther', 'Founder & Farm Director', 'EE', '078888888', 'esther@kainafresh.rw', 'active', '2026-08-22 19:05:46', '2026-08-22 19:05:46'),
(2, 'IRADUKUNDA Fulgence', 'IT Support  Director', 'IF', '078888888', 'ira@kainafresh.rw', 'active', '2026-08-23 14:17:54', '2026-08-23 14:17:54');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `code`, `name`, `symbol`, `created_at`, `updated_at`) VALUES
(1, 'kg', 'Kilogram', 'kg', '2026-08-24 10:58:09', '2026-08-24 10:58:09');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `full_name` varchar(50) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'customer',
  `status` varchar(20) DEFAULT 'active',
  `phone_number` varchar(15) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `role`, `status`, `phone_number`, `created_at`, `updated_at`) VALUES
(1, 'shyaka', 'shyaka@gmail.com', '$2y$10$1dk7rN1GmrMDSw2SjzBOU.OMoEJVKKFJhKp/Jfk9cURdZXBX3bXnq', 'shyaka aimabke', 'sales_manager', 'active', '07888', '2026-08-16 15:59:52', '2026-08-16 15:59:52'),
(2, 'Fulgence021', 'iradukunda2@kainafresh.rw', '$2y$12$KlOyfF.1qJ6KvliphOy3UOfONL6L5BoLe7ni9Is2vaSzO7MSJpVUK', 'Fulgence IRADUKUNDA', 'admin', 'active', '078898888', '2026-08-20 13:34:12', '2026-09-02 10:24:54'),
(3, 'Alice', 'alice@kainafresh.rw', '$2y$12$RXSbFX/M1XryXKWa4HWDYenWElG8B/K9nlljGvGluu0rAZrzKqP22', 'Alice MUTUYIMANA', 'sales_manager', 'active', '0788760610', '2026-08-31 21:57:45', '2026-08-31 21:57:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`) USING HASH;

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inquiry`
--
ALTER TABLE `inquiry`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `navlinks`
--
ALTER TABLE `navlinks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `link_name` (`link_name`),
  ADD UNIQUE KEY `link` (`link`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orders_customer_id` (`customer_id`),
  ADD KEY `fk_orders_user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_items_order_id` (`order_id`),
  ADD KEY `fk_order_items_product_id` (`product_id`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `page_sections`
--
ALTER TABLE `page_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_page_sections_page_id` (`page_id`);

--
-- Indexes for table `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_products_unit_id` (`unit_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_stocks_productid` (`productid`);

--
-- Indexes for table `team`
--
ALTER TABLE `team`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inquiry`
--
ALTER TABLE `inquiry`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `navlinks`
--
ALTER TABLE `navlinks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `page_sections`
--
ALTER TABLE `page_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `team`
--
ALTER TABLE `team`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `page_sections`
--
ALTER TABLE `page_sections`
  ADD CONSTRAINT `fk_page_sections_page_id` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_unit_id` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
