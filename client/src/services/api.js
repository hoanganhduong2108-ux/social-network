import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Token expired
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.error('Phiên đăng nhập đã hết hạn');
      }
      
      // Server error
      if (error.response.status >= 500) {
        toast.error('Lỗi máy chủ, vui lòng thử lại sau');
      }
      
      // Validation error
      if (error.response.status === 400) {
        const message = error.response.data?.message || 'Dữ liệu không hợp lệ';
        toast.error(message);
      }
    } else if (error.request) {
      toast.error('Không thể kết nối đến máy chủ');
    } else {
      toast.error('Đã xảy ra lỗi');
    }
    
    return Promise.reject(error);
  }
);

// Helper functions
export const uploadFile = async (file, folder = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};