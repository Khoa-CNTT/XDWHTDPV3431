import api from './api';

export const donationService = {
  async createDonation(donationData) {
    const response = await api.post('/donations', donationData);
    return response.data;
  },

  async updateDonationStatus(id, status) {
    const response = await api.patch(`/donations/${id}/status`, { status });
    return response.data;
  },

  async getDonationById(id) {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },

  async getAllDonations(params) {
    const response = await api.get('/donations', { params });
    return response.data;
  },

  async getUserDonations(params) {
    const response = await api.get('/donations/user/me', { params });
    return response.data;
  },

  async getNeedDonations(needId, params) {
    const response = await api.get(`/donations/need/${needId}`, { params });
    return response.data;
  },

  handlePaymentSuccess: async (paymentId, PayerID) => {
    const response = await api.get('/donation/success', {
      params: { paymentId, PayerID }
    });
    return response.data;
  },

  handlePaymentCancel: async (paymentId) => {
    const response = await api.get('/donation/cancel', {
      params: { paymentId }
    });
    return response.data;
  }
}; 