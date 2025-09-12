import api from './api';

export const videoService = {
  // Get all videos with pagination and filters
  getAllVideos: async (params = {}) => {
    const response = await api.get('/videos', { params });
    return response.data;
  },

  // Get video by ID
  getVideoById: async (videoId) => {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  },

  // Upload video
  uploadVideo: async (videoData) => {
    const formData = new FormData();
    formData.append('title', videoData.title);
    formData.append('description', videoData.description);
    formData.append('video', videoData.video);

    const response = await api.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update video
  updateVideo: async (videoId, videoData) => {
    const formData = new FormData();
    formData.append('title', videoData.title);
    formData.append('description', videoData.description);
    
    if (videoData.thumbnail) {
      formData.append('thumbnail', videoData.thumbnail);
    }

    const response = await api.patch(`/videos/${videoId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete video
  deleteVideo: async (videoId) => {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
  }
};
