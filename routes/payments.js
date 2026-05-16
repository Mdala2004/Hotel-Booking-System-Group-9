// routes/payments.js — Full payment lifecycle per business rules

const express = require('express');
const router = express.Router();
const db = require('../middleware/db');

// GET /api/payments
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT p.PAYMENT_ID, p.RESERVATION_ID, p.AMOUNT, p.PAYMENT_METHOD,
              p.PAYMENT_DATE, p.PAYMENT_STATUS,
              g.FIRST_NAME || ' ' || g.LAST_NAME AS GUEST_NAME,
              r.TOTAL_COST
       FROM payments p
       JOIN reservations r ON p.RESERVATION_ID = r.RESERVATION_ID
       JOIN guest g ON r.GUEST_ID = g.GUEST_ID
       ORDER BY p.PAYMENT_DATE DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments — record a payment
router.post('/', async (req, res) => {
  const { reservationId, amount, paymentMethod } = req.body;
  const validMethods = ['Cash', 'Credit Card', 'Debit Card', 'EFT'];

  if (!reservationId || !amount || !paymentMethod)
    return res.status(400).json({ error: 'reservationId, amount, and paymentMethod are required' });

  if (!validMethods.includes(paymentMethod))
    return res.status(400).json({ error: `paymentMethod must be one of: ${validMethods.join(', ')}` });

  if (Number(amount) <= 0)
    return res.status(400).json({ error: 'Amount must be greater than zero' });

  try {
    const resResult = await db.execute(
      `SELECT TOTAL_COST, PAYMENT_STATUS FROM reservations WHERE RESERVATION_ID = :id`,
      [reservationId]
    );
    if (resResult.rows.length === 0)
      return res.status(404).json({ error: 'Reservation not found' });

    const { TOTAL_COST, PAYMENT_STATUS } = resResult.rows[0];

    if (PAYMENT_STATUS === 'Cancelled')
      return res.status(400).json({ error: 'Cannot pay for a cancelled reservation' });

    if (PAYMENT_STATUS === 'Confirmed')
      return res.status(400).json({ error: 'Reservation is already confirmed' });

    if (Number(amount) !== Number(TOTAL_COST))
      return res.status(400).json({
        error: `Amount (R${amount}) must match total cost (R${TOTAL_COST})`
      });

    const countResult = await db.execute(`SELECT COUNT(*) AS CNT FROM payments`);
    const newId = `P${countResult.rows[0].CNT + 1}`;

    await db.execute(
      `INSERT INTO payments (PAYMENT_ID, RESERVATION_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_DATE, PAYMENT_STATUS)
       VALUES (:id, :resId, :amount, :method, SYSDATE, 'Paid')`,
      [newId, reservationId, amount, paymentMethod]
    );

    await db.execute(
      `UPDATE reservations SET PAYMENT_STATUS = 'Confirmed' WHERE RESERVATION_ID = :id`,
      [reservationId]
    );

    res.status(201).json({
      message: 'Payment successful — reservation confirmed',
      paymentId: newId,
      amount,
      status: 'Paid',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/:id/refund
router.post('/:id/refund', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT p.PAYMENT_STATUS, p.AMOUNT,
              r.PAYMENT_STATUS AS BOOKING_STATUS
       FROM payments p
       JOIN reservations r ON p.RESERVATION_ID = r.RESERVATION_ID
       WHERE p.PAYMENT_ID = :id`,
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Payment not found' });

    const { PAYMENT_STATUS, BOOKING_STATUS, AMOUNT } = result.rows[0];

    if (PAYMENT_STATUS !== 'Paid')
      return res.status(400).json({ error: 'Refunds only allowed for Paid payments' });

    if (BOOKING_STATUS !== 'Cancelled')
      return res.status(400).json({ error: 'Reservation must be Cancelled before a refund' });

    await db.execute(
      `UPDATE payments SET PAYMENT_STATUS = 'Refunded' WHERE PAYMENT_ID = :id`,
      [req.params.id]
    );

    res.json({
      message: `Refund of R${AMOUNT} processed`,
      paymentId: req.params.id,
      refundAmount: AMOUNT,
      status: 'Refunded',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
