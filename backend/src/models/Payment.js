// ============================================
// FILE: backend/src/models/Payment.js
// MÔ TẢ: Model lưu thông tin thanh toán
// ============================================

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // Người dùng
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Thông tin thanh toán
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'VND',
      enum: ['VND', 'USD', 'EUR', 'JPY', 'KRW'],
    },

    // Phương thức thanh toán
    method: {
      type: String,
      enum: [
        'card',        // Thẻ tín dụng/ghi nợ
        'bank',        // Chuyển khoản ngân hàng
        'wallet',      // Ví điện tử
        'momo',        // Momo
        'vnpay',       // VNPay
        'paypal',      // PayPal
        'stripe',      // Stripe
        'zalo_pay',    // ZaloPay
        'cod',         // Thanh toán khi nhận hàng
      ],
      required: true,
    },

    // Mã thanh toán
    paymentCode: {
      type: String,
      unique: true,
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Mô tả
    description: {
      type: String,
      maxlength: [500, 'Mô tả không được vượt quá 500 ký tự'],
    },

    // Trạng thái
    status: {
      type: String,
      enum: [
        'pending',      // Chờ xử lý
        'processing',   // Đang xử lý
        'completed',    // Hoàn thành
        'failed',       // Thất bại
        'cancelled',    // Đã hủy
        'refunded',     // Đã hoàn tiền
        'expired',      // Hết hạn
      ],
      default: 'pending',
    },

    // Thời gian
    paidAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    expiredAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 phút
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Thông tin người dùng
    customerInfo: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },

    // Thông tin sản phẩm/dịch vụ
    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        description: String,
      },
    ],

    // Lỗi
    error: {
      code: String,
      message: String,
      details: mongoose.Schema.Types.Mixed,
    },

    // IP và User Agent
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },

    // Xóa
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo index
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ paymentCode: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

// Phương thức đánh dấu đã thanh toán
paymentSchema.methods.markAsCompleted = async function (transactionId) {
  this.status = 'completed';
  this.transactionId = transactionId;
  this.paidAt = new Date();
  await this.save();
};

// Phương thức đánh dấu thất bại
paymentSchema.methods.markAsFailed = async function (error) {
  this.status = 'failed';
  this.error = error;
  await this.save();
};

// Phương thức đánh dấu đã hủy
paymentSchema.methods.markAsCancelled = async function () {
  this.status = 'cancelled';
  await this.save();
};

// Phương thức đánh dấu hoàn tiền
paymentSchema.methods.markAsRefunded = async function () {
  this.status = 'refunded';
  this.refundedAt = new Date();
  await this.save();
};

// Phương thức kiểm tra hết hạn
paymentSchema.methods.isExpired = function () {
  return this.status === 'pending' && this.expiredAt < new Date();
};

module.exports = mongoose.model('Payment', paymentSchema);