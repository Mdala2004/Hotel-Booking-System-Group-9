const express = require('express');
const oracledb = require('oracledb');
const { body } = require('express-validator');
const { getConnection } = require('../db');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const reservationRules = [
  body('reservation_id').notEmpty().withMessage('reservation_id is required'),
  body('guest_id').notEmpty().withMessage('guest_id is required'),
  body('room_id').notEmpty().withMessage('room_id is required'),
  body('staff_id').notEmpty().withMessage('staff_id is required'),
  body('check_in_date').isDate().withMessage('Valid check_in_date required (YYYY-MM-DD)'),
  body('check_out_date').isDate().withMessage('Valid check_out_date required (YYYY-MM-DD)'),
  body('check_out_date').custom((val, { req }) => {
    if (new Date(val) <= new Date(req.body.check_in_date))
      throw new Error('check_out_date must be after check_in_date');
    return true;
  }),
  body('number_of_guests').isInt({ min: 1 }).withMessage('number_of_guests must be at least 1'),
  body('total_cost').isNumeric().withMessage('total_cost must be a number'),
  body('payment_status').isIn(['Confirmed', 'Pending', 'Cancelled'])
    .withMessage('payment_status must be Confirmed, Pending, or Cancelled'),
];

// GET all reservations with full details
router.get('/', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM vw_reservation_details`,
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

// GET single reservation (protected)
router.get('/:id', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM reservations WHERE reservation_id = :id`,
      { id: req.params.id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Reservation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// GET reservations by guest (protected)
router.get('/guest/:guest_id', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM reservations WHERE guest_id = :guest_id`,
      { guest_id: req.params.guest_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// POST create reservation (protected)
router.post('/', authMiddleware, reservationRules, validate, async (req, res, next) => {
  const { reservation_id, guest_id, room_id, staff_id,
          check_in_date, check_out_date, number_of_guests,
          total_cost, payment_status } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `INSERT INTO reservations VALUES (
        :reservation_id, :guest_id, :room_id, :staff_id,
        TO_DATE(:check_in_date, 'YYYY-MM-DD'),
        TO_DATE(:check_out_date, 'YYYY-MM-DD'),
        :number_of_guests, :total_cost, :payment_status
      )`,
      { reservation_id, guest_id, room_id, staff_id,
        check_in_date, check_out_date, number_of_guests,
        total_cost, payment_status },
      { autoCommit: true }
    );
    res.status(201).json({ message: 'Reservation created successfully' });
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// PUT update payment status (protected)
router.put('/:id/status', authMiddleware, async (req, res, next) => {
  const { payment_status } = req.body;
  const valid = ['Confirmed', 'Pending', 'Cancelled'];
  if (!valid.includes(payment_status))
    return res.status(400).json({ error: `payment_status must be one of: ${valid.join(', ')}` });

  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `UPDATE reservations SET payment_status = :payment_status
       WHERE reservation_id = :id`,
      { payment_status, id: req.params.id },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0)
      return res.status(404).json({ error: 'Reservation not found' });
    res.json({ message: 'Reservation status updated' });
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// DELETE reservation (protected)
router.delete('/:id', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `DELETE FROM reservations WHERE reservation_id = :id`,
      { id: req.params.id },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0)
      return res.status(404).json({ error: 'Reservation not found' });
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;