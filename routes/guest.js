const express = require('express');
const oracledb = require('oracledb');
const { body } = require('express-validator');
const { getConnection } = require('../db');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcrypt');

const router = express.Router();

const guestRules = [
  body('guest_id').notEmpty().withMessage('guest_id is required'),
  body('first_name').notEmpty().withMessage('first_name is required'),
  body('last_name').notEmpty().withMessage('last_name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone_number').notEmpty().withMessage('phone_number is required'),
  body('username').notEmpty().withMessage('username is required'),
  body('password').notEmpty().withMessage('password is required'),
];

// GET all guests (protected)
router.get('/', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
  
      `SELECT guest_id, first_name, last_name, phone_number, email, username
       FROM guest ORDER BY guest_id`,
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

// GET single guest (protected)
router.get('/:id', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT guest_id, first_name, last_name, phone_number, email, username
       FROM guest WHERE guest_id = :id`,
      { id: req.params.id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Guest not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// GET guest payment summary (uses your view)
router.get('/:id/payment-summary', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM vw_guest_payment_summary WHERE guest_id = :id`,
      { id: req.params.id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'No payment summary found for this guest' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// POST create guest (for registration page)
router.post('/', guestRules, validate, async (req, res, next) => {
  const { guest_id, first_name, last_name, phone_number, email, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `INSERT INTO guest VALUES (:guest_id, :first_name, :last_name,
       :phone_number, :email, :username, :password)`,
      { guest_id, first_name, last_name, phone_number, email, username, password: hashedPassword },
      { autoCommit: true }
    );
    res.status(201).json({ message: 'Guest registered successfully' });
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// PUT update guest (protected)
router.put('/:id', authMiddleware, async (req, res, next) => {
  const { first_name, last_name, phone_number, email } = req.body;

  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `UPDATE guest SET first_name = :first_name, last_name = :last_name,
       phone_number = :phone_number, email = :email WHERE guest_id = :id`,
      { first_name, last_name, phone_number, email, id: req.params.id },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0)
      return res.status(404).json({error: 'Guest not found'});
    res.json({message: 'Guest updated successfully'});
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

// DELETE guest (protected)
router.delete('/:id', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `DELETE FROM guest WHERE guest_id = :id`,
      { id: req.params.id },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0)
      return res.status(404).json({error: 'Guest not found'});
    res.json({message: 'Guest deleted successfully'});
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;