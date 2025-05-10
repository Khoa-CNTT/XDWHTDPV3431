const adminMiddleware = (req, res, next) => {
  // Kiểm tra xem user đã đăng nhập chưa
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Kiểm tra xem user có phải là admin không
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  next();
};

module.exports = adminMiddleware; 