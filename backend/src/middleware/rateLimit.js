// ============================================
// FILE: backend/src/middleware/rateLimit.js
// MÔ TẢ: Cấu hình rate limit - TĂNG GIỚI HẠN
// ============================================

const rateLimit = require('express-rate-limit');

// ============================================
// Rate limiter chung - TĂNG LÊN 1000
// ============================================
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // Tăng từ 100 lên 1000
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// Rate limiter cho auth - TĂNG LÊN 100
// ============================================
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 100, // Tăng từ 5 lên 100
  message: {
    success: false,
    message: 'Quá nhiều lần đăng nhập/đăng ký, vui lòng thử lại sau 1 phút',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// Rate limiter cho API - KHÔNG GIỚI HẠN (development)
// ============================================
const noLimit = (req, res, next) => {
  next();
};

// Chọn sử dụng rate limit hay không dựa trên môi trường
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  rateLimiter: isDevelopment ? noLimit : rateLimiter,
  authLimiter: isDevelopment ? noLimit : authLimiter,
};