// routes/reservations.js — Full reservation lifecycle

const express = require('express');
const router = express.Router();
const db = require('../middleware/db');

// GET /api/reservations — all reservations with guest + room details
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT r.RESERVATION_ID,
              g.GUEST_ID, g.FIRST_NAME || ' ' || g.LAST_NAME AS GUEST_NAME,
              rm.ROOM_NUMBER, rt.TYPE_NAME,
              r.CHECK_IN_DATE, r.CHECK_OUT_DATE,
              r.NUMBER_OF_GUESTS, r.TOTAL_COST, r.PAYMENT_STATUS,
              s.FIRST_NAME || ' ' || s.LAST_NAME AS STAFF_NAME
       FROM reservations r
       JOIN guest g ON r.GUEST_ID = g.GUEST_ID
       JOIN room rm ON r.ROOM_ID = rm.ROOM_ID
       JOIN room_type rt ON rm.ROOM_TYPE_ID = rt.ROOM_TYPE_ID
       JOIN staff s ON r.STAFF_ID = s.STAFF_ID
       ORDER BY r.CHECK_IN_DATE DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reservations/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT r.RESERVATION_ID,
              g.GUEST_ID, g.FIRST_NAME, g.LAST_NAME, g.EMAIL, g.PHONE_NUMBER,
              rm.ROOM_ID, rm.ROOM_NUMBER, rt.TYPE_NAME, rt.BED_CONFIGURATION,
              r.CHECK_IN_DATE, r.CHECK_OUT_DATE,
              r.NUMBER_OF_GUESTS, r.TOTAL_COST, r.PAYMENT_STATUS,
              s.STAFF_ID, s.FIRST_NAME AS STAFF_FIRST, s.LAST_NAME AS STAFF_LAST
       FROM reservations r
       JOIN guest g ON r.GUEST_ID = g.GUEST_ID
       JOIN room rm ON r.ROOM_ID = rm.ROOM_ID
       JOIN room_type rt ON rm.ROOM_TYPE_ID = rt.ROOM_TYPE_ID
       JOIN staff s ON r.STAFF_ID = s.STAFF_ID
       WHERE r.RESERVATION_ID = :id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reservations — create new reservation
router.post('/', async (req, res) => {
  const { guestId, roomId, staffId, checkIn, checkOut, numGuests } = req.body;
  if (!guestId || !roomId || !checkIn || !checkOut || !numGuests)
    return res.status(400).json({ error: 'guestId, roomId, checkIn, checkOut, numGuests are required' });

  try {
    // Check room availability for the date range
    const conflict = await db.execute(
      `SELECT RESERVATION_ID FROM reservations
       WHERE ROOM_ID = :roomId
         AND CHECK_IN_DATE < TO_DATE(:checkOut, 'YYYY-MM-DD')
         AND CHECK_OUT_DATE > TO_DATE(:checkIn, 'YYYY-MM-DD')`,
      [roomId, checkOut, checkIn]
    );
    if (conflict.rows.length > 0)
      return res.status(409).json({ error: 'Room is not available for the selected dates' });

    // Get price per night
    const roomResult = await db.execute(
      `SELECT PRICE_PER_NIGHT, MAX_OCCUPANCY FROM room WHERE ROOM_ID = :id`,
      [roomId]
    );
    if (roomResult.rows.length === 0)
      return res.status(404).json({ error: 'Room not found' });

    const { PRICE_PER_NIGHT, MAX_OCCUPANCY } = roomResult.rows[0];
    if (numGuests > MAX_OCCUPANCY)
      return res.status(400).json({ error: `Room max occupancy is ${MAX_OCCUPANCY}` });

    // Calculate cost
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return res.status(400).json({ error: 'Check-out must be after check-in' });
    const totalCost = PRICE_PER_NIGHT * nights;

    const countResult = await db.execute(`SELECT COUNT(*) AS CNT FROM reservations`);
    const newId = `RES${countResult.rows[0].CNT + 1}`;
    
    const assignedStaff = staffId || 'S2';

    await db.execute(
      `INSERT INTO reservations
       (RESERVATION_ID, GUEST_ID, ROOM_ID, STAFF_ID, CHECK_IN_DATE, CHECK_OUT_DATE,
        NUMBER_OF_GUESTS, TOTAL_COST, PAYMENT_STATUS)
       VALUES (:id, :guestId, :roomId, :staffId,
               TO_DATE(:checkIn, 'YYYY-MM-DD'),
               TO_DATE(:checkOut, 'YYYY-MM-DD'),
               :numGuests, :totalCost, 'Pending')`,
      [newId, guestId, roomId, assignedStaff, checkIn, checkOut, numGuests, totalCost]
    );

   
    await db.execute(
      `UPDATE room SET STATUS = 'Occupied' WHERE ROOM_ID = :id`, [roomId]
    );

    res.status(201).json({
      message: 'Reservation created',
      reservationId: newId,
      totalCost,
      nights,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reservations/:id/status — update payment status
router.patch('/:id/status', async (req, res) => {
  const { paymentStatus } = req.body;
  const valid = ['Pending', 'Confirmed', 'Cancelled'];
  if (!valid.includes(paymentStatus))
    return res.status(400).json({ error: `paymentStatus must be one of: ${valid.join(', ')}` });

  try {
    const result = await db.execute(
      `UPDATE reservations SET PAYMENT_STATUS = :status WHERE RESERVATION_ID = :id`,
      [paymentStatus, req.params.id]
    );
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ message: `Reservation status updated to ${paymentStatus}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reservations/:id — cancel reservation
router.delete('/:id', async (req, res) => {
  try {
    
    const res1 = await db.execute(
      `SELECT ROOM_ID FROM reservations WHERE RESERVATION_ID = :id`, [req.params.id]
    );
    if (res1.rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });
    const roomId = res1.rows[0].ROOM_ID;

    await db.execute(
      `DELETE FROM reservations WHERE RESERVATION_ID = :id`, [req.params.id]
    );

    await db.execute(
      `UPDATE room SET STATUS = 'Available' WHERE ROOM_ID = :id`, [roomId]
    );

    res.json({ message: 'Reservation cancelled and room freed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
