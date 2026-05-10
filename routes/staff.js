const express = require('express');
const oracledb = require('oracledb');
const { getConnection } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET all staff (protected)
router.get('/', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM staff ORDER BY staff_id`,
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

// GET single staff member (protected)
router.get('/:id', authMiddleware, async (req, res, next) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM staff WHERE staff_id = :id`,
      { id: req.params.id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Staff member not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;