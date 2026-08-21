-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 21, 2026 at 04:40 PM
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
(5, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6IkZ1bGdlbmNlMDIxIiwiZW1haWwiOiJpcmFkdWt1bmRhMkBrYWluYWZyZXNoLnJ3IiwiZXhwIjoxNzg3MzE3NjAyLCJpYXQiOjE3ODczMTQwMDIsImlzcyI6ImxvY2FsaG9zdCJ9._tbornKI1xaxbmYUDp6bibJWttXbeiPJDD0c3wd008o', '::1', 'PostmanRuntime/7.49.1', '2026-08-21 13:06:42', '2026-08-21 12:06:42', '2026-08-21 12:06:42');

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
(6, '20260816153813_create_navlinks_table.php', 4, '2026-08-20 13:38:35');

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
(2, 'Our Farm', 'about', 'nav', '2026-08-20 13:40:06', '2026-08-20 13:45:04'),
(3, 'Wholesale & Exports', 'wholesale', 'nav', '2026-08-20 13:42:26', '2026-08-20 13:42:26'),
(4, 'Contact', 'contact', 'nav', '2026-08-20 13:43:35', '2026-08-20 13:43:35');

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
(2, 'About Us', 'about-us-2', 'draft', 'About Kaina Fresh', 'Learn more about Kaina Fresh.', NULL, '2026-08-17 09:27:28', '2026-08-17 09:27:28');

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
(5, 1, 'hero', 'Hero', '{\"badge\":\"100% Organic \\u00b7 Farm to Table \",\"heading\":\"Elevate Your Health with Our Proven\",\"headingAccent\":\"Organic\",\"headingAccentSecondary\":\"Farming!\",\"subheading\":\"Our expert team crafts tailored strategies, executes effective farming, and drives sustainable growth for your family\'s nutrition.\",\"primaryCta\":{\"label\":\"Shop Now\",\"to\":\"\\/products\"},\"secondaryCta\":{\"label\":\"Wholesale & Exports\",\"to\":\"\\/wholesale\"}}', '[]', 0, 'active', '2026-08-20 12:12:16', '2026-08-20 13:12:36');

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
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `full_name` varchar(50) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'sales_manager',
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
(2, 'Fulgence021', 'iradukunda2@kainafresh.rw', '$2y$12$aKz9NBS6YB2vjAJnIpMgg.iAHns96Y22tvwnJ4FUBewHnuCFAVMne', 'Fulgence IRADUKUNDA', 'admin', 'active', '078898888', '2026-08-20 13:34:12', '2026-08-20 13:35:04');

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
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `navlinks`
--
ALTER TABLE `navlinks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `page_sections`
--
ALTER TABLE `page_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `page_sections`
--
ALTER TABLE `page_sections`
  ADD CONSTRAINT `fk_page_sections_page_id` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
