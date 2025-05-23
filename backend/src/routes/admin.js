const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, authorizeRole } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Dashboard stats
router.get('/stats', authMiddleware, authorizeRole(['admin']), adminController.getStats);

// User management
router.get('/users', authMiddleware, authorizeRole(['admin']), adminController.getUsers);
router.patch('/users/:id/role', authMiddleware, authorizeRole(['admin']), adminController.changeUserRole);
router.patch('/users/:id/lock', authMiddleware, authorizeRole(['admin']), adminController.lockUser);
router.delete('/users/:id', authMiddleware, authorizeRole(['admin']), adminController.deleteUser);

// Charity needs management
router.get('/charity-needs', authMiddleware, authorizeRole(['admin']), adminController.getCharityNeeds);
router.patch('/charity-needs/:id/approve', authMiddleware, authorizeRole(['admin']), adminController.approveCharityNeed);
router.patch('/charity-needs/:id/reject', authMiddleware, authorizeRole(['admin']), adminController.rejectCharityNeed);
router.delete('/charity-needs/:id', authMiddleware, authorizeRole(['admin']), adminController.deleteCharityNeed);

// Donations management
router.get('/donations', authMiddleware, authorizeRole(['admin']), adminController.getDonations);

// Notifications
router.post('/notifications', authMiddleware, authorizeRole(['admin']), adminController.sendNotification);

// Logs
router.get('/logs', authMiddleware, authorizeRole(['admin']), adminController.getLogs);

module.exports = router;