const express = require('express');
const router = express.Router();
const {
  getAllDonations,
  getDonationById,
  createDonation,
  handlePaymentSuccess,
  handlePaymentCancel
} = require('../controllers/donationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateDonation } = require('../middleware/validationMiddleware');

// Public routes
router.get('/', getAllDonations);
router.get('/success', handlePaymentSuccess);
router.get('/cancel', handlePaymentCancel);

// Protected routes
router.get('/:id', authMiddleware, getDonationById);
router.post('/donate', authMiddleware, validateDonation, createDonation);

module.exports = router;