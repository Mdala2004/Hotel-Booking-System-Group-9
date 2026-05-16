// server.js — Entry point for Hotel Booking System API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./middleware/db');

// Route imports
const guestRoutes = require('./routes/guests');
const roomRoutes = require('./routes/rooms');
const reservationRoutes = require('./routes/reservations');
const paymentRoutes = require('./routes/payments');
const staffRoutes = require('./routes/staff');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static('public'));

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── Start Server ─────────────────────────────────────────────
async function startServer() {
  try {
    await db.initialize();
    app.listen(PORT, () => {
      console.log(`🏨 Hotel Booking API running on http://localhost:${PORT}`);
      console.log(`📋 Routes: /api/auth | /api/guests | /api/rooms | /api/reservations | /api/payments | /api/staff`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await db.close();
  process.exit(0);
});

startServer();
