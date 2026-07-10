const moment = require('moment');

/**
 * Định dạng thời gian
 */
const formatTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  return moment(date).format(format);
};

/**
 * Đếm thời gian đã trôi qua
 */
const timeAgo = (date) => {
  return moment(date).fromNow();
};

/**
 * Tạo slug từ chuỗi
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Lấy random ID
 */
const generateRandomId = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Lấy tên file từ URL
 */
const getFileNameFromUrl = (url) => {
  return url.split('/').pop();
};

/**
 * Loại bỏ ký tự đặc biệt
 */
const sanitizeString = (str) => {
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
};

/**
 * Kiểm tra object rỗng
 */
const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Chuyển đổi sang tiền tệ
 */
const formatCurrency = (amount, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

module.exports = {
  formatTime,
  timeAgo,
  generateSlug,
  generateRandomId,
  getFileNameFromUrl,
  sanitizeString,
  isEmptyObject,
  formatCurrency,
};