// ============================================
// FILE: backend/src/services/paymentService.js
// MÔ TẢ: Dịch vụ xử lý thanh toán
// ============================================

const User = require('../models/User');
const Payment = require('../models/Payment');
const axios = require('axios');
const crypto = require('crypto');

class PaymentService {
  /**
   * Tạo thanh toán
   */
  async createPayment(userId, paymentData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      // Tạo mã thanh toán
      const paymentCode = `PAY-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Tạo payment record
      const payment = await Payment.create({
        user: userId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'VND',
        method: paymentData.method || 'card',
        paymentCode,
        description: paymentData.description || 'Thanh toán dịch vụ',
        status: 'pending',
        metadata: paymentData.metadata || {},
      });

      // TODO: Tích hợp với cổng thanh toán thực tế
      // Ví dụ: VNPay, MoMo, Stripe, PayPal
      
      // Tạo URL thanh toán (mock)
      const paymentUrl = `${process.env.CLIENT_URL}/payment/${payment._id}`;

      return {
        payment,
        paymentUrl,
        paymentCode,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xác nhận thanh toán
   */
  async confirmPayment(paymentId, data) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Thanh toán không tồn tại');
      }

      // Xác thực chữ ký từ cổng thanh toán
      const isValid = this.verifySignature(data);
      if (!isValid) {
        throw new Error('Chữ ký không hợp lệ');
      }

      // Cập nhật trạng thái
      payment.status = 'completed';
      payment.paidAt = new Date();
      payment.transactionId = data.transactionId;
      await payment.save();

      // Cập nhật số dư người dùng (nếu có)
      // TODO: Implement balance update

      return { success: true, payment };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy lịch sử thanh toán
   */
  async getPaymentHistory(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const payments = await Payment.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Payment.countDocuments({ user: userId });

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Hủy thanh toán
   */
  async cancelPayment(paymentId, userId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Thanh toán không tồn tại');
      }

      if (payment.user.toString() !== userId) {
        throw new Error('Không có quyền hủy thanh toán này');
      }

      if (payment.status !== 'pending') {
        throw new Error('Không thể hủy thanh toán đã hoàn thành');
      }

      payment.status = 'cancelled';
      await payment.save();

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xử lý webhook từ cổng thanh toán
   */
  async handleWebhook(data) {
    try {
      // Xác thực webhook signature
      const isValid = this.verifyWebhookSignature(data);
      if (!isValid) {
        throw new Error('Webhook signature không hợp lệ');
      }

      // Xử lý theo event type
      const { eventType, paymentId, status } = data;

      switch (eventType) {
        case 'payment.success':
          await this.confirmPayment(paymentId, data);
          break;
        case 'payment.failed':
          await Payment.findByIdAndUpdate(paymentId, { status: 'failed' });
          break;
        default:
          console.log('Unknown webhook event:', eventType);
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xác thực chữ ký
   */
  verifySignature(data) {
    // TODO: Implement actual signature verification
    // Tùy thuộc vào cổng thanh toán sử dụng
    return true;
  }

  /**
   * Xác thực webhook signature
   */
  verifyWebhookSignature(data) {
    // TODO: Implement actual webhook signature verification
    return true;
  }
}

module.exports = new PaymentService();