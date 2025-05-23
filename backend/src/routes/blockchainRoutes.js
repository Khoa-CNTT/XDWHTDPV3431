const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const blockchainController = require('../controllers/blockchainController');

// Debug middleware
router.use((req, res, next) => {
    console.log('Blockchain Route:', req.method, req.originalUrl);
    next();
});

// Tạo dự án từ thiện mới
router.post('/needs', authMiddleware, blockchainController.createNeed);

// Quyên góp cho dự án
router.post('/needs/:needId/contribute', authMiddleware, blockchainController.contribute);

// Lấy thông tin chi tiết dự án
router.get('/needs/:needId', blockchainController.getNeedDetails);

// Lấy danh sách ID dự án
router.get('/needs', blockchainController.getNeedIds);

// Rút tiền từ dự án
router.post('/needs/:needId/withdraw', authMiddleware, blockchainController.withdrawFunds);

module.exports = router; 