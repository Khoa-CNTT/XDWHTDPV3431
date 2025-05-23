const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      errors: Object.values(err.errors).map(error => ({
        msg: error.message,
        param: error.path,
        location: 'body'
      }))
    });
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      errors: err.errors.map(error => ({
        msg: error.message,
        param: error.path,
        location: 'body'
      }))
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      errors: err.errors.map(error => ({
        msg: error.message,
        param: error.path,
        location: 'body'
      }))
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  // Not found error
  if (err.status === 404) {
    return res.status(404).json({
      message: err.message || 'Not Found'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler; 