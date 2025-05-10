const express = require('express');
const router = express.Router();
const transparencyController = require('../controllers/transparencyController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Lấy tất cả báo cáo minh bạch
router.get('/', transparencyController.getAllReports);

// Lấy báo cáo theo ID
router.get('/:id', transparencyController.getReportById);

// Tạo báo cáo mới (chỉ admin)
router.post('/', authenticateToken, isAdmin, transparencyController.createReport);

// Cập nhật báo cáo (chỉ admin)
router.put('/:id', authenticateToken, isAdmin, transparencyController.updateReport);

// Xóa báo cáo (chỉ admin)
router.delete('/:id', authenticateToken, isAdmin, transparencyController.deleteReport);

module.exports = router; 