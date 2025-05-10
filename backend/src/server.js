require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, User, CharityNeed, TransparencyReport, Contribution, Feedback, Evaluation } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const charityNeedRoutes = require('./routes/charityNeed');
const transparencyRoutes = require('./routes/transparency');
const errorHandler = require('./errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/charity-needs', charityNeedRoutes);
app.use('/api/transparency', transparencyRoutes);

// Error handling
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    // Kiểm tra kết nối database
    await sequelize.authenticate();
    console.log('Kết nối database thành công.');

    // Chạy migrations
    await sequelize.sync();
    console.log('Database đã được đồng bộ.');

    console.log(`Server đang chạy trên port ${PORT}`);
  } catch (error) {
    console.error('Không thể kết nối đến database:', error);
  }
});