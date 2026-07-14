// ============================================
// FILE: backend/src/models/Post.js
// MÔ TẢ: Model bài viết - THÊM groupId
// ============================================

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: [50000, 'Nội dung không được vượt quá 50.000 ký tự'],
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
        alt: {
          type: String,
          maxlength: [500, 'Mô tả ảnh không được vượt quá 500 ký tự'],
        },
      },
    ],
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
    // ============================================
    // NHÓM CHỨA BÀI VIẾT (NẾU CÓ)
    // ============================================
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['status', 'image', 'video', 'share', 'poll', 'event', 'life-event', 'audio'],
      default: 'status',
    },
    feeling: {
      type: String,
      enum: [
        'happy', 'sad', 'angry', 'love', 'excited', 'grateful', 'tired', 'blessed',
        'thoughtful', 'inspired', 'motivated', 'amused', 'curious', 'hopeful',
        'lonely', 'stressed', 'anxious', 'calm', 'peaceful', 'confident',
        'determined', 'nostalgic', 'proud', 'content', 'energetic'
      ],
    },
    activity: {
      type: String,
      enum: [
        'eating', 'drinking', 'cooking', 'working', 'studying', 'reading',
        'writing', 'exercising', 'traveling', 'shopping', 'watching', 'listening',
        'playing', 'hiking', 'swimming', 'running', 'walking', 'sleeping',
        'meditating', 'dancing', 'singing', 'painting', 'photography', 'gaming',
        'coding', 'designing', 'teaching', 'learning', 'volunteering', 'celebrating'
      ],
    },
    with: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    location: {
      name: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    lifeEvent: {
      type: {
        type: String,
        enum: [
          'birthday', 'graduation', 'new-job', 'engagement', 'marriage',
          'new-baby', 'new-home', 'new-pet', 'anniversary', 'promotion',
          'retirement', 'travel', 'achievement', 'milestone'
        ],
      },
      year: Number,
      description: String,
      with: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    share: {
      originalPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
      originalAuthor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      customMessage: {
        type: String,
        maxlength: [2000, 'Tin nhắn chia sẻ không được vượt quá 2000 ký tự'],
      },
    },
    privacy: {
      type: String,
      enum: ['public', 'friends', 'friends-of-friends', 'only-me', 'custom'],
      default: 'public',
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
    likes: [
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
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    shares: [
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
    views: {
      type: Number,
      default: 0,
    },
    stats: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      reactions: {
        like: { type: Number, default: 0 },
        love: { type: Number, default: 0 },
        haha: { type: Number, default: 0 },
        wow: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 },
      },
    },
    hashtags: [String],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    commentSettings: {
      allowComments: {
        type: Boolean,
        default: true,
      },
      autoModeration: {
        type: Boolean,
        default: false,
      },
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: {
          type: String,
          enum: [
            'spam', 'violence', 'hate-speech', 'sexual-content', 'harassment',
            'fake-news', 'self-harm', 'graphic-content', 'scam', 'other'
          ],
        },
        description: {
          type: String,
          maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự'],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
  },
  {
    timestamps: true,
  }
);

postSchema.index({ content: 'text', hashtags: 'text' });
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ groupId: 1, createdAt: -1 });

postSchema.methods.updateStats = async function () {
  this.stats.likes = this.likes.length;
  this.stats.comments = this.comments.length;
  this.stats.shares = this.shares.length;
  this.stats.views = this.views;
  this.stats.reactions.like = this.likes.filter(l => l.reaction === 'like').length;
  this.stats.reactions.love = this.likes.filter(l => l.reaction === 'love').length;
  this.stats.reactions.haha = this.likes.filter(l => l.reaction === 'haha').length;
  this.stats.reactions.wow = this.likes.filter(l => l.reaction === 'wow').length;
  this.stats.reactions.sad = this.likes.filter(l => l.reaction === 'sad').length;
  this.stats.reactions.angry = this.likes.filter(l => l.reaction === 'angry').length;
  await this.save();
};

postSchema.methods.incrementViews = async function () {
  this.views += 1;
  this.stats.views = this.views;
  await this.save();
};

module.exports = mongoose.model('Post', postSchema);