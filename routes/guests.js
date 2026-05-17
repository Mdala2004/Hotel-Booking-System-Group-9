// routes/guests.js — CRUD for guest table

const express = require('express');
const router = express.Router();
const db = require('../middleware/db');

// GET /api/guests — list all guests
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT GUEST_ID, FIRST_NAME, LAST_NAME, PHONE_NUMBER, EMAIL, USERNAME FROM guest ORDER BY GUEST_ID`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/guests/:id — get single guest
router.get('/:id', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT GUEST_ID, FIRST_NAME, LAST_NAME, PHONE_NUMBER, EMAIL, USERNAME FROM guest WHERE GUEST_ID = :id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Guest not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/guests/:id — update guest profile
router.put('/:id', async (req, res) => {
  const { firstName, lastName, phone, email } = req.body;
  try {
    const result = await db.execute(
      `UPDATE guest SET FIRST_NAME = :firstName, LAST_NAME = :lastName,
       PHONE_NUMBER = :phone, EMAIL = :email WHERE GUEST_ID = :id`,
      [firstName, lastName, phone, email, req.params.id]
    );
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Guest not found' });
    res.json({ message: 'Guest updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/guests/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.execute(
      `DELETE FROM guest WHERE GUEST_ID = :id`, [req.params.id]
    );
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Guest not found' });
    res.json({ message: 'Guest deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/guests/:id/reservations — get all reservations for a guest
router.get('/:id/reservations', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT r.RESERVATION_ID, rm.ROOM_NUMBER, rt.TYPE_NAME,
              r.CHECK_IN_DATE, r.CHECK_OUT_DATE, r.NUMBER_OF_GUESTS,
              r.TOTAL_COST, r.PAYMENT_STATUS
       FROM reservations r
       JOIN room rm ON r.ROOM_ID = rm.ROOM_ID
       JOIN room_type rt ON rm.ROOM_TYPE_ID = rt.ROOM_TYPE_ID
       WHERE r.GUEST_ID = :id
       ORDER BY r.CHECK_IN_DATE DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
