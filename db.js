const oracledb = require('oracledb');
require('dotenv').config();

// Enable Thin mode
oracledb.thin = true;

let pool;

async function initPool() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 2,      // minimum connections kept alive
      poolMax: 10,     // maximum concurrent connections
      poolIncrement: 1 // connections added when pool is exhausted
    });
    console.log('Oracle connection pool created successfully');
  } catch (err) {
    console.error('Failed to create connection pool:', err);
    throw err;
  }
}

async function getConnection() {
  if (!pool) throw new Error('Pool not initialized. Call initPool() first.');
  return await pool.getConnection();
}

async function closePool() {
  if (pool) {
    await pool.close(0);
    console.log('Pool closed');
  }
}

module.exports = { initPool, getConnection, closePool };