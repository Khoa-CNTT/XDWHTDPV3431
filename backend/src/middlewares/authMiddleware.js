const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      const err = new Error('Authentication required');
      err.status = 401;
      throw err;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      const err = new Error('User not found');
      err.status = 401;
      throw err;
    }

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      err.status = 401;
      err.message = 'Invalid token';
    }
    next(err);
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const err = new Error('Authentication required');
      err.status = 401;
      return next(err);
    }

    if (!roles.includes(req.user.role)) {
      const err = new Error('Access denied');
      err.status = 403;
      return next(err);
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  authorizeRole
}; 