const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const charityNeedRoutes = require('./routes/charityNeed');
const transparencyRoutes = require('./routes/transparency');
const adminRoutes = require('./routes/admin');
const blockchainRoutes = require('./routes/blockchainRoutes');
const errorHandler = require('./middlewares/errorHandler');
const blockchainService = require('./services/blockchainService');
const authMiddleware = require('./middlewares/authMiddleware');
require('./models'); // Load all models and their associations

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.ethereum.org", "https://*.infura.io"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400
}));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Khởi tạo blockchain service
(async () => {
  try {
    await blockchainService.initialize();
    console.log('Blockchain service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize blockchain service:', error);
  }
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/charity-needs', charityNeedRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/transparency', transparencyRoutes);
app.use('/api/admin', adminRoutes);

// Debug middleware for all routes
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.originalUrl);
    next();
});

// Error handling
app.use((req, res, next) => {
    console.log('404 Not Found:', req.method, req.originalUrl);
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use(errorHandler);

module.exports = app; 