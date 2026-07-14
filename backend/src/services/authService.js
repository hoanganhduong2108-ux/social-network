// ============================================
// FILE: backend/src/services/authService.js
// MÔ TẢ: Dịch vụ xác thực - SỬA LỖI LOGIN
// ============================================

const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

class AuthService {
  // ============================================
  // ĐĂNG KÝ
  // ============================================
  async register(userData) {
    try {
      console.log('📝 Register service started...');
      console.log('📝 User data:', {
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
      });

      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      });

      if (existingUser) {
        throw new Error('Tên người dùng hoặc email đã tồn tại');
      }

      const user = await User.create(userData);
      console.log('✅ User created successfully:', user._id);

      const token = generateToken({ id: user._id, role: 'user' });

      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        success: true,
        user: userResponse,
        token,
      };
    } catch (error) {
      console.error('❌ Register service error:', error.message);
      throw error;
    }
  }

  // ============================================
  // ĐĂNG NHẬP - SỬA LỖI
  // ============================================
  async login(emailOrUsername, password) {
    try {
      console.log('🔐 Login service started...');
      console.log('🔐 emailOrUsername:', emailOrUsername);

      const admin = await Admin.findOne({
        $or: [
          { email: { $regex: `^${emailOrUsername}$`, $options: 'i' } },
          { username: { $regex: `^${emailOrUsername}$`, $options: 'i' } },
        ],
      }).select('+password');

      if (admin) {
        if (!admin.isActive || admin.isBanned) {
          throw new Error('Tài khoản quản trị đã bị khóa');
        }

        if (!(await admin.matchPassword(password))) {
          throw new Error('Mật khẩu không chính xác');
        }

        admin.lastLogin = new Date();
        admin.loginCount += 1;
        await admin.save();

        const adminResponse = admin.toObject();
        delete adminResponse.password;
        adminResponse.role = admin.role;

        return {
          success: true,
          user: adminResponse,
          token: generateToken({ id: admin._id, role: admin.role }),
        };
      }

      const user = await User.findOne({
        $or: [
          { email: { $regex: `^${emailOrUsername}$`, $options: 'i' } },
          { username: { $regex: `^${emailOrUsername}$`, $options: 'i' } },
        ],
      }).select('+password');

      if (!user) {
        console.log('❌ User not found:', emailOrUsername);
        throw new Error('Tài khoản không tồn tại');
      }

      console.log('✅ User found:', user.username);

      if (user.isBanned) {
        throw new Error(`Tài khoản đã bị khóa: ${user.banReason || 'Vi phạm điều khoản'}`);
      }

      // Kiểm tra mật khẩu
      const isMatch = await user.matchPassword(password);
      console.log('🔍 Password match result:', isMatch);

      if (!isMatch) {
        console.log('❌ Password incorrect for:', user.username);
        throw new Error('Mật khẩu không chính xác');
      }

      // Cập nhật lastSeen và online status
      user.lastSeen = new Date();
      user.isOnline = true;
      await user.save();

      const token = generateToken({ id: user._id, role: 'user' });
      console.log('✅ Token generated for:', user.username);

      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        success: true,
        user: userResponse,
        token,
      };
    } catch (error) {
      console.error('❌ Login service error:', error.message);
      throw error;
    }
  }

  // ============================================
  // ĐĂNG XUẤT
  // ============================================
  async logout(userId) {
    try {
      await User.findByIdAndUpdate(userId, { isOnline: false });
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  }

  // ============================================
  // ĐỔI MẬT KHẨU
  // ============================================
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        throw new Error('Mật khẩu hiện tại không chính xác');
      }

      user.password = newPassword;
      await user.save();

      return { success: true };
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw error;
    }
  }

  // ============================================
  // QUÊN MẬT KHẨU
  // ============================================
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Email không tồn tại');
      }

      // TODO: Gửi email reset password
      return { success: true };
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      throw error;
    }
  }

  // ============================================
  // RESET MẬT KHẨU
  // ============================================
  async resetPassword(token, newPassword) {
    try {
      // TODO: Verify token and update password
      return { success: true };
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  }

  // ============================================
  // XÁC THỰC TOKEN
  // ============================================
  async verifyToken(token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }
      return user;
    } catch (error) {
      console.error('❌ Token verification error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
