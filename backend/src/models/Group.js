const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    name: {
      type: String,
      required: [true, 'Tên nhóm là bắt buộc'],
      trim: true,
      maxlength: [100, 'Tên nhóm không được vượt quá 100 ký tự'],
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
    
    // Chủ đề và tags
    category: {
      type: String,
      enum: [
        'general', 'sports', 'music', 'art', 'technology', 'education',
        'business', 'health', 'travel', 'food', 'fashion', 'gaming',
        'movies', 'books', 'photography', 'pets', 'fitness', 'spirituality',
        'politics', 'news', 'memes', 'science', 'history', 'nature',
        'career', 'relationships', 'parenting', 'seniors', 'youth',
        'community', 'hobby', 'support'
      ],
      default: 'general',
    },
    tags: [String],
    
    // Quyền riêng tư
    privacy: {
      type: String,
      enum: ['public', 'private', 'secret'],
      default: 'public',
    },
    
    // Địa chỉ
    location: {
      city: String,
      country: String,
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    
    // Thành viên
    admin: {
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
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['member', 'moderator', 'admin'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        lastActive: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Yêu cầu tham gia
    pendingRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
        message: {
          type: String,
          maxlength: [500, 'Tin nhắn yêu cầu không được vượt quá 500 ký tự'],
        },
      },
    ],
    invitedUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Cài đặt
    settings: {
      requireApproval: {
        type: Boolean,
        default: true,
      },
      allowMemberPosts: {
        type: Boolean,
        default: true,
      },
      allowMemberInvites: {
        type: Boolean,
        default: false,
      },
      allowMemberEvents: {
        type: Boolean,
        default: false,
      },
      allowMemberPolls: {
        type: Boolean,
        default: true,
      },
      allowMemberFiles: {
        type: Boolean,
        default: true,
      },
      autoApprovePosts: {
        type: Boolean,
        default: false,
      },
      postModeration: {
        type: Boolean,
        default: true,
      },
      commentModeration: {
        type: Boolean,
        default: false,
      },
      filterKeywords: [String],
    },
    
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
    
    // Thống kê
    stats: {
      members: { type: Number, default: 0 },
      posts: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    
    // Trạng thái
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
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
groupSchema.index({ name: 'text', description: 'text', tags: 'text' });
groupSchema.index({ members: 1 });

// Phương thức thêm thành viên
groupSchema.methods.addMember = async function (userId, role = 'member') {
  if (!this.members.some(m => m.user.toString() === userId.toString())) {
    this.members.push({ user: userId, role });
    this.stats.members = this.members.length;
    await this.save();
    return true;
  }
  return false;
};

// Phương thức xóa thành viên
groupSchema.methods.removeMember = async function (userId) {
  const index = this.members.findIndex(m => m.user.toString() === userId.toString());
  if (index > -1) {
    this.members.splice(index, 1);
    this.stats.members = this.members.length;
    await this.save();
    return true;
  }
  return false;
};

// Phương thức kiểm tra thành viên
groupSchema.methods.isMember = function (userId) {
  return this.members.some(m => m.user.toString() === userId.toString());
};

// Phương thức kiểm tra admin
groupSchema.methods.isAdmin = function (userId) {
  return this.admins.includes(userId) || this.admin.toString() === userId.toString();
};

module.exports = mongoose.model('Group', groupSchema);