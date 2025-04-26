import api from './api';

export const charityNeedService = {
  getAllNeeds: async (params) => {
    const response = await api.get('/charity-needs', { params });
    return response.data;
  },

  getNeedById: async (id) => {
    const response = await api.get(`/charity-needs/${id}`);
    return response.data;
  },

  createNeed: async (needData) => {
    const response = await api.post('/charity-needs', needData);
    return response.data;
  },

  updateNeed: async (id, needData) => {
    const response = await api.put(`/charity-needs/${id}`, needData);
    return response.data;
  },

  deleteNeed: async (id) => {
    const response = await api.delete(`/charity-needs/${id}`);
    return response.data;
  }
}; 