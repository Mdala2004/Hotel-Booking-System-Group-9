-- =========================
-- 1. GUEST TABLE
-- =========================
CREATE TABLE guest (
    GUEST_ID VARCHAR2(10) PRIMARY KEY,
    FIRST_NAME VARCHAR2(50),
    LAST_NAME VARCHAR2(50),
    PHONE_NUMBER VARCHAR2(15),
    EMAIL VARCHAR2(100),
    USERNAME VARCHAR2(50),
    PASSWORD VARCHAR2(50)
);

INSERT INTO guest VALUES ('G1','John','Grey','0712345678','john@gmail.com','john_g','p63gk');
INSERT INTO guest VALUES ('G2','Sethu','Smith','0823456789','sethu@yahoo.com','sethu_s','86djk');
INSERT INTO guest VALUES ('G3','Mike','Brown','0734567890','mike@gmail.com','mike_b','pafu36^ss');
INSERT INTO guest VALUES ('G4','Sarah','Lee','0745678901','sarah@gmail.com','sarah_l','pass3428##');
INSERT INTO guest VALUES ('G5','Alakhe','Mbibi','0623456789','alakhe@yahoo.com','alakhe_m','8opjjk');
INSERT INTO guest VALUES ('G6','Theo','Webber','0723896789','theo@yahoo.com','theo_w','8123x@jk');
INSERT INTO guest VALUES ('G7','Kamo','Riri','0712345978','kamo@gmail.com','kamo_r','qqrt563gk');

-- =========================
-- 2. ROOM TYPE TABLE
-- =========================
CREATE TABLE room_type (
    ROOM_TYPE_ID VARCHAR2(10) PRIMARY KEY,
    TYPE_NAME VARCHAR2(50),
    MAX_CAPACITY NUMBER,
    BASE_PRICE NUMBER,
    BED_CONFIGURATION VARCHAR2(50),
    ROOM_DESCRIPTION VARCHAR2(100)
);

INSERT INTO room_type VALUES ('RT1','Single',1,500,'1 Bed','Single room');
INSERT INTO room_type VALUES ('RT2','Double',2,800,'2 Beds','Double room');
INSERT INTO room_type VALUES ('RT3','Family',4,1200,'3 Beds','Family room');
INSERT INTO room_type VALUES ('RT4','Studio',2,900,'1 Bed + Lounge','Open plan studio');
INSERT INTO room_type VALUES ('RT5','Twin',2,700,'2 Single Beds','Twin sharing room');
INSERT INTO room_type VALUES ('RT6','Deluxe',2,1500,'1 King Bed','Luxury deluxe room');
INSERT INTO room_type VALUES ('RT7','Presidential',6,5000,'3 Bedrooms','Top luxury suite');

-- =========================
-- 3. ROOM TABLE
-- =========================
CREATE TABLE room (
    ROOM_ID VARCHAR2(10) PRIMARY KEY,
    ROOM_TYPE_ID VARCHAR2(10),
    ROOM_NUMBER VARCHAR2(10),
    PRICE_PER_NIGHT NUMBER,
    MAX_OCCUPANCY NUMBER,
    STATUS VARCHAR2(20),
    RATING NUMBER,
    LOCATION VARCHAR2(50),
    CONSTRAINT fk_room_type FOREIGN KEY (ROOM_TYPE_ID)
    REFERENCES room_type(ROOM_TYPE_ID)
);

INSERT INTO room VALUES ('R1','RT1','101',500,1,'Available',4.5,'Floor 1');
INSERT INTO room VALUES ('R2','RT2','102',800,2,'Available',4.0,'Floor 1');
INSERT INTO room VALUES ('R3','RT3','103',1200,4,'Occupied',4.8,'Floor 2');
INSERT INTO room VALUES ('R4','RT4','104',900,2,'Available',4.3,'Floor 2');
INSERT INTO room VALUES ('R5','RT5','105',700,2,'Available',4.1,'Floor 2');
INSERT INTO room VALUES ('R6','RT6','106',1500,2,'Occupied',4.7,'Floor 3');
INSERT INTO room VALUES ('R7','RT7','107',5000,6,'Available',5.0,'Floor 3');

-- =========================
-- 4. STAFF TABLE
-- =========================
CREATE TABLE staff (
    STAFF_ID VARCHAR2(10) PRIMARY KEY,
    FIRST_NAME VARCHAR2(50),
    LAST_NAME VARCHAR2(50),
    ROLE VARCHAR2(50),
    DEPARTMENT VARCHAR2(50),
    STAFF_EMAIL VARCHAR2(100),
    STAFF_PHONE_NUMBER VARCHAR2(15)
);

