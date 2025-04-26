const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      const err = new Error('No token provided');
      err.status = 401;
      throw err;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.findById(decoded.id);
    
    if (!user) {
      const err = new Error('User not found');
      err.status = 401;
      throw err;
    }

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

const authorizeRole = (role) => (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return res.status(403).json({ error: `Bạn không có quyền truy cập chức năng này. Vai trò yêu cầu: ${role}` });
    }
    next();
  };

module.exports = { authMiddleware, authorizeRole };
