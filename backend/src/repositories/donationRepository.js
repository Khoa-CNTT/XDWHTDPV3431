const { Contribution, CharityNeed, User } = require('../models');

class DonationRepository {
  async create(donationData) {
    return await Contribution.create(donationData);
  }

  async update(id, updateData) {
    const donation = await Contribution.findByPk(id);
    if (!donation) {
      const err = new Error('Donation not found');
      err.status = 404;
      throw err;
    }
    return await donation.update(updateData);
  }

  async getDonationById(id) {
    return await Contribution.findByPk(id, {
      include: [
        { model: User, as: 'user' },
        { model: CharityNeed, as: 'need' }
      ],
    });
  }

  async getAll({ limit, offset, ...filters }) {
    return await Contribution.findAll({
      where: filters,
      limit,
      offset,
      include: [
        { model: User, as: 'user' },
        { model: CharityNeed, as: 'need' }
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async count(filters) {
    return await Contribution.count({ where: filters });
  }

  async findByPaypalPaymentId(paymentId) {
    return await Contribution.findOne({
      where: { paypal_payment_id: paymentId },
      include: [{ model: CharityNeed, as: 'charity_need' }],
    });
  }
}

module.exports = new DonationRepository();