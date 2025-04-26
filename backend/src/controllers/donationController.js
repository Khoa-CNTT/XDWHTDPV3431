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
    if (need_id) filters.charity_need_id = need_id;

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
    const { user_id, need_id, amount, currency = 'USD' } = req.body;

    // Check if user exists
    const user = await userRepository.findById(user_id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    // Check if charity need exists
    const charityNeed = await charityNeedRepository.findById(need_id);
    if (!charityNeed) {
      const err = new Error('Charity need not found');
      err.status = 404;
      throw err;
    }

    // Check if user is authorized
    if (req.user && req.user.id !== user_id) {
      const err = new Error('Unauthorized: You can only donate on behalf of yourself');
      err.status = 403;
      throw err;
    }

    // Create donation record
    const donation = await donationRepository.create({
      user_id,
      charity_need_id: need_id,
      amount,
      status: 'pending',
    });

    // Create PayPal payment
    const payment = {
      intent: 'sale',
      payer: { payment_method: 'paypal' },
      redirect_urls: {
        return_url: `${process.env.BACKEND_URL}/api/donation/success`,
        cancel_url: `${process.env.BACKEND_URL}/api/donation/cancel`,
      },
      transactions: [
        {
          amount: {
            total: amount.toFixed(2),
            currency,
          },
          description: `Donation for charity need #${need_id}`,
        },
      ],
    };

    paypal.payment.create(payment, async (error, payment) => {
      if (error) {
        console.error('PayPal Error:', error);
        const err = new Error('Failed to create PayPal payment');
        err.status = 500;
        return next(err);
      }

      // Update donation with PayPal payment ID
      await donationRepository.update(donation.id, { paypal_payment_id: payment.id });

      const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
      res.status(201).json({
        message: 'Donation created, please complete payment',
        donation_id: donation.id,
        approval_url: approvalUrl,
      });
    });
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
      const charityNeed = await charityNeedRepository.findById(donation.charity_need_id);
      const newCurrentAmount = (parseFloat(charityNeed.current_amount) + parseFloat(donation.amount)).toFixed(2);
      await charityNeedRepository.update(donation.charity_need_id, { current_amount: newCurrentAmount });

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
  handlePaymentSuccess,
  handlePaymentCancel
};