const express = require('express');
const oracledb = require('oracledb');
const { getConnection } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET all payments (protected)
router.get('/', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM payments ORDER BY payment_date DESC`,
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

// GET payment by reservation (protected)
router.get('/reservation/:reservation_id', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM payments WHERE reservation_id = :reservation_id`,
      { reservation_id: req.params.reservation_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'No payment found for this reservation' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// POST create payment (protected)
router.post('/', authMiddleware, async (req, res, next) => {
  const { payment_id, reservation_id, amount, payment_method, payment_date, payment_status } = req.body;
  const validMethods = ['Cash', 'EFT', 'Card'];
  if (!validMethods.includes(payment_method))
    return res.status(400).json({ error: `payment_method must be one of: ${validMethods.join(', ')}` });

  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `INSERT INTO payments VALUES (
        :payment_id, :reservation_id, :amount, :payment_method,
        TO_DATE(:payment_date, 'YYYY-MM-DD'), :payment_status
      )`,
      { payment_id, reservation_id, amount, payment_method, payment_date, payment_status },
      { autoCommit: true }
    );
    res.status(201).json({ message: 'Payment recorded successfully' });
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// PUT update payment status (protected)
router.put('/:id/status', authMiddleware, async (req, res, next) => {
  const { payment_status } = req.body;
  const valid = ['Paid', 'Pending', 'Failed'];
  if (!valid.includes(payment_status))
    return res.status(400).json({ error: `payment_status must be one of: ${valid.join(', ')}` });

  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `UPDATE payments SET payment_status = :payment_status WHERE payment_id = :id`,
      { payment_status, id: req.params.id },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0)
      return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment status updated' });
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;