const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    username: {
      type: String,
      required: [true, 'Tên đăng nhập là bắt buộc'],
      unique: true,
      trim: true,
      minlength: [3, 'Tên đăng nhập phải có ít nhất 3 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập email hợp lệ',
      ],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false,
    },
    
    // Thông tin cá nhân
    fullName: {
      type: String,
      required: [true, 'Họ và tên là bắt buộc'],
    },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?background=random&bold=true',
    },
    phone: {
      type: String,
    },
    
    // Vai trò
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator', 'support'],
      default: 'admin',
    },
    
    // Quyền
    permissions: {
      manageUsers: { type: Boolean, default: false },
      managePosts: { type: Boolean, default: false },
      manageGroups: { type: Boolean, default: false },
      managePages: { type: Boolean, default: false },
      manageEvents: { type: Boolean, default: false },
      managePayments: { type: Boolean, default: false },
      manageSettings: { type: Boolean, default: false },
      viewReports: { type: Boolean, default: false },
      manageReports: { type: Boolean, default: false },
      manageAdmins: { type: Boolean, default: false },
      manageContent: { type: Boolean, default: false },
      viewAnalytics: { type: Boolean, default: false },
    },
    
    // Hoạt động
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    ipAddresses: [String],
    
    // Trạng thái
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    
    // Nhật ký hoạt động
    activityLog: [
      {
        action: { type: String, required: true },
        details: { type: mongoose.Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password trước khi lưu
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Phương thức so sánh password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Phương thức kiểm tra quyền
adminSchema.methods.hasPermission = function (permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions[permission] || false;
};

module.exports = mongoose.model('Admin', adminSchema);
