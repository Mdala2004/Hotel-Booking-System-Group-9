-- FILE: database_views.sql
-- PURPOSE: Business-oriented Oracle views for Hotel Booking System


-- =========================================================
-- VIEW 1: BOOKING SUMMARY (JOIN + BUSINESS REPORT)
-- =========================================================
CREATE OR REPLACE VIEW booking_summary AS
SELECT
    g.GUEST_ID,
    g.FIRST_NAME,
    g.LAST_NAME,
    r.ROOM_NUMBER,
    rt.TYPE_NAME AS ROOM_TYPE,
    res.CHECK_IN_DATE,
    res.CHECK_OUT_DATE,
    res.NUMBER_OF_GUESTS,
    res.TOTAL_COST,
    res.PAYMENT_STATUS
FROM guest g
JOIN reservations res
    ON g.GUEST_ID = res.GUEST_ID
JOIN room r
    ON res.ROOM_ID = r.ROOM_ID
JOIN room_type rt
    ON r.ROOM_TYPE_ID = rt.ROOM_TYPE_ID;


-- =========================================================
-- VIEW 2: PAYMENT OVERVIEW (FINANCIAL REPORTING)
-- =========================================================
CREATE OR REPLACE VIEW payment_overview AS
SELECT
    p.PAYMENT_ID,
    p.AMOUNT,
    p.PAYMENT_METHOD,
    p.PAYMENT_DATE,
    p.PAYMENT_STATUS,
    r.RESERVATION_ID,
    g.FIRST_NAME,
    g.LAST_NAME
FROM payments p
JOIN reservations r
    ON p.RESERVATION_ID = r.RESERVATION_ID
JOIN guest g
    ON r.GUEST_ID = g.GUEST_ID;


-- =========================================================
-- VIEW 3: AVAILABLE ROOMS (OPERATIONAL VIEW)
-- =========================================================
CREATE OR REPLACE VIEW available_rooms AS
SELECT
    r.ROOM_ID,
    r.ROOM_NUMBER,
    r.PRICE_PER_NIGHT,
    r.MAX_OCCUPANCY,
    r.STATUS,
    rt.TYPE_NAME
FROM room r
JOIN room_type rt
    ON r.ROOM_TYPE_ID = rt.ROOM_TYPE_ID
WHERE r.STATUS = 'Available';


-- =========================================================
-- VIEW 4: HIGH VALUE BOOKINGS (ADDED FOR BONUS MARKS)
-- =========================================================
CREATE OR REPLACE VIEW high_value_bookings AS
SELECT
    g.FIRST_NAME,
    g.LAST_NAME,
    res.RESERVATION_ID,
    res.TOTAL_COST
FROM guest g
JOIN reservations res
    ON g.GUEST_ID = res.GUEST_ID
WHERE res.TOTAL_COST > 3000;