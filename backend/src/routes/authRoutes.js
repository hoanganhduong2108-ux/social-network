// ============================================
// FILE: backend/src/routes/authRoutes.js
// MÔ TẢ: Routes xác thực - BỎ RATE LIMIT
// ============================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');

// ============================================
// Validation rules
// ============================================
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Tên người dùng phải có từ 3-30 ký tự'),
  body('email')
    .isEmail()
    .withMessage('Vui lòng nhập email hợp lệ'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('fullName')
    .notEmpty()
    .withMessage('Họ và tên là bắt buộc'),
];

const loginValidation = [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('Vui lòng nhập email hoặc tên người dùng'),
  body('password')
    .notEmpty()
    .withMessage('Vui lòng nhập mật khẩu'),
];

// ============================================
// Routes - BỎ rateLimiter để test dễ dàng
// ============================================
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/logout', protect, authController.logout);
router.post('/change-password', protect, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;