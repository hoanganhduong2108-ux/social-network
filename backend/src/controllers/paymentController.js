// ============================================
// FILE: backend/src/controllers/paymentController.js
// MÔ TẢ: Controller xử lý thanh toán
// ============================================

const paymentService = require('../services/paymentService');
const { validationResult } = require('express-validator');

class PaymentController {
  /**
   * Tạo thanh toán
   */
  async createPayment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const payment = await paymentService.createPayment(req.user.id, req.body);
      res.status(201).json({ success: true, payment });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xác nhận thanh toán
   */
  async confirmPayment(req, res, next) {
    try {
      const result = await paymentService.confirmPayment(
        req.params.id,
        req.body
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy lịch sử thanh toán
   */
  async getPaymentHistory(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await paymentService.getPaymentHistory(
        req.user.id,
        parseInt(page) || 1,
        parseInt(limit) || 20
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Hủy thanh toán
   */
  async cancelPayment(req, res, next) {
    try {
      const result = await paymentService.cancelPayment(
        req.params.id,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Webhook xử lý callback từ cổng thanh toán
   */
  async webhook(req, res, next) {
    try {
      const result = await paymentService.handleWebhook(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();