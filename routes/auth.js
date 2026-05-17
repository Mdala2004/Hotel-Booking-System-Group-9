// routes/auth.js — Guest login, registration, and staff login with RBAC

const express = require('express');
const router = express.Router();
const db = require('../middleware/db');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// POST /api/auth/login — guest login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });
  try {
    const result = await db.execute(
      `SELECT GUEST_ID, FIRST_NAME, LAST_NAME, EMAIL, USERNAME, PASSWORD FROM guest WHERE USERNAME = :username`,
      [username]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid username or password' });
    const guest = result.rows[0];
    let valid = false;
    if (guest.PASSWORD.startsWith('$2b$') || guest.PASSWORD.startsWith('$2a$')) {
      valid = await bcrypt.compare(password, guest.PASSWORD);
    } else {
      valid = password === guest.PASSWORD;
    }
    if (!valid) return res.status(401).json({ error: 'Invalid username or password' });
    const { PASSWORD: _, ...guestData } = guest;
    res.json({ message: 'Login successful', guest: guestData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register — guest registration
router.post('/register', async (req, res) => {
  const { firstName, lastName, phone, email, username, password } = req.body;
  if (!firstName || !lastName || !email || !username || !password || !phone)
    return res.status(400).json({ error: 'All fields are required including phone number' });
  try {
    const existing = await db.execute(
      `SELECT GUEST_ID FROM guest WHERE USERNAME = :username OR EMAIL = :email`,
      [username, email]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Username or email already in use' });
    const countResult = await db.execute(`SELECT COUNT(*) AS CNT FROM guest`);
    const newId = `G${countResult.rows[0].CNT + 1}`;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await db.execute(
      `INSERT INTO guest (GUEST_ID, FIRST_NAME, LAST_NAME, PHONE_NUMBER, EMAIL, USERNAME, PASSWORD)
       VALUES (:id, :firstName, :lastName, :phone, :email, :username, :password)`,
      [newId, firstName, lastName, phone, email, username, hashedPassword]
    );
    res.status(201).json({ message: 'Registration successful', guestId: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/staff-login — staff login with role-based permissions
router.post('/staff-login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });
  try {
    const result = await db.execute(
      `SELECT STAFF_ID, FIRST_NAME, LAST_NAME, ROLE, DEPARTMENT, STAFF_EMAIL, PASSWORD
       FROM staff WHERE LOWER(FIRST_NAME) = LOWER(:username)`,
      [username]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid username or password' });

    const staff = result.rows[0];

    if (!staff.PASSWORD)
      return res.status(401).json({ error: 'No password set for this account. Contact your manager.' });

    let valid = false;
    if (staff.PASSWORD.startsWith('$2b$') || staff.PASSWORD.startsWith('$2a$')) {
      valid = await bcrypt.compare(password, staff.PASSWORD);
    } else {
      valid = password === staff.PASSWORD;
    }
    if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

    const permissions = getRolePermissions(staff.ROLE);
    const { PASSWORD: _, ...staffData } = staff;
    res.json({ message: 'Login successful', staff: { ...staffData, permissions } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Role-based permissions — controls what each staff role can see and do
function getRolePermissions(role) {
  const none = {
    viewAllReservations: false,
    manageReservations: false,
    viewGuests: false,
    manageRoomStatus: false,
    viewPayments: false,
    processRefunds: false,
    viewStaff: false,
  };

  switch (role) {
    case 'Manager':
      // Full access — can do everything
      return { viewAllReservations: true, manageReservations: true, viewGuests: true,
               manageRoomStatus: true, viewPayments: true, processRefunds: true, viewStaff: true };

    case 'Receptionist':
      // Front desk — reservations, guests, payments but no refunds or staff view
      return { ...none, viewAllReservations: true, manageReservations: true,
               viewGuests: true, manageRoomStatus: true, viewPayments: true };

    case 'Cleaner':
      // Housekeeping — room status only (mark rooms clean / under maintenance)
      return { ...none, manageRoomStatus: true };

    case 'Security':
      // View checked-in guests only
      return { ...none, viewGuests: true };

    case 'Finance':
    case 'Admin':
      // Financial oversight — payments and refunds
      return { ...none, viewPayments: true, processRefunds: true, viewAllReservations: true };

    default:
      return none;
  }
}

module.exports = router;
