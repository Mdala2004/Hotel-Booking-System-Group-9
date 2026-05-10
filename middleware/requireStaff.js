// Stops guests from manually removing details without staff approval
module.exports = (req, res, next) => {
  if (req.user?.role !== 'staff') {
    return res.status(403).json({error: 'Access restricted to staff only' });
  }
  next();
};

const requireStaff = require('../middleware/requireStaff');
router.delete('/:id', authMiddleware, requireStaff, async (req, res, next) => {});