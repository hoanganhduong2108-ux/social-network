// ============================================
// FILE: client/src/services/api.js
// MÔ TẢ: Cấu hình Axios và các hàm gọi API
// ============================================

import axios from 'axios';
import toast from 'react-hot-toast';

// ============================================
// Cấu hình URL API
// ============================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============================================
// Tạo instance Axios
// ============================================
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 giây timeout
});

// ============================================
// Interceptor - Thêm token vào request
// ============================================
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

// ============================================
// Interceptor - Xử lý response
// ============================================
api.interceptors.response.use(
  (response) => {
    // Trả về dữ liệu đã được giải mã
    return response.data;
  },
  (error) => {
    // Xử lý lỗi
    if (error.response) {
      const { status, data } = error.response;
      
      // Token hết hạn hoặc không hợp lệ
      if (status === 401) {
        localStorage.removeItem('token');
        // Chỉ chuyển hướng nếu không phải đang ở trang login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
          toast.error('Phiên đăng nhập đã hết hạn');
        }
      }
      
      // Lỗi server
      if (status >= 500) {
        toast.error('Lỗi máy chủ, vui lòng thử lại sau');
      }
      
      // Lỗi validation
      if (status === 400) {
        const message = data?.message || 'Dữ liệu không hợp lệ';
        toast.error(message);
      }
      
      // Lỗi không có quyền
      if (status === 403) {
        toast.error('Bạn không có quyền thực hiện hành động này');
      }
      
      // Lỗi không tìm thấy
      if (status === 404) {
        toast.error('Không tìm thấy dữ liệu');
      }
      
    } else if (error.request) {
      // Lỗi không kết nối được server
      toast.error('Không thể kết nối đến máy chủ');
    } else {
      // Lỗi khác
      toast.error('Đã xảy ra lỗi, vui lòng thử lại');
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// Hàm upload file
// ============================================
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

// ============================================
// Hàm upload nhiều file
// ============================================
export const uploadMultipleFiles = async (files, folder = 'general') => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('folder', folder);

  const response = await api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// ============================================
// Hàm helper cho pagination
// ============================================
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  return query.toString();
};

export default api;