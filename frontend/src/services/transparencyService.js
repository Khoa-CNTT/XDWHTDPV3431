import api from './api';

export const transparencyService = {
  // Get transparency stats
  getStats: async () => {
    const response = await api.get('/admin/transparency/stats');
    return response.data;
  },

  // Get all donations with details
  getAllDonations: async () => {
    const response = await api.get('/admin/transparency/donations');
    return response.data;
  },

  // Get all charity needs with details
  getAllCharityNeeds: async () => {
    const response = await api.get('/admin/transparency/charity-needs');
    return response.data;
  },

  // Get all admin logs
  getLogs: async () => {
    const response = await api.get('/admin/transparency/logs');
    return response.data;
  }
}; 