const express = require('express');
const router = express.Router();
const charityNeedController = require('../controllers/charityNeedController');
const { authMiddleware, authorizeRole } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', charityNeedController.getAllCharityNeeds);
router.get('/:id', charityNeedController.getCharityNeedById);

// Protected routes
router.post('/', authMiddleware, charityNeedController.createCharityNeed);
router.post('/:id/donate', authMiddleware, charityNeedController.donate);

// Admin routes
router.get('/admin/pending', authMiddleware, authorizeRole(['admin']), charityNeedController.getPendingCharityNeeds);
router.post('/admin/:id/approve', authMiddleware, authorizeRole(['admin']), charityNeedController.approveCharityNeed);
router.post('/admin/:id/reject', authMiddleware, authorizeRole(['admin']), charityNeedController.rejectCharityNeed);

module.exports = router;