const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // expects: Bearer <token>

  if (!token)
    return res.status(401).json({error: 'Access denied. Please log in.'});

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.guest = decoded; // guest info now available in all protected routes
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};