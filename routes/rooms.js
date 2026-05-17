// routes/rooms.js — Room availability, types, CRUD

const express = require('express');
const router = express.Router();
const db = require('../middleware/db');

// GET /api/rooms — list all rooms with type info
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT r.ROOM_ID, r.ROOM_NUMBER, r.PRICE_PER_NIGHT, r.MAX_OCCUPANCY,
              r.STATUS, r.RATING, r.LOCATION,
              rt.TYPE_NAME, rt.BED_CONFIGURATION, rt.ROOM_DESCRIPTION
       FROM room r
       JOIN room_type rt ON r.ROOM_TYPE_ID = rt.ROOM_TYPE_ID
       ORDER BY r.ROOM_NUMBER`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rooms/available — only available rooms
router.get('/available', async (req, res) => {
  const { checkIn, checkOut, guests } = req.query;
  try {
    let sql = `
      SELECT r.ROOM_ID, r.ROOM_NUMBER, r.PRICE_PER_NIGHT, r.MAX_OCCUPANCY,
             r.STATUS, r.RATING, r.LOCATION,
             rt.TYPE_NAME, rt.BED_CONFIGURATION, rt.ROOM_DESCRIPTION
      FROM room r
      JOIN room_type rt ON r.ROOM_TYPE_ID = rt.ROOM_TYPE_ID
      WHERE r.STATUS = 'Available'`;

    const binds = [];
    if (guests) {
      sql += ` AND r.MAX_OCCUPANCY >= :guests`;
      binds.push(Number(guests));
    }

    // Exclude rooms booked in the date range
    if (checkIn && checkOut) {
      sql += `
        AND r.ROOM_ID NOT IN (
          SELECT res.ROOM_ID FROM reservations res
          WHERE res.CHECK_IN_DATE < TO_DATE(:checkOut, 'YYYY-MM-DD')
            AND res.CHECK_OUT_DATE > TO_DATE(:checkIn, 'YYYY-MM-DD')
        )`;
      binds.push(checkOut, checkIn);
    }

    sql += ` ORDER BY r.PRICE_PER_NIGHT`;
    const result = await db.execute(sql, binds);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rooms/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT r.ROOM_ID, r.ROOM_NUMBER, r.PRICE_PER_NIGHT, r.MAX_OCCUPANCY,
              r.STATUS, r.RATING, r.LOCATION,
              rt.TYPE_NAME, rt.BED_CONFIGURATION, rt.ROOM_DESCRIPTION
       FROM room r
       JOIN room_type rt ON r.ROOM_TYPE_ID = rt.ROOM_TYPE_ID
       WHERE r.ROOM_ID = :id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/rooms/:id/status — update room status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Available', 'Occupied', 'Maintenance'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });

  try {
    const result = await db.execute(
      `UPDATE room SET STATUS = :status WHERE ROOM_ID = :id`,
      [status, req.params.id]
    );
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Room not found' });
    res.json({ message: `Room status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rooms/types — all room types
router.get('/types/all', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT * FROM room_type ORDER BY BASE_PRICE`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
