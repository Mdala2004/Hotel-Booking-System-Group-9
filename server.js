const express = require('express');
const { initPool } = require('./db');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

//Routes 
app.use('/auth', require('./routes/auth'));
app.use('/guest', require('./routes/guest'));
app.use('/room', require('./routes/room'));
app.use('/roomType', require('./routes/roomType'));
app.use('/reservation', require('./routes/reservation'));
app.use('/payment', require('./routes/payment'));
app.use('/staff', require('./routes/staff'));

// Health check
app.get('/', (req, res) => res.json({ status: ' System API is running' }));

//Central Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
initPool().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}).catch(err => {
  console.error('Startup failed:', err);
  process.exit(1);
});