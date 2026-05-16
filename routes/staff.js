// routes/staff.js

const express = require('express');
const router = express.Router();
const db = require('../middleware/db');

// GET /api/staff
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT * FROM staff ORDER BY DEPARTMENT, LAST_NAME`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/staff/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT * FROM staff WHERE STAFF_ID = :id`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
