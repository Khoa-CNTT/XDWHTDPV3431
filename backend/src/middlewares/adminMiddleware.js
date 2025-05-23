const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    const err = new Error('Admin access required');
    err.status = 403;
    next(err);
  }
};

module.exports = admin; 