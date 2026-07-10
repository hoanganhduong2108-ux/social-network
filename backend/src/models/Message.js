const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Cuộc trò chuyện - lưu dạng string "userId1_userId2" (đã sắp xếp)
    conversationId: {
      type: String,  // SỬA: dùng String thay vì ObjectId vì service dùng format "id1_id2"
      required: true,
      index: true,
    },
    
    // Người gửi
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Nội dung
    content: {
      type: String,
      trim: true,
    },
    
    // Loại tin nhắn
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'sticker', 'gif', 'location', 'reaction'],
      default: 'text',
    },
    
    // Phương tiện
    media: {
      url: String,
      publicId: String,
      metadata: {
        width: Number,
        height: Number,
        duration: Number,
        size: Number,
      },
      thumbnail: String,
    },
    
    // Sticker và GIF
    sticker: {
      id: String,
      url: String,
      name: String,
    },
    
    // Vị trí
    location: {
      name: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      address: String,
    },
    
    // Phản ứng
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reaction: {
          type: String,
          enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
          default: 'like',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Đã xem
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Đã gửi
    deliveredTo: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Tin nhắn phản hồi
    replyTo: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    
    // Tin nhắn được chuyển tiếp
    forwardedFrom: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: Date,
    },
    
    // Tin nhắn biến mất
    disappearing: {
      enabled: {
        type: Boolean,
        default: false,
      },
      timer: {
        type: Number,
        enum: [5, 10, 30, 60, 300, 3600, 86400], // seconds
      },
      viewedAt: Date,
      deletedAt: Date,
    },
    
    // Trạng thái
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo index kết hợp để query nhanh
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Phương thức đánh dấu đã đọc
messageSchema.methods.markAsRead = async function (userId) {
  if (!this.readBy.some(r => r.user.toString() === userId.toString())) {
    this.readBy.push({ user: userId });
    await this.save();
  }
};

// Phương thức đánh dấu đã gửi
messageSchema.methods.markAsDelivered = async function (userId) {
  if (!this.deliveredTo.some(d => d.user.toString() === userId.toString())) {
    this.deliveredTo.push({ user: userId });
    await this.save();
  }
};

module.exports = mongoose.model('Message', messageSchema);