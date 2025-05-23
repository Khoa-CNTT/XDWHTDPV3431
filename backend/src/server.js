require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const blockchainService = require('./services/blockchainService');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Khởi tạo blockchain service trước khi start server
    await blockchainService.initialize();
    console.log('Blockchain service initialized successfully');

    // Kiểm tra kết nối database
    await sequelize.authenticate();
    console.log('Kết nối database thành công.');

    // Chạy migrations
    await sequelize.sync();
    console.log('Database đã được đồng bộ.');

    app.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`);
    });
  } catch (error) {
    console.error('Không thể khởi tạo server:', error);
    process.exit(1);
  }
})();