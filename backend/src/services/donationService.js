const donationRepository = require('../repositories/donationRepository');
const { Contribution } = require('../models');

class DonationService {
  async createDonation(donationData) {
    // Validate donation data
    if (!donationData.amount || donationData.amount <= 0) {
      const err = new Error('Invalid donation amount');
      err.status = 400;
      throw err;
    }

    if (!donationData.need_id) {
      const err = new Error('Charity need ID is required');
      err.status = 400;
      throw err;
    }

    // Set default status
    donationData.status = 'pending';

    return await donationRepository.create(donationData);
  }

  async updateDonationStatus(id, status) {
    const validStatuses = ['pending', 'completed', 'cancelled', 'failed'];
    if (!validStatuses.includes(status)) {
      const err = new Error('Invalid status');
      err.status = 400;
      throw err;
    }

    return await donationRepository.update(id, { status });
  }

  async getDonationById(id) {
    const donation = await donationRepository.getDonationById(id);
    if (!donation) {
      const err = new Error('Donation not found');
      err.status = 404;
      throw err;
    }
    return donation;
  }

  async getAllDonations(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const [donations, total] = await Promise.all([
      donationRepository.getAll({ limit, offset, ...filters }),
      donationRepository.count(filters)
    ]);

    return {
      donations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getUserDonations(userId, pagination = {}) {
    return this.getAllDonations({ user_id: userId }, pagination);
  }

  async getNeedDonations(needId, pagination = {}) {
    return this.getAllDonations({ need_id: needId }, pagination);
  }
}

module.exports = new DonationService(); 