// ============================================
// FILE: backend/src/models/Audio.js
// MÔ TẢ: Model lưu âm thanh
// ============================================

const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Tên âm thanh không được vượt quá 100 ký tự'],
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['music', 'sound_effect', 'voice', 'custom'],
      default: 'custom',
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
    },
    settings: {
      volume: {
        type: Number,
        default: 1.0,
        min: 0,
        max: 2.0,
      },
      muted: {
        type: Boolean,
        default: false,
      },
      loop: {
        type: Boolean,
        default: false,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

audioSchema.index({ user: 1, createdAt: -1 });
audioSchema.index({ postId: 1 });
audioSchema.index({ storyId: 1 });

module.exports = mongoose.model('Audio', audioSchema);