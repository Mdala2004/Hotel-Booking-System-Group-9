-- FILE: views.sql
-- PURPOSE: Define business- oriented views to simplify reporting on bookings, payments, and available rooms for the hotel management system.



-- =========================================
-- HOTEL MANAGEMENT SYSTEM VIEWS
-- =========================================

-- 1. Booking Summary View
CREATE VIEW booking_summary AS
SELECT 
    g.FIRST_NAME,
    g.LAST_NAME,
    r.ROOM_NUMBER,
    rt.TYPE_NAME,
    res.CHECK_IN_DATE,
    res.CHECK_OUT_DATE,
    res.TOTAL_COST
FROM guest g
JOIN reservations res ON g.GUEST_ID = res.GUEST_ID
JOIN room r ON res.ROOM_ID = r.ROOM_ID
JOIN room_type rt ON r.ROOM_TYPE_ID = rt.ROOM_TYPE_ID;

-- 2. Payment Overview View
CREATE VIEW payment_overview AS
SELECT 
    p.PAYMENT_ID,
    p.AMOUNT,
    p.PAYMENT_STATUS,
    r.RESERVATION_ID,
    g.FIRST_NAME
FROM payments p
JOIN reservations r ON p.RESERVATION_ID = r.RESERVATION_ID
JOIN guest g ON r.GUEST_ID = g.GUEST_ID;

-- 3. Available Rooms View
CREATE VIEW available_rooms AS
SELECT 
    ROOM_NUMBER,
    PRICE_PER_NIGHT,
    STATUS
FROM room
WHERE STATUS = 'Available';
