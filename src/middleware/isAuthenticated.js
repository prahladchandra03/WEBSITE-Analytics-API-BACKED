// module.exports = isAuthenticated;const jwt = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const isAuthenticated= async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ message: 'User not authenticated', error: err.message });
  }
};

module.exports = isAuthenticated;