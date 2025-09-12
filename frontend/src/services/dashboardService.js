import api from './api';

export const dashboardService = {
  // Get channel stats
  getChannelStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get channel videos
  getChannelVideos: async (params = {}) => {
    const response = await api.get('/dashboard/videos', { params });
    return response.data;
  }
};
