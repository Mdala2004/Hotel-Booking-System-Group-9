const express = require('express');
const oracledb = require('oracledb');
const { getConnection } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET all available rooms
router.get('/available', async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM vw_available_rooms`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// GET all rooms (protected)
router.get('/', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT r.room_id, r.room_number, rt.type_name, r.price_per_night,
              r.max_occupancy, r.status, r.rating, r.location
       FROM room r JOIN room_type rt ON r.room_type_id = rt.room_type_id
       ORDER BY r.room_number`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// GET single room (protected)
router.get('/:id', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT r.room_id, r.room_number, rt.type_name, rt.bed_configuration,
              r.price_per_night, r.max_occupancy, r.status, r.rating, r.location
       FROM room r JOIN room_type rt ON r.room_type_id = rt.room_type_id
       WHERE r.room_id = :id`,
      { id: req.params.id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Room not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// PUT update room status (protected)
router.put('/:id/status', authMiddleware, async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['Available', 'Occupied', 'Maintenance'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });

  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `UPDATE room SET status = :status WHERE room_id = :id`,
      { status, id: req.params.id },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0)
      return res.status(404).json({ error: 'Room not found' });
    res.json({ message: `Room status updated to ${status}` });
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;