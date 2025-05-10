const donationRepository = require('../repositories/donationRepository');
const userRepository = require('../repositories/userRepository');
const charityNeedRepository = require('../repositories/charityNeedRepository');
const paypal = require('paypal-rest-sdk');

// Cấu hình PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE, // 'sandbox' hoặc 'live'
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

// Controller functions
const getAllDonations = async (req, res, next) => {
  try {
    const { user_id, need_id, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (user_id) filters.user_id = user_id;
    if (need_id) filters.need_id = need_id;

    const offset = (page - 1) * limit;
    const donations = await donationRepository.getAll({ ...filters, limit, offset });
    const total = await donationRepository.count(filters);

    res.json({
      data: donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getDonationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const donation = await donationRepository.getDonationById(id);
    if (!donation) {
      const err = new Error('Donation not found');
      err.status = 404;
      throw err;
    }
    res.json(donation);
  } catch (err) {
    next(err);
  }
};

const createDonation = async (req, res, next) => {
  try {
    const { need_id, amount } = req.body;
    const user_id = req.user.id;

    if (!need_id || !amount) {
      const err = new Error('Missing required fields: need_id, amount');
      err.status = 400;
      throw err;
    }

    const need = await charityNeedRepository.getById(need_id);
    if (!need) {
      const err = new Error('Charity need not found');
      err.status = 404;
      throw err;
    }

    const donation = await donationRepository.create({
      user_id,
      need_id,
      amount,
      status: 'pending'
    });

    res.status(201).json(donation);
  } catch (err) {
    next(err);
  }
};

const updateDonationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'rejected'].includes(status)) {
      const err = new Error('Invalid status');
      err.status = 400;
      throw err;
    }

    const donation = await donationRepository.update(id, { status });
    res.json(donation);
  } catch (err) {
    next(err);
  }
};

const handlePaymentSuccess = async (req, res, next) => {
  try {
    const { paymentId, PayerID } = req.query;
    if (!paymentId || !PayerID) {
      const err = new Error('Missing paymentId or PayerID');
      err.status = 400;
      throw err;
    }

    const donation = await donationRepository.findByPaypalPaymentId(paymentId);
    if (!donation) {
      const err = new Error('Donation not found');
      err.status = 404;
      throw err;
    }

    const execute_payment_json = {
      payer_id: PayerID,
      transactions: [
        {
          amount: {
            currency: donation.currency || 'USD',
            total: donation.amount.toFixed(2),
          },
        },
      ],
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
        console.error('PayPal Execute Error:', error);
        const err = new Error('Failed to execute PayPal payment');
        err.status = 500;
        return next(err);
      }

      // Update donation status
      await donationRepository.update(donation.id, { status: 'completed' });

      // Update charity need current amount
      const charityNeed = await charityNeedRepository.findById(donation.need_id);
      const newCurrentAmount = (parseFloat(charityNeed.current_amount) + parseFloat(donation.amount)).toFixed(2);
      await charityNeedRepository.update(donation.need_id, { current_amount: newCurrentAmount });

      res.redirect(`${process.env.FRONTEND_URL}/donation/success`);
    });
  } catch (err) {
    next(err);
  }
};

const handlePaymentCancel = async (req, res, next) => {
  try {
    const { paymentId } = req.query;
    if (!paymentId) {
      const err = new Error('Missing paymentId');
      err.status = 400;
      throw err;
    }

    const donation = await donationRepository.findByPaypalPaymentId(paymentId);
    if (!donation) {
      const err = new Error('Donation not found');
      err.status = 404;
      throw err;
    }

    // Update donation status to cancelled
    await donationRepository.update(donation.id, { status: 'cancelled' });

    res.redirect(`${process.env.FRONTEND_URL}/donation/cancel`);
  } catch (err) {
    next(err);
  }
};

// Export all controller functions
module.exports = {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonationStatus,
  handlePaymentSuccess,
  handlePaymentCancel
};