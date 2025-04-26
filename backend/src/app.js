const express = require('express');
const cors = require('cors');
const { validationResult } = require('express-validator');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validation error handler
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      errors: Object.values(err.errors).map(error => ({
        msg: error.message,
        param: error.path,
        location: 'body'
      }))
    });
  }
  next(err);
});

// Routes
app.use('/api', routes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app; 