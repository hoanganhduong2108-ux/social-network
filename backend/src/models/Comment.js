const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Nội dung bình luận là bắt buộc'],
      trim: true,
      maxlength: [5000, 'Bình luận không được vượt quá 5000 ký tự'],
    },
    media: [
      {
        type: {
          type: String,
          enum: ['image', 'video', 'file'],
        },
        url: {
          type: String,
        },
        publicId: {
          type: String,
        },
      },
    ],
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    stats: {
      likes: { type: Number, default: 0 },
      replies: { type: Number, default: 0 },
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Phương thức cập nhật thống kê
commentSchema.methods.updateStats = async function () {
  this.stats.likes = this.likes.length;
  this.stats.replies = this.replies.length;
  await this.save();
};

module.exports = mongoose.model('Comment', commentSchema);