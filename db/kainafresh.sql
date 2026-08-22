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
(2, 'Our Farm', '/about', 'nav', '2026-08-20 13:40:06', '2026-08-20 13:45:04'),
(3, 'Wholesale & Exports', '/wholesale', 'nav', '2026-08-20 13:42:26', '2026-08-20 13:42:26'),
(4, 'Contact', '/contact', 'nav', '2026-08-20 13:43:35', '2026-08-20 13:43:35');

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
(1, 'Home', 'home', 'published', 'KainaFresh - Home', 'Welcome to KainaFresh', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'About Us', 'about', 'published', 'About KainaFresh', 'Learn more about KainaFresh.', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Contact Us', 'contact', 'published', 'Contact KainaFresh', 'Get in touch with KainaFresh.', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Wholesale & Exports', 'wholesale', 'published', 'Wholesale KainaFresh', 'Partner with KainaFresh.', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
(1, 1, 'hero', 'Home Hero', '{"badge":"Farm-fresh, direct to you","heading":"Farm Fresh Produce,","headingAccent":"Delivered Direct","headingAccentSecondary":"to You.","subheading":"We grow it. We pack it. We deliver it — fresh, certified, and straight from our fields to your table.","primaryCta":{"label":"Our Products","to":"/products"},"secondaryCta":{"label":"Wholesale & Exports","to":"/wholesale"}}', '{}', 0, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'value_props', 'Value Propositions', '{"tag":"Why KainaFresh","heading":"Fresh Food, Done Right","items":[{"iconName":"Leaf","title":"Organically Grown","description":"No synthetic chemicals. Every crop is grown using eco-friendly practices that are good for the soil and good for you."},{"iconName":"Truck","title":"Fast Delivery","description":"Order today, receive tomorrow. Our cold-chain logistics ensure your produce arrives as fresh as the day it was picked."},{"iconName":"ShieldCheck","title":"Quality Guaranteed","description":"Every product is hand-inspected and graded before packing. If it\'s not perfect, it doesn\'t leave our farm."},{"iconName":"Package","title":"Bulk & Wholesale","description":"Need large volumes? We supply restaurants, supermarkets, and exporters with consistent, certified bulk produce."}]}', '{}', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 'faqs', 'FAQs', '{"tag":"Got Questions?","heading":"Frequently Asked Questions","subheading":"Everything you need to know about ordering from KainaFresh.","items":[{"question":"How do I place an order?","answer":"Browse our products, add your items to the cart, and checkout. You can pay on delivery or via mobile money. Orders placed before 2 PM are delivered the next day."},{"question":"Do you deliver to my area?","answer":"We currently deliver across Kigali and surrounding districts. Enter your location at checkout to confirm delivery availability and estimated time."},{"question":"How do I know the produce is truly organic?","answer":"KainaFresh is certified organic. Our farm undergoes regular inspections, and all products carry a certification label. You can visit our farm — we welcome it!"},{"question":"Can I order in bulk for my business?","answer":"Absolutely. We have a dedicated wholesale programme for restaurants, supermarkets, and exporters. Visit our Wholesale & Exports page or contact us directly."},{"question":"What if I receive produce that is not fresh?","answer":"We stand behind every delivery. If anything isn\'t up to standard, contact us within 24 hours and we will replace it or issue a full refund — no questions asked."}]}', '{}', 2, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 'hero', 'About Hero', '{"location":"Kigali, Rwanda","heading":"Growing Fresh.","headingHighlight":"Building Community.","description":"KainaFresh is a Rwanda-based farm that focuses on organic farming and empowering local communities.","cta":{"label":"Get in Touch","to":"/contact"}}', '{}', 0, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 2, 'stats_bar', 'Stats Bar', '{"items":[{"value":"350+","label":"Happy Customers"},{"value":"100%","label":"Organic Certified"},{"value":"24h","label":"Fast Delivery"}]}', '{}', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 2, 'story', 'Our Story', '{"tag":"Our Story","heading":"From a small plot of land to a thriving farm.","paragraphs":["KainaFresh started with a simple idea: everyone deserves access to healthy, affordable produce.","Today, we manage acres of rich soil and deliver daily across the country."]}', '{}', 2, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 2, 'values', 'Mission & Values', '{"tag":"What We Stand For","heading":"Our Mission & Values","subheading":"We believe in sustainable practices that nourish both people and the planet.","items":[{"iconName":"ShieldCheck","title":"Quality & Safety","description":"Our top priority is ensuring every piece of produce is safe and nutritious."}]}', '{}', 3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 2, 'team', 'Team', '{"tag":"The People Behind the Farm","heading":"Meet Our Team","members":[{"name":"Jean-Pierre Uwimana","role":"Founder & Farm Director","initials":"JU"}]}', '{}', 4, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 2, 'cta', 'Bottom CTA', '{"heading":"Ready to taste the difference?","subheading":"Order fresh produce from KainaFresh today and experience real quality.","primaryCta":{"label":"Shop Now","to":"/products"},"secondaryCta":{"label":"Contact Us","to":"/contact"}}', '{}', 5, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 3, 'hero', 'Contact Hero', '{"heading":"Get in Touch","subheading":"We\'d love to hear from you. Reach out with questions, wholesale inquiries, or feedback.","badge":"Contact KainaFresh"}', '{}', 0, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 4, 'hero', 'Wholesale Hero', '{"badge":"B2B & Exports","heading":"Partner with","headingAccent":"KainaFresh","description":"We supply premium, organic produce in bulk to businesses worldwide.","primaryCta":{"label":"Request a Quote","to":"#inquiry-form"},"secondaryCta":{"label":"How It Works","to":"#how-it-works"}}', '{}', 0, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
