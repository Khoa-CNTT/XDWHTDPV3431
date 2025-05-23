const express = require('express');
const router = express.Router();
const transparencyController = require('../controllers/transparencyController');
const { authMiddleware, authorizeRole } = require('../middlewares/authMiddleware');

console.log('Controller:', transparencyController); // Debug log

// Lấy tất cả báo cáo minh bạch
router.get('/', transparencyController.getAllReports);

// Lấy báo cáo theo ID
router.get('/:id', transparencyController.getReportById);

// Tạo báo cáo mới (chỉ admin)
router.post('/', authMiddleware, authorizeRole(['admin']), transparencyController.createReport);

// Cập nhật báo cáo (chỉ admin)
router.put('/:id', authMiddleware, authorizeRole(['admin']), transparencyController.updateReport);

// Xóa báo cáo (chỉ admin)
router.delete('/:id', authMiddleware, authorizeRole(['admin']), transparencyController.deleteReport);

module.exports = router; 