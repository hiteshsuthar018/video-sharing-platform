import api from './api';

export const playlistService = {
  // Create playlist
  createPlaylist: async (playlistData) => {
    const response = await api.post('/playLists', playlistData);
    return response.data;
  },

  // Get user playlists
  getUserPlaylists: async (userId) => {
    const response = await api.get(`/playLists/user/${userId}`);
    return response.data;
  },

  // Get playlist by ID
  getPlaylistById: async (playlistId) => {
    const response = await api.get(`/playLists/${playlistId}`);
    return response.data;
  },

  // Update playlist
  updatePlaylist: async (playlistId, playlistData) => {
    const response = await api.patch(`/playLists/${playlistId}`, playlistData);
    return response.data;
  },

  // Delete playlist
  deletePlaylist: async (playlistId) => {
    const response = await api.delete(`/playLists/${playlistId}`);
    return response.data;
  },

  // Add video to playlist
  addVideoToPlaylist: async (playlistId, videoId) => {
    const response = await api.patch(`/playLists/a/${playlistId}/${videoId}`);
    return response.data;
  },

  // Remove video from playlist
  removeVideoFromPlaylist: async (playlistId, videoId) => {
    const response = await api.patch(`/playLists/r/${playlistId}/${videoId}`);
    return response.data;
  }
};
