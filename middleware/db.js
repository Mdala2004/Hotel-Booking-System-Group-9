// middleware/db.js
// Oracle DB connection pool using node-oracledb

const oracledb = require('oracledb');

// Connection pool config — fill in your Oracle credentials
const dbConfig = {
  user: process.env.DB_USER || 'your_oracle_username',
  password: process.env.DB_PASSWORD || 'your_oracle_password',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XEPDB1',
  
};

let pool;

async function initialize() {
  try {
    pool = await oracledb.createPool({
      ...dbConfig,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('✅ Oracle DB connection pool created');
  } catch (err) {
    console.error('❌ Failed to create Oracle DB pool:', err.message);
    throw err;
  }
}

async function close() {
  if (pool) {
    await pool.close(0);
    console.log('Oracle DB pool closed');
  }
}
 
async function execute(sql, binds = [], opts = {}) {
  let conn;
  try {
    conn = await pool.getConnection();
    const options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...opts,
    };
    const result = await conn.execute(sql, binds, options);
    return result;
  } catch (err) {
    console.error('DB execute error:', err.message);
    throw err;
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) { console.error(e); }
    }
  }
}

module.exports = { initialize, close, execute };
