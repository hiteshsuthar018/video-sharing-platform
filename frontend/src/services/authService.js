import api from './api';

export const authService = {
  // Register user
  register: async (userData) => {
    const formData = new FormData();
    formData.append('fullName', userData.fullName);
    formData.append('email', userData.email);
    formData.append('username', userData.username);
    formData.append('password', userData.password);
    
    if (userData.avatar) {
      formData.append('avatar', userData.avatar);
    }
    if (userData.coverImage) {
      formData.append('coverImage', userData.coverImage);
    }

    const response = await api.post('/users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Store tokens and user data
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/users/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/users/current-user');
    return response.data;
  },

  // Update account details
  updateAccount: async (userData) => {
    const response = await api.patch('/users/update-account', userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  },

  // Update avatar
  updateAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await api.patch('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update cover image
  updateCoverImage: async (coverImageFile) => {
    const formData = new FormData();
    formData.append('coverImage', coverImageFile);

    const response = await api.patch('/users/cover-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user channel profile
  getChannelProfile: async (username) => {
    const response = await api.get(`/users/c/${username}`);
    return response.data;
  },

  // Get watch history
  getWatchHistory: async () => {
    const response = await api.get('/users/history');
    return response.data;
  }
};
