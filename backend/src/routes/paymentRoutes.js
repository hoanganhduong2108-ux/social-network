// ============================================
// FILE: backend/src/routes/paymentRoutes.js
// MÔ TẢ: Routes xử lý thanh toán
// ============================================

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation rules
const createPaymentValidation = [
  body('amount')
    .notEmpty()
    .withMessage('Số tiền là bắt buộc')
    .isNumeric()
    .withMessage('Số tiền phải là số')
    .isFloat({ min: 0 })
    .withMessage('Số tiền phải lớn hơn 0'),
  body('method')
    .notEmpty()
    .withMessage('Phương thức thanh toán là bắt buộc'),
];

// Routes
router.post('/', protect, createPaymentValidation, paymentController.createPayment);
router.get('/history', protect, paymentController.getPaymentHistory);
router.post('/:id/confirm', protect, paymentController.confirmPayment);
router.post('/:id/cancel', protect, paymentController.cancelPayment);

// Webhook - không cần xác thực
router.post('/webhook', paymentController.webhook);

module.exports = router;