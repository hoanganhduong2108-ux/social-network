// ============================================
// FILE: src/utils/helpers.js
// MÔ TẢ: Các hàm helper tiện ích
// ============================================

/**
 * Định dạng thời gian
 */
export const formatTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN');
  } catch {
    return '';
  }
};

/**
 * Đếm thời gian đã trôi qua (ví dụ: "2 giờ trước")
 */
export const timeAgo = (date) => {
  if (!date) return '';

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'vài giây trước';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 30) return `${diffDay} ngày trước`;
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  return `${diffYear} năm trước`;
};

/**
 * Tạo slug từ chuỗi
 */
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Lấy tên file từ URL
 */
export const getFileNameFromUrl = (url) => {
  if (!url) return '';
  return url.split('/').pop();
};

/**
 * Định dạng số (ví dụ: 1,000,000)
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Định dạng tiền tệ
 */
export const formatCurrency = (amount, currency = 'VND') => {
  if (!amount) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Rút gọn văn bản
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Kiểm tra email hợp lệ
 */
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra username hợp lệ
 */
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Kiểm tra password mạnh
 */
export const isStrongPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return passwordRegex.test(password);
};

/**
 * Lấy tham số từ URL
 */
export const getQueryParams = (search) => {
  const params = new URLSearchParams(search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

/**
 * Copy text vào clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy to clipboard error:', error);
    return false;
  }
};

/**
 * Tạo ID ngẫu nhiên
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Lấy màu ngẫu nhiên
 */
export const getRandomColor = () => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
    '#F8C471',
    '#82E0AA',
    '#F1948A',
    '#85929E',
    '#73C6B6',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export default {
  formatTime,
  timeAgo,
  generateSlug,
  getFileNameFromUrl,
  formatNumber,
  formatCurrency,
  truncateText,
  isValidEmail,
  isValidUsername,
  isStrongPassword,
  getQueryParams,
  copyToClipboard,
  generateId,
  getRandomColor,
  debounce,
  throttle,
};