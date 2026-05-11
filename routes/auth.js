const express = require('express');
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');
const { getConnection } = require('../db');
const bcrypt = require('bcrypt');

const router = express.Router();

//POST /auth/login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT guest_id, first_name, last_name, email, username, password
       FROM guest WHERE username = :username`,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid username or password' });

    const guest = result.rows[0];

    const match = await bcrypt.compare(password, guest.PASSWORD);

if (!match)
      return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign(
      { guest_id: guest.GUEST_ID, username: guest.USERNAME },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      guest: {
        id: guest.GUEST_ID,
        name: `${guest.FIRST_NAME} ${guest.LAST_NAME}`,
        email: guest.EMAIL
      }
    });
  } catch (err) {
    next(err);
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;