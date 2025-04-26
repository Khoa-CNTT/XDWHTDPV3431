const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Thống kê tổng quan
router.get('/stats', authMiddleware, authorizeRole(['admin']), adminController.getStats);

// Quản lý user
router.get('/users', authMiddleware, authorizeRole(['admin']), adminController.getUsers);
router.patch('/users/:id/role', authMiddleware, authorizeRole(['admin']), adminController.changeUserRole);
router.patch('/users/:id/lock', authMiddleware, authorizeRole(['admin']), adminController.lockUser);
router.delete('/users/:id', authMiddleware, authorizeRole(['admin']), adminController.deleteUser);

// Quản lý dự án
router.get('/projects', authMiddleware, authorizeRole(['admin']), adminController.getProjects);
router.patch('/projects/:id/approve', authMiddleware, authorizeRole(['admin']), adminController.approveProject);
router.patch('/projects/:id/reject', authMiddleware, authorizeRole(['admin']), adminController.rejectProject);
router.delete('/projects/:id', authMiddleware, authorizeRole(['admin']), adminController.deleteProject);

// Lịch sử quyên góp
router.get('/donations', authMiddleware, authorizeRole(['admin']), adminController.getDonations);

// Gửi thông báo
router.post('/notifications', authMiddleware, authorizeRole(['admin']), adminController.sendNotification);

// Nhật ký hoạt động
router.get('/logs', authMiddleware, authorizeRole(['admin']), adminController.getLogs);

module.exports = router;