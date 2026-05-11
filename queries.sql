-- FILE: queries.sql
-- PURPOSE: SQL queries based on rubric requirements



-- =========================================
-- BASIC QUERIES
-- =========================================

-- 1. Show all guests
SELECT * FROM guest;

-- 2. Show specific columns 
SELECT FIRST_NAME, LAST_NAME, EMAIL
FROM guest;

-- 3. Limit number of rows
SELECT * FROM guest
WHERE ROWNUM <= 3;

-- 4. Using LIKE operator
SELECT * FROM guest
WHERE EMAIL LIKE '%gmail%';


-- =========================================
-- AND / OR CONDITIONS
-- =========================================

-- 5. AND condition
SELECT * FROM room
WHERE STATUS = 'Available' AND PRICE_PER_NIGHT < 1000;

-- 6. OR condition
SELECT * FROM guest
WHERE EMAIL LIKE '%gmail%' OR EMAIL LIKE '%yahoo%';


-- =========================================
-- SORTING
-- =========================================

-- 7. Order by price (descending)
SELECT * FROM room
ORDER BY PRICE_PER_NIGHT DESC;


-- =========================================
-- CHARACTER FUNCTIONS
-- =========================================

-- 8. Upper and Lower case
SELECT UPPER(FIRST_NAME) AS UPPER_NAME,
       LOWER(LAST_NAME) AS LOWER_NAME
FROM guest;

-- 9. Substring
SELECT SUBSTR(FIRST_NAME,1,3) AS SHORT_NAME
FROM guest;


-- =========================================
-- AGGREGATE FUNCTIONS
-- =========================================

-- 10. Count total guests
SELECT COUNT(*) AS TOTAL_GUESTS
FROM guest;

-- 11. Total revenue
SELECT SUM(TOTAL_COST) AS TOTAL_REVENUE
FROM reservations;

-- 12. Average room price (rounded)
SELECT ROUND(AVG(PRICE_PER_NIGHT),2) AS AVG_PRICE
FROM room;


-- =========================================
-- GROUP BY & HAVING
-- =========================================

-- 13. Reservations per staff
SELECT STAFF_ID, COUNT(*) AS TOTAL_RESERVATIONS
FROM reservations
GROUP BY STAFF_ID;

-- 14. HAVING clause
SELECT STAFF_ID, COUNT(*) AS TOTAL
FROM reservations
GROUP BY STAFF_ID
HAVING COUNT(*) > 1;


-- =========================================
-- DATE FUNCTIONS
-- =========================================

-- 15. Calculate stay duration
SELECT RESERVATION_ID,
       CHECK_OUT_DATE - CHECK_IN_DATE AS STAY_DAYS
FROM reservations;


-- =========================================
-- JOINS
-- =========================================

-- 16. Guest + Reservation
SELECT g.FIRST_NAME, g.LAST_NAME, r.RESERVATION_ID
FROM guest g
JOIN reservations r ON g.GUEST_ID = r.GUEST_ID;

-- 17. Room + Room Type
SELECT r.ROOM_NUMBER, rt.TYPE_NAME
FROM room r
JOIN room_type rt ON r.ROOM_TYPE_ID = rt.ROOM_TYPE_ID;

-- 18. Reservation + Staff
SELECT r.RESERVATION_ID, s.FIRST_NAME, s.ROLE
FROM reservations r
JOIN staff s ON r.STAFF_ID = s.STAFF_ID;

-- 19. FULL JOIN 
SELECT 
    g.FIRST_NAME,
    g.LAST_NAME,
    r.RESERVATION_ID,
    rm.ROOM_NUMBER,
    rt.TYPE_NAME,
    s.FIRST_NAME AS STAFF_NAME
FROM reservations r
JOIN guest g ON r.GUEST_ID = g.GUEST_ID
JOIN room rm ON r.ROOM_ID = rm.ROOM_ID
JOIN room_type rt ON rm.ROOM_TYPE_ID = rt.ROOM_TYPE_ID
JOIN staff s ON r.STAFF_ID = s.STAFF_ID;

-- 20. Payments + Reservations
SELECT r.RESERVATION_ID, p.AMOUNT, p.PAYMENT_STATUS
FROM reservations r
JOIN payments p ON r.RESERVATION_ID = p.RESERVATION_ID;


-- =========================================
-- SUBQUERY 
-- =========================================

-- 21. Rooms above average price
SELECT * FROM room
WHERE PRICE_PER_NIGHT > (
    SELECT AVG(PRICE_PER_NIGHT)
    FROM room
);


-- =========================================
-- BUSINESS - RELATED QUERY
-- =========================================

-- 22. Show only paid reservations
SELECT r.RESERVATION_ID, g.FIRST_NAME, p.AMOUNT
FROM reservations r
JOIN guest g ON r.GUEST_ID = g.GUEST_ID
JOIN payments p ON r.RESERVATION_ID = p.RESERVATION_ID
WHERE p.PAYMENT_STATUS = 'Paid';

-- =========================================
-- ADDITIONAL RUBRIC FIXES
-- =========================================

-- FETCH FIRST ROWS
SELECT *
FROM guest
FETCH FIRST 3 ROWS ONLY;

-- TRUNCATION
SELECT TRUNC(AVG(PRICE_PER_NIGHT), 0)
FROM room;

SELECT RESERVATION_ID,
       ROUND(CHECK_OUT_DATE - CHECK_IN_DATE) AS STAY_DAYS
FROM reservations;