INSERT INTO staff VALUES ('S1','Alice','Mokoena','Manager','Admin','alice@hotel.com','0711167811');
INSERT INTO staff VALUES ('S2','Bob','Nkosi','Receptionist','Front Desk','bob@hotel.com','0712694222');
INSERT INTO staff VALUES ('S3','Carol','Naidoo','Cleaner','Housekeeping','carol@hotel.com','0733333333');
INSERT INTO staff VALUES ('S4','Mandisi','Mbixi','Cleaner','Housekeeping','mandisi@hotel.com','0733907433');
INSERT INTO staff VALUES ('S5','Aisha','Khan','Cleaner','Housekeeping','aisha@hotel.com','0777777777');
INSERT INTO staff VALUES ('S6','David','Smith','Security','Security','david@hotel.com','0744444444');
INSERT INTO staff VALUES ('S7','Sipho','Dlamini','Security','Security','sipho@hotel.com','0744904444');

-- =========================
-- 5. RESERVATIONS TABLE
-- =========================
CREATE TABLE reservations (
    RESERVATION_ID VARCHAR2(10) PRIMARY KEY,
    GUEST_ID VARCHAR2(10),
    ROOM_ID VARCHAR2(10),
    STAFF_ID VARCHAR2(10),
    CHECK_IN_DATE DATE,
    CHECK_OUT_DATE DATE,
    NUMBER_OF_GUESTS NUMBER,
    TOTAL_COST NUMBER,
    PAYMENT_STATUS VARCHAR2(20),

    CONSTRAINT fk_guest FOREIGN KEY (GUEST_ID) REFERENCES guest(GUEST_ID),
    CONSTRAINT fk_room FOREIGN KEY (ROOM_ID) REFERENCES room(ROOM_ID),
    CONSTRAINT fk_staff FOREIGN KEY (STAFF_ID) REFERENCES staff(STAFF_ID)
);

INSERT INTO reservations VALUES ('RES1','G1','R1','S2',TO_DATE('2026-05-01','YYYY-MM-DD'),TO_DATE('2026-05-03','YYYY-MM-DD'),1,1000,'Confirmed');
INSERT INTO reservations VALUES ('RES2','G2','R2','S2',TO_DATE('2026-05-02','YYYY-MM-DD'),TO_DATE('2026-05-05','YYYY-MM-DD'),2,2400,'Pending');
INSERT INTO reservations VALUES ('RES3','G3','R3','S1',TO_DATE('2026-05-03','YYYY-MM-DD'),TO_DATE('2026-05-06','YYYY-MM-DD'),4,3600,'Confirmed');
INSERT INTO reservations VALUES ('RES4','G4','R4','S2',TO_DATE('2026-05-04','YYYY-MM-DD'),TO_DATE('2026-05-06','YYYY-MM-DD'),2,1800,'Confirmed');
INSERT INTO reservations VALUES ('RES5','G5','R5','S2',TO_DATE('2026-05-05','YYYY-MM-DD'),TO_DATE('2026-05-07','YYYY-MM-DD'),2,1400,'Pending');
INSERT INTO reservations VALUES ('RES6','G6','R6','S1',TO_DATE('2026-05-06','YYYY-MM-DD'),TO_DATE('2026-05-20','YYYY-MM-DD'),2,4500,'Confirmed');
INSERT INTO reservations VALUES ('RES7','G7','R7','S2',TO_DATE('2026-05-12','YYYY-MM-DD'),TO_DATE('2026-05-27','YYYY-MM-DD'),4,15000,'Pending');

-- =========================
-- 6. PAYMENTS TABLE
-- =========================
CREATE TABLE payments (
    PAYMENT_ID VARCHAR2(10) PRIMARY KEY,
    RESERVATION_ID VARCHAR2(10),
    AMOUNT NUMBER,
    PAYMENT_METHOD VARCHAR2(20),
    PAYMENT_DATE DATE,
    PAYMENT_STATUS VARCHAR2(20),

    CONSTRAINT fk_payment_res FOREIGN KEY (RESERVATION_ID)
    REFERENCES reservations(RESERVATION_ID)
);

INSERT INTO payments VALUES ('P1','RES1',1000,'Cash',TO_DATE('2026-05-01','YYYY-MM-DD'),'Paid');
INSERT INTO payments VALUES ('P2','RES2',2400,'EFT',TO_DATE('2026-05-02','YYYY-MM-DD'),'Pending');
INSERT INTO payments VALUES ('P3','RES3',3600,'Card',TO_DATE('2026-05-03','YYYY-MM-DD'),'Paid');
INSERT INTO payments VALUES ('P4','RES4',1800,'Card',TO_DATE('2026-05-04','YYYY-MM-DD'),'Paid');
INSERT INTO payments VALUES ('P5','RES5',1400,'Cash',TO_DATE('2026-05-05','YYYY-MM-DD'),'Pending');
INSERT INTO payments VALUES ('P6','RES6',4500,'EFT',TO_DATE('2026-05-06','YYYY-MM-DD'),'Paid');
INSERT INTO payments VALUES ('P7','RES7',15000,'Card',TO_DATE('2026-05-12','YYYY-MM-DD'),'Pending');

SELECT * FROM guest;
SELECT * FROM room_type;
SELECT * FROM room;
SELECT * FROM staff;
SELECT * FROM reservations;
SELECT * FROM payments;