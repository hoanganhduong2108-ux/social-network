// ============================================
// FILE: src/utils/media.js
// MÔ TẢ: Hàm xử lý URL media
// ============================================

const MEDIA_BASE_URL = 'http://localhost:5000';

/**
 * Lấy URL media đúng
 * @param {string} url - URL media
 * @returns {string} URL đầy đủ
 */
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `${MEDIA_BASE_URL}${url}`;
  return `${MEDIA_BASE_URL}${url}`;
};

/**
 * Kiểm tra URL có phải là media không
 */
export const isMediaUrl = (url) => {
  if (!url) return false;
  return url.includes('/uploads/') || url.startsWith('http');
};

/**
 * Lấy tên file từ URL
 */
export const getFileNameFromUrl = (url) => {
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1];
};