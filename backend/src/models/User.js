// ============================================
// FILE: backend/src/models/User.js
// MÔ TẢ: Model người dùng - ĐÃ SỬA LỖI HASH PASSWORD
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ============================================
    // Thông tin cơ bản
    // ============================================
    username: {
      type: String,
      required: [true, 'Tên người dùng là bắt buộc'],
      unique: true,
      trim: true,
      minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự'],
      maxlength: [30, 'Tên người dùng không được vượt quá 30 ký tự'],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập email hợp lệ',
      ],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false, // Không trả về password mặc định
    },

    // ============================================
    // Thông tin cá nhân
    // ============================================
    fullName: {
      type: String,
      required: [true, 'Họ và tên là bắt buộc'],
      trim: true,
      maxlength: [100, 'Họ và tên không được vượt quá 100 ký tự'],
    },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=User',
    },
    coverPhoto: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Tiểu sử không được vượt quá 500 ký tự'],
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say',
    },
    birthday: {
      type: Date,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'],
    },

    // ============================================
    // Địa chỉ
    // ============================================
    location: {
      city: { type: String, default: '' },
      country: { type: String, default: 'Việt Nam' },
      address: { type: String, default: '' },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    // ============================================
    // Công việc và học vấn
    // ============================================
    education: [
      {
        school: { type: String, required: true },
        degree: { type: String },
        fieldOfStudy: { type: String },
        startYear: { type: Number },
        endYear: { type: Number },
        current: { type: Boolean, default: false },
      },
    ],
    work: [
      {
        company: { type: String, required: true },
        position: { type: String },
        startYear: { type: Number },
        endYear: { type: Number },
        current: { type: Boolean, default: false },
      },
    ],

    // ============================================
    // Mạng xã hội
    // ============================================
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
      website: { type: String, default: '' },
    },

    // ============================================
    // Quan hệ bạn bè
    // ============================================
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequests: {
      sent: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      received: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ============================================
    // Cài đặt và quyền riêng tư
    // ============================================
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public',
      },
      emailVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'private',
      },
      birthdayVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends',
      },
      phoneVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'private',
      },
      locationVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends',
      },
      allowTagging: {
        type: Boolean,
        default: true,
      },
      allowMessages: {
        type: String,
        enum: ['everyone', 'friends', 'mutual', 'nobody'],
        default: 'everyone',
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
    },

    // ============================================
    // Cài đặt thông báo
    // ============================================
    notificationSettings: {
      comments: { type: Boolean, default: true },
      likes: { type: Boolean, default: true },
      shares: { type: Boolean, default: true },
      friendRequests: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      groupInvites: { type: Boolean, default: true },
      pageUpdates: { type: Boolean, default: true },
      eventUpdates: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },

    // ============================================
    // Trạng thái
    // ============================================
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },

    // ============================================
    // Thống kê
    // ============================================
    stats: {
      posts: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },

    // ============================================
    // Thiết bị đăng nhập
    // ============================================
    devices: [
      {
        id: { type: String, required: true },
        device: { type: String, required: true },
        location: { type: String, default: 'Unknown' },
        date: { type: Date, default: Date.now },
      },
    ],

    // ============================================
    // Push tokens
    // ============================================
    pushTokens: [
      {
        token: { type: String, required: true },
        platform: { type: String, enum: ['web', 'ios', 'android'] },
        deviceId: { type: String },
        lastUsed: { type: Date, default: Date.now },
      },
    ],

    // ============================================
    // Lưu trữ hoạt động
    // ============================================
    activityLog: [
      {
        action: { type: String, required: true },
        details: { type: mongoose.Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // ============================================
    // Khóa trang cá nhân
    // ============================================
    profileLocked: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // Nhận diện khuôn mặt
    // ============================================
    faceRecognition: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // Bài viết đã ghim
    // ============================================
    pinnedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],

    // ============================================
    // Các bài viết đã ẩn
    // ============================================
    hides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],

    // ============================================
    // Tạm ngưng theo dõi
    // ============================================
    snoozes: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        until: { type: Date, required: true },
      },
    ],

    // ============================================
    // Yêu thích
    // ============================================
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ============================================
    // Xóa tài khoản (mềm)
    // ============================================
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

// Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// So sánh password
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    return false;
  }
};

// Kiểm tra bạn bè
userSchema.methods.isFriend = function (userId) {
  return this.friends.some(id => id.toString() === userId.toString());
};

// Kiểm tra đã gửi lời mời
userSchema.methods.hasSentFriendRequest = function (userId) {
  return this.friendRequests.sent.some(id => id.toString() === userId.toString());
};

// Kiểm tra đã nhận lời mời
userSchema.methods.hasReceivedFriendRequest = function (userId) {
  return this.friendRequests.received.some(id => id.toString() === userId.toString());
};

// ============================================
// PHƯƠNG THỨC: Cập nhật lastSeen
// ============================================
userSchema.methods.updateLastSeen = async function () {
  this.lastSeen = new Date();
  this.isOnline = false;
  await this.save();
  return this;
};

// ============================================
// PHƯƠNG THỨC: Cập nhật online status
// ============================================
userSchema.methods.setOnlineStatus = async function (status) {
  this.isOnline = status;
  if (status) {
    this.lastSeen = new Date();
  }
  await this.save();
  return this;
};

// ============================================
// PHƯƠNG THỨC: Thêm hoạt động vào log
// ============================================
userSchema.methods.addActivity = async function (action, details = {}) {
  this.activityLog.push({
    action,
    details,
    timestamp: new Date(),
  });
  // Giới hạn log ở 1000 entries
  if (this.activityLog.length > 1000) {
    this.activityLog = this.activityLog.slice(-1000);
  }
  await this.save();
  return this;
};

// ============================================
// PHƯƠNG THỨC: Kiểm tra tài khoản bị khóa
// ============================================
userSchema.methods.isBannedAccount = function () {
  return this.isBanned;
};

// ============================================
// PHƯƠNG THỨC: Lấy thông tin công khai
// ============================================
userSchema.methods.getPublicInfo = function () {
  return {
    _id: this._id,
    username: this.username,
    fullName: this.fullName,
    avatar: this.avatar,
    bio: this.bio,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
    isVerified: this.isVerified,
    friends: this.friends.length,
    followers: this.followers.length,
    following: this.following.length,
  };
};

// ============================================
// STATIC: Tìm kiếm người dùng
// ============================================
userSchema.statics.searchUsers = function (query, options = {}) {
  const { limit = 20, skip = 0 } = options;
  return this.find({
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { fullName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ],
    isActive: true,
    isBanned: false,
  })
    .select('username fullName avatar bio isOnline lastSeen')
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('User', userSchema);