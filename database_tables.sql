
-- FILE:database_tables.sql
-- PURPOSE: Define database schema


-- Create database
CREATE DATABASE IF NOT EXISTS database_hotel_system;
USE database_hotel_system;

-- TABLE: Room Type

DROP TABLE IF EXISTS `room_type`;

CREATE TABLE `room_type` (
  `ROOM_TYPE_ID` char(36) NOT NULL DEFAULT (uuid()),
  `TYPE_NAME` varchar(50) NOT NULL,
  `MAX_CAPACITY` int NOT NULL,
  `BASE_PRICE` decimal(10,2) NOT NULL,
  `BED_CONFIGURATION` varchar(100) NOT NULL,
  `ROOM_DESCRIPTION` text NOT NULL,
  PRIMARY KEY (`ROOM_TYPE_ID`),
  CONSTRAINT `chk_base_price` CHECK ((`BASE_PRICE` > 0)),
  CONSTRAINT `chk_max_capacity` CHECK ((`MAX_CAPACITY` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABLE: Guest

DROP TABLE IF EXISTS `guest`;

CREATE TABLE `guest` (
  `GUEST_ID` char(36) NOT NULL DEFAULT (uuid()),
  `FIRST_NAME` varchar(100) NOT NULL,
  `LAST_NAME` varchar(100) NOT NULL,
  `PHONE_NUMBER` varchar(20) NOT NULL,
  `EMAIL` varchar(150) NOT NULL,
  `USERNAME` varchar(80) NOT NULL,
  `PASSWORD` varchar(255) NOT NULL,
  PRIMARY KEY (`GUEST_ID`),
  UNIQUE KEY `EMAIL_UNIQUE` (`EMAIL`),
  UNIQUE KEY `USERNAME_UNIQUE` (`USERNAME`),
  KEY `idx_guest_EMAIL` (`EMAIL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--TABLE: staff

DROP TABLE IF EXISTS `staff`;

CREATE TABLE `staff` (
  `STAFF_ID` char(36) NOT NULL DEFAULT (uuid()),
  `FIRST_NAME` varchar(100) NOT NULL,
  `LAST_NAME` varchar(100) NOT NULL,
  `ROLE` enum('Manager','Receptionist','Housekeeping','Admin','Finance') NOT NULL,
  `DEPARTMENT` varchar(100) DEFAULT NULL,
  `STAFF_EMAIL` varchar(150) NOT NULL,
  `STAFF_PHONE_NUMBER` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`STAFF_ID`),
  UNIQUE KEY `STAFF_EMAIL_UNIQUE` (`STAFF_EMAIL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABLE: Room

DROP TABLE IF EXISTS `room`;

CREATE TABLE `room` (
  `ROOM_ID` char(36) NOT NULL DEFAULT (uuid()),
  `ROOM_TYPE_ID` char(36) NOT NULL,
  `ROOM_NUMBER` varchar(10) NOT NULL,
  `PRICE_PER_NIGHT` decimal(10,2) NOT NULL,
  `MAX_OCCUPANCY` int NOT NULL,
  `STATUS` enum('Available','Occupied','Under Maintenance') NOT NULL DEFAULT 'Available',
  `RATING` decimal(2,1) NOT NULL,
  `LOCATION` varchar(100) NOT NULL,
  PRIMARY KEY (`ROOM_ID`),
  UNIQUE KEY `ROOM_NUMBER_UNIQUE` (`ROOM_NUMBER`),
  CONSTRAINT `chk_rating` CHECK ((`RATING` between 0.1 and 5.0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABLE: Reservation

DROP TABLE IF EXISTS `reservations`;

CREATE TABLE `reservations` (
  `Reservation_ID` char(36) NOT NULL DEFAULT (uuid()),
  `Guest_ID` char(36) NOT NULL,
  `Room_ID` char(36) NOT NULL,
  `Staff_ID` char(36) DEFAULT NULL,
  `Check_In_Date` date NOT NULL,
  `Check_Out_Date` date NOT NULL,
  `Number_Of_Guests` int NOT NULL,
  `Total_Cost` decimal(10,2) NOT NULL,
  `Payment_Status` enum('Pending','Confirmed','Cancelled') DEFAULT 'Pending',
  PRIMARY KEY (`Reservation_ID`),
  KEY `idx_reservations_Check_In_Date` (`Check_In_Date`),
  KEY `idx_reservations_Check_Out_Date` (`Check_Out_Date`),
  CONSTRAINT `chk_dates` CHECK ((`Check_Out_Date` > `Check_In_Date`)),
  CONSTRAINT `reservations_chk_1` CHECK ((`Number_Of_Guests` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--TABLE: payments

DROP TABLE IF EXISTS `payments`;

CREATE TABLE `payments` (
  `PAYMENT_ID` char(36) NOT NULL DEFAULT (uuid()),
  `RESERVATION_ID` char(36) NOT NULL,
  `AMOUNT` decimal(10,2) NOT NULL,
  `PAYMENT_METHOD` enum('Cash','Credit Card','Debit Card','EFT') NOT NULL,
  `PAYMENT_DATE` date NOT NULL,
  `PAYMENT_STATUS` enum('Pending','Paid','Refunded') DEFAULT 'Pending',
  PRIMARY KEY (`PAYMENT_ID`),
  UNIQUE KEY `RESERVATION_ID` (`RESERVATION_ID`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`RESERVATION_ID`) REFERENCES `reservations` (`Reservation_ID`),
  CONSTRAINT `payments_chk_1` CHECK ((`Amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE room
ADD CONSTRAINT fk_room_type
FOREIGN KEY (ROOM_TYPE_ID) REFERENCES room_type(ROOM_TYPE_ID);

ALTER TABLE reservations
ADD CONSTRAINT fk_res_guest
FOREIGN KEY (GUEST_ID) REFERENCES guest(GUEST_ID);

ALTER TABLE reservations
ADD CONSTRAINT fk_res_room
FOREIGN KEY (ROOM_ID) REFERENCES room(ROOM_ID);

ALTER TABLE reservations
ADD CONSTRAINT fk_res_staff
FOREIGN KEY (STAFF_ID) REFERENCES staff(STAFF_ID);

ALTER TABLE payments
ADD CONSTRAINT fk_payment_reservation
FOREIGN KEY (RESERVATION_ID) REFERENCES reservations(RESERVATION_ID);