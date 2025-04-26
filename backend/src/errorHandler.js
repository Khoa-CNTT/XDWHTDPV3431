const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Lỗi validation từ Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: err.errors.map(e => e.message)
    });
  }

  // Lỗi unique constraint từ Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Dữ liệu đã tồn tại'
    });
  }

  // Lỗi không tìm thấy từ Sequelize
  if (err.name === 'SequelizeNotFoundError') {
    return res.status(404).json({
      error: 'Không tìm thấy dữ liệu'
    });
  }

  // Lỗi xác thực JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token không hợp lệ'
    });
  }

  // Lỗi token hết hạn
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token đã hết hạn'
    });
  }

  // Lỗi 404
  if (err.status === 404) {
    return res.status(404).json({
      error: err.message || 'Không tìm thấy tài nguyên'
    });
  }

  // Lỗi 400
  if (err.status === 400) {
    return res.status(400).json({
      error: err.message || 'Yêu cầu không hợp lệ'
    });
  }

  // Lỗi 401
  if (err.status === 401) {
    return res.status(401).json({
      error: err.message || 'Không có quyền truy cập'
    });
  }

  // Lỗi mặc định
  return res.status(500).json({
    error: 'Lỗi server'
  });
};

module.exports = errorHandler; 