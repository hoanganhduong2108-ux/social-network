const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Người nhận
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Người gửi
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Loại thông báo
    type: {
      type: String,
      enum: [
        'like', 'comment', 'share', 'friend_request', 'friend_accept',
        'message', 'group_invite', 'group_join', 'group_post',
        'page_like', 'page_post', 'event_invite', 'event_reminder',
        'mention', 'tag', 'announcement', 'system', 'report_handled',
        'post_approved', 'post_rejected', 'milestone', 'birthday',
        'recommendation', 'promotion', 'achievement'
      ],
      required: true,
    },
    
    // Đối tượng liên quan
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    relatedType: {
      type: String,
      enum: ['post', 'comment', 'message', 'user', 'group', 'page', 'event'],
    },
    
    // Nội dung
    content: {
      type: String,
      required: true,
    },
    contentShort: {
      type: String,
      maxlength: [255, 'Nội dung ngắn không được vượt quá 255 ký tự'],
    },
    
    // URL và dữ liệu bổ sung
    url: {
      type: String,
    },
    image: {
      type: String,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    
    // Trạng thái
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
    viewedAt: {
      type: Date,
    },
    
    // Ưu tiên
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    
    // Hết hạn
    expiresAt: {
      type: Date,
    },
    
    // Thông báo đã gửi
    isSent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
    
    // Xóa thông báo
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
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Phương thức đánh dấu đã đọc
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

// Phương thức đánh dấu đã xem
notificationSchema.methods.markAsViewed = async function () {
  this.isViewed = true;
  this.viewedAt = new Date();
  await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);