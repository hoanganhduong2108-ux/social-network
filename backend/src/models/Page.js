const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    name: {
      type: String,
      required: [true, 'Tên trang là bắt buộc'],
      trim: true,
      maxlength: [100, 'Tên trang không được vượt quá 100 ký tự'],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Mô tả không được vượt quá 2000 ký tự'],
    },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?background=random&bold=true&size=128',
    },
    coverPhoto: {
      type: String,
      default: '',
    },
    
    // Danh mục
    category: {
      type: String,
      enum: [
        'business', 'brand', 'entertainment', 'media', 'nonprofit',
        'personal', 'public-figure', 'community', 'organization', 'education',
        'sports', 'music', 'arts', 'food', 'travel', 'technology',
        'fashion', 'health', 'fitness', 'politics', 'religion',
        'news', 'humor', 'gaming', 'books', 'movies', 'photography'
      ],
      required: true,
    },
    subcategory: {
      type: String,
    },
    
    // Thông tin liên hệ
    contact: {
      email: {
        type: String,
        lowercase: true,
      },
      phone: {
        type: String,
      },
      website: {
        type: String,
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
      socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        youtube: String,
        linkedin: String,
        tiktok: String,
        snapchat: String,
        pinterest: String,
        reddit: String,
      },
    },
    
    // Giờ hoạt động
    hours: {
      monday: { open: String, close: String, closed: Boolean },
      tuesday: { open: String, close: String, closed: Boolean },
      wednesday: { open: String, close: String, closed: Boolean },
      thursday: { open: String, close: String, closed: Boolean },
      friday: { open: String, close: String, closed: Boolean },
      saturday: { open: String, close: String, closed: Boolean },
      sunday: { open: String, close: String, closed: Boolean },
    },
    
    // Quản lý
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    editors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    
    // Người theo dõi
    followers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        followedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Bài viết đã ghim
    pinnedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    
    // Sự kiện
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    
    // Sản phẩm
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    
    // Đánh giá
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        content: {
          type: String,
          maxlength: [1000, 'Đánh giá không được vượt quá 1000 ký tự'],
        },
        images: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
        },
        isApproved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    
    // Thống kê
    stats: {
      followers: { type: Number, default: 0 },
      posts: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      reviews: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
    
    // Cài đặt
    settings: {
      allowComments: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
      allowMessaging: {
        type: Boolean,
        default: true,
      },
      autoReply: {
        enabled: Boolean,
        message: String,
      },
      showReviews: {
        type: Boolean,
        default: true,
      },
    },
    
    // Trạng thái
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
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
    
    // Lịch sử
    activityLog: [
      {
        action: { type: String, required: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        details: { type: mongoose.Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Tạo index
pageSchema.index({ name: 'text', description: 'text' });
pageSchema.index({ username: 1 });

// Phương thức thêm người theo dõi
pageSchema.methods.addFollower = async function (userId) {
  if (!this.followers.some(f => f.user.toString() === userId.toString())) {
    this.followers.push({ user: userId });
    this.stats.followers = this.followers.length;
    await this.save();
    return true;
  }
  return false;
};

// Phương thức xóa người theo dõi
pageSchema.methods.removeFollower = async function (userId) {
  const index = this.followers.findIndex(f => f.user.toString() === userId.toString());
  if (index > -1) {
    this.followers.splice(index, 1);
    this.stats.followers = this.followers.length;
    await this.save();
    return true;
  }
  return false;
};

module.exports = mongoose.model('Page', pageSchema);