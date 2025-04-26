require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const donationRoutes = require('./routes/donation');
const charityNeedRoutes = require('./routes/charityNeed');
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

// Database connection
sequelize.authenticate()
  .then(() => console.log('Kết nối MySQL thành công'))
  .catch((err) => {
    console.error('Lỗi kết nối MySQL:', err);
    process.exit(1);
  });

// Sync all models without force
sequelize.sync()
  .then(() => {
    console.log('Đã đồng bộ các bảng trong database');
  })
  .catch((err) => console.error('Lỗi đồng bộ:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/donation', donationRoutes);
app.use('/api/charity-needs', charityNeedRoutes);

// Error handling
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy trên cổng ${PORT}`);
  console.log(`API có thể truy cập tại http://localhost:${PORT}`);
});