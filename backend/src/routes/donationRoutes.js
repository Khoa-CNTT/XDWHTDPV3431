const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/', donationController.getAllDonations);
router.get('/:id', donationController.getDonationById);

// Protected routes
router.use(authMiddleware);
router.post('/', donationController.createDonation);
router.patch('/:id/status', donationController.updateDonationStatus);
router.get('/user/me', donationController.getUserDonations);
router.get('/need/:needId', donationController.getNeedDonations);

module.exports = router; 