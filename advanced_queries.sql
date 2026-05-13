-- FILE: advanced_queries.sql
-- PURPOSE: SQL queries fulfilling rubric requirements


-- =========================================================
-- LIKE OPERATOR
-- =========================================================
SELECT *
FROM guest
WHERE FIRST_NAME LIKE 'S%';


-- =========================================================
-- AND OPERATOR
-- =========================================================
SELECT *
FROM room
WHERE STATUS = 'Available'
AND PRICE_PER_NIGHT > 700;


-- =========================================================
-- OR OPERATOR
-- =========================================================
SELECT *
FROM payments
WHERE PAYMENT_STATUS = 'Pending'
OR PAYMENT_METHOD = 'Cash';


-- =========================================================
-- CHARACTER FUNCTIONS (UPPER / LOWER)
-- =========================================================
SELECT
    UPPER(FIRST_NAME) AS FIRST_NAME_UPPER,
    LOWER(LAST_NAME) AS LAST_NAME_LOWER
FROM guest;


-- =========================================================
-- DATE FUNCTION (STAY CALCULATION)
-- =========================================================
SELECT
    RESERVATION_ID,
    CHECK_OUT_DATE - CHECK_IN_DATE AS STAY_DAYS
FROM reservations;


-- =========================================================
-- AGGREGATE FUNCTION
-- =========================================================
SELECT
    SUM(TOTAL_COST) AS TOTAL_REVENUE
FROM reservations;


-- =========================================================
-- GROUP BY
-- =========================================================
SELECT
    PAYMENT_STATUS,
    COUNT(*) AS TOTAL_PAYMENTS
FROM payments
GROUP BY PAYMENT_STATUS;


-- =========================================================
-- HAVING CLAUSE
-- =========================================================
SELECT
    PAYMENT_STATUS,
    COUNT(*) AS TOTAL_PAYMENTS
FROM payments
GROUP BY PAYMENT_STATUS
HAVING COUNT(*) >= 1;


-- =========================================================
-- BONUS: AVERAGE ROOM PRICE (ADDED FOR HIGHER MARKS)
-- =========================================================
SELECT
    AVG(PRICE_PER_NIGHT) AS AVG_ROOM_PRICE
FROM room;