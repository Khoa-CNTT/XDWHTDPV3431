const errorHandler = (err, req, res, next) => {
  // Ghi lại lỗi vào console để debug
  console.error(err.stack);

  // Xác định mã trạng thái, mặc định là 500 nếu không có
  const statusCode = err.status || 500;

  // Tạo phản hồi lỗi
  const errorResponse = {
    status: statusCode,
    message: err.message || 'Internal Server Error',
  };

  // Trong môi trường phát triển, thêm chi tiết lỗi để debug
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = err.stack; // Hiển thị stack trace trong development
  }

  // Xử lý các lỗi cụ thể
  if (err.name === 'SequelizeValidationError') {
    // Lỗi validation từ Sequelize
    errorResponse.status = 400;
    errorResponse.message = 'Validation Error';
    errorResponse.errors = err.errors.map(e => e.message);
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    // Lỗi trùng lặp (ví dụ: username đã tồn tại)
    errorResponse.status = 400;
    errorResponse.message = 'Duplicate Entry';
    errorResponse.errors = err.errors.map(e => e.message);
  } else if (err.name === 'JsonWebTokenError') {
    // Lỗi JWT (token không hợp lệ)
    errorResponse.status = 401;
    errorResponse.message = 'Invalid or Expired Token';
  }

  // Gửi phản hồi lỗi
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;