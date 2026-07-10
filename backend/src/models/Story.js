// ============================================
// FILE: backend/src/models/Story.js
// MÔ TẢ: Model Story - THÊM DISPLAY DURATION
// ============================================

const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: [500, 'Nội dung không được vượt quá 500 ký tự'],
    },
    media: [
      {
        type: {
          type: String,
          enum: ['image', 'video'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
        },
        metadata: {
          width: Number,
          height: Number,
          duration: Number,
          size: Number,
        },
        thumbnail: {
          type: String,
        },
      },
    ],
    // ============================================
    // THỜI GIAN HIỂN THỊ - THÊM MỚI
    // ============================================
    displayDuration: {
      type: Number,
      default: 5,
      min: 1,
      max: 60,
    },
    audio: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
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
        startTime: {
          type: Number,
          default: 0,
        },
        endTime: {
          type: Number,
          default: 0,
        },
      },
      duration: {
        type: Number,
        default: 0,
      },
      name: {
        type: String,
        default: 'Nhạc nền',
      },
    },
    viewers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        type: {
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
    stats: {
      views: { type: Number, default: 0 },
      reactions: { type: Number, default: 0 },
    },
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: {
          type: String,
          maxlength: [500, 'Nội dung phản hồi không được vượt quá 500 ký tự'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    privacy: {
      type: String,
      enum: ['public', 'friends', 'only_me', 'custom'],
      default: 'friends',
    },
    customPrivacy: {
      include: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      exclude: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    isArchived: {
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
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    backgroundColor: {
      type: String,
      default: '#0866FF',
    },
    font: {
      type: String,
      default: 'Arial',
    },
    location: {
      name: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Story', storySchema);