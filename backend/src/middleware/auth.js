const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

/**
 * Middleware xác thực người dùng
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để tiếp tục',
      });
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra người dùng
    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
    } else {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    // Kiểm tra tài khoản bị khóa
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Tài khoản đã bị khóa: ${user.banReason || 'Vi phạm điều khoản'}`,
      });
    }

    req.user = user;
    req.user.role = decoded.role || 'user';
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn',
      });
    }
    next(error);
  }
};

/**
 * Middleware kiểm tra quyền admin
 */
const adminOnly = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập',
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware kiểm tra quyền super admin
 */
const superAdminOnly = async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập',
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, adminOnly, superAdminOnly };