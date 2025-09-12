import api from './api';

export const socialService = {
  // Like/Unlike video
  toggleVideoLike: async (videoId) => {
    const response = await api.patch(`/likes/v/${videoId}`);
    return response.data;
  },

  // Like/Unlike comment
  toggleCommentLike: async (commentId) => {
    const response = await api.patch(`/likes/c/${commentId}`);
    return response.data;
  },

  // Like/Unlike tweet
  toggleTweetLike: async (tweetId) => {
    const response = await api.patch(`/likes/t/${tweetId}`);
    return response.data;
  },

  // Get liked videos
  getLikedVideos: async () => {
    const response = await api.get('/likes');
    return response.data;
  },

  // Subscribe/Unsubscribe to channel
  toggleSubscription: async (channelId) => {
    const response = await api.patch(`/subscriptions/${channelId}`);
    return response.data;
  },

  // Get channel subscribers
  getChannelSubscribers: async (channelId) => {
    const response = await api.get(`/subscriptions/${channelId}`);
    return response.data;
  },

  // Get subscribed channels
  getSubscribedChannels: async (subscriberId) => {
    const response = await api.get(`/subscriptions/sub_c/${subscriberId}`);
    return response.data;
  },

  // Add comment
  addComment: async (videoId, content) => {
    const response = await api.post(`/comments/${videoId}`, { content });
    return response.data;
  },

  // Get video comments
  getVideoComments: async (videoId, params = {}) => {
    const response = await api.get(`/comments/${videoId}`, { params });
    return response.data;
  },

  // Update comment
  updateComment: async (commentId, content) => {
    const response = await api.patch(`/comments/c/${commentId}`, { content });
    return response.data;
  },

  // Delete comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/c/${commentId}`);
    return response.data;
  }
};
