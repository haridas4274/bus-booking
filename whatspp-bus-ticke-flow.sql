-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 23, 2024 at 02:36 PM
-- Server version: 8.2.0
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `whatspp-bus-ticke-flow`
--

-- --------------------------------------------------------

--
-- Table structure for table `boarding_points`
--

DROP TABLE IF EXISTS `boarding_points`;
CREATE TABLE IF NOT EXISTS `boarding_points` (
  `id` int NOT NULL AUTO_INCREMENT,
  `location_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `boarding_points`
--

INSERT INTO `boarding_points` (`id`, `location_name`) VALUES
(1, 'Point A'),
(2, 'Point B'),
(3, 'Point C');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bus_id` int DEFAULT NULL,
  `seat_number` varchar(10) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_contact` varchar(15) DEFAULT NULL,
  `booking_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bus_id` (`bus_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `bus_id`, `seat_number`, `user_name`, `user_contact`, `booking_date`) VALUES
(1, 1, 'seat_1_2', 'haridas', '8508746641', '2024-10-22 12:04:34'),
(2, 1, 'seat_1_2', 'haridas', '8508746641', '2024-10-22 12:05:54'),
(3, 1, 'seat_1_2', 'haridas', '8508746641', '2024-10-23 09:23:01');

-- --------------------------------------------------------

--
-- Table structure for table `buses`
--

DROP TABLE IF EXISTS `buses`;
CREATE TABLE IF NOT EXISTS `buses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bus_name` varchar(255) DEFAULT NULL,
  `departure_time` time DEFAULT NULL,
  `boarding_point_id` int DEFAULT NULL,
  `dropping_point_id` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `available_seats` int DEFAULT NULL,
  `seat_layout` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `buses`
--

INSERT INTO `buses` (`id`, `bus_name`, `departure_time`, `boarding_point_id`, `dropping_point_id`, `price`, `available_seats`, `seat_layout`) VALUES
(1, 'Bus A', '08:00:00', 1, 3, 20.00, 37, '{\"rows\": 10, \"seats_per_row\": 4}'),
(2, 'Bus B', '10:00:00', 2, 3, 25.00, 35, '{\"rows\": 8, \"seats_per_row\": 5}'),
(3, 'Bus B', '08:00:00', 1, 3, 20.00, 40, '{\"rows\": 10, \"seats_per_row\": 3}');

-- --------------------------------------------------------

--
-- Table structure for table `dropping_points`
--

DROP TABLE IF EXISTS `dropping_points`;
CREATE TABLE IF NOT EXISTS `dropping_points` (
  `id` int NOT NULL AUTO_INCREMENT,
  `location_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `dropping_points`
--

INSERT INTO `dropping_points` (`id`, `location_name`) VALUES
(1, 'Point X'),
(2, 'Point Y'),
(3, 'Point Z');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
