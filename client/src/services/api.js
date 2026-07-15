// ============================================
// FILE: src/services/api.js
// MÔ TẢ: Cấu hình Axios - SỬA LỖI EXPORT
// ============================================

import axios from 'axios';
import toast from 'react-hot-toast';

// ============================================
// CẤU HÌNH URL
// ============================================
const API_URL = 'http://localhost:5000/api';

// ============================================
// Tạo instance Axios
// ============================================
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000000,
});

// ============================================
// Interceptor - Thêm token
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// Interceptor - Xử lý response
// ============================================
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', error);
    
    if (error.code === 'ERR_NETWORK') {
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend!');
    } else if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
          toast.error('Phiên đăng nhập đã hết hạn');
        }
      }
      
      if (status === 400) {
        toast.error(data?.message || 'Dữ liệu không hợp lệ');
      }
      
      if (status === 403) {
        toast.error('Bạn không có quyền thực hiện hành động này');
      }
      
      if (status === 404) {
        toast.error('Không tìm thấy dữ liệu');
      }
      
      if (status >= 500) {
        toast.error('Lỗi máy chủ, vui lòng thử lại sau');
      }
    } else if (error.request) {
      toast.error('Không thể kết nối đến máy chủ');
    } else {
      toast.error('Đã xảy ra lỗi, vui lòng thử lại');
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
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

// ============================================
// Upload file - SỬA LỖI RESPONSE
// ============================================
export const uploadFile = async (file, onProgress = null) => {
  const formData = new FormData();
  formData.append('media', file);

  try {
    console.log('📤 Uploading file:', file.name, file.type, file.size);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    console.log('📤 Upload response:', response);
    
    // Đảm bảo response có đúng định dạng
    return {
      url: response.url || response.secure_url,
      publicId: response.publicId || response.public_id,
      duration: response.duration || 0,
      size: response.size || file.size,
      type: response.type || (file.type.startsWith('video/') ? 'video' : 'image'),
    };
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

// ============================================
// Upload nhiều file
// ============================================
export const uploadMultipleFiles = async (files, onProgress = null) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('media', file);
  });

  try {
    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response;
  } catch (error) {
    console.error('❌ Upload multiple error:', error);
    throw error;
  }
};

// ============================================
// Upload ảnh
// ============================================
export const uploadImage = async (file, onProgress = null) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Vui lòng chọn file ảnh');
  }
  return uploadFile(file, onProgress);
};

// ============================================
// Upload video
// ============================================
export const uploadVideo = async (file, onProgress = null) => {
  if (!file.type.startsWith('video/')) {
    throw new Error('Vui lòng chọn file video');
  }
  return uploadFile(file, onProgress);
};

// ============================================
// Upload âm thanh
// ============================================
export const uploadAudio = async (file, onProgress = null) => {
  if (!file.type.startsWith('audio/')) {
    throw new Error('Vui lòng chọn file âm thanh');
  }
  return uploadFile(file, onProgress);
};

// ============================================
// Xóa file
// ============================================
export const deleteFile = async (publicId) => {
  try {
    const response = await api.delete(`/upload/${publicId}`);
    return response;
  } catch (error) {
    console.error('❌ Delete file error:', error);
    throw error;
  }
};

// ============================================
// Default export
// ============================================
export default api;