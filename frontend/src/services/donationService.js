import api from './api';

export const donationService = {
  getAllDonations: async (params) => {
    const response = await api.get('/donation', { params });
    return response.data;
  },

  getDonationById: async (id) => {
    const response = await api.get(`/donation/${id}`);
    return response.data;
  },

  createDonation: async (donationData) => {
    const response = await api.post('/donation/donate', donationData);
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