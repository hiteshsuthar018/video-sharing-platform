import api from './api';

export const tweetService = {
  // Create tweet
  createTweet: async (content) => {
    const response = await api.post('/tweets', { content });
    return response.data;
  },

  // Get user tweets
  getUserTweets: async (userId) => {
    const response = await api.get(`/tweets/user/${userId}`);
    return response.data;
  },

  // Update tweet
  updateTweet: async (tweetId, content) => {
    const response = await api.patch(`/tweets/${tweetId}`, { content });
    return response.data;
  },

  // Delete tweet
  deleteTweet: async (tweetId) => {
    const response = await api.delete(`/tweets/${tweetId}`);
    return response.data;
  }
};
