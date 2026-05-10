const bcrypt = require('bcrypt');
const oracledb = require('oracledb');
require('dotenv').config();

oracledb.thin = true;

const guests = [
  { username: 'john_g',   password: 'p63gk' },
  { username: 'sethu_s',  password: '86djk' },
  { username: 'mike_b',   password: 'pafu36^ss' },
  { username: 'sarah_l',  password: 'pass3428##' },
  { username: 'alakhe_m', password: '8opjjk' },
  { username: 'theo_w',   password: '8123x@jk' },
  { username: 'kamo_r',   password: 'qqrt563gk' },
];

async function setup() {
  let conn;
  try {
    console.log('Connecting to database');
    conn = await oracledb.getConnection({
      user:          process.env.DB_USER,
      password:      process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    console.log('Connected. Expanding password column.');
    await conn.execute(`ALTER TABLE guest MODIFY (password VARCHAR2(60))`);

    console.log('Hashing and updating passwords.');
    for (const guest of guests) {
      const hash = await bcrypt.hash(guest.password, 10);
      await conn.execute(
        `UPDATE guest SET password = :hash WHERE username = :username`,
        { hash, username: guest.username },
        { autoCommit: true }
      );
      console.log(`Updated password for ${guest.username}`);
    }

    console.log('');
    console.log('Setup complete. You can now run: npm run dev');
  } catch (err) {
    //If column is already 60 chars, Oracle throws an error
    if (err.errorNum === 1441) {
      console.log('Password column already expanded, skipping');
    } else {
      console.error("Setup failed:', err.message");
    }
  } finally {
    if (conn) await conn.close();
  }
}

setup();