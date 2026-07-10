// ============================================
// FILE: src/services/auth.js
// MÔ TẢ: Auth API service
// ============================================

import { api } from './api';

export const authAPI = {
  register: async (userData) => {
    console.log('📝 Calling API: POST /auth/register');
    return await api.post('/auth/register', userData);
  },

  login: async (emailOrUsername, password) => {
    console.log('🔐 Calling API: POST /auth/login');
    return await api.post('/auth/login', { emailOrUsername, password });
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },

  getCurrentUser: async () => {
    return await api.get('/users/me');
  },

  changePassword: async (currentPassword, newPassword) => {
    return await api.post('/auth/change-password', { currentPassword, newPassword });
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    return await api.post('/auth/reset-password', { token, newPassword });
  },
};

export default authAPI;