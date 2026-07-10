// ============================================
// FILE: backend/src/controllers/authController.js
// MÔ TẢ: Controller xác thực - THÊM LOG
// ============================================

const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
  // ============================================
  // ĐĂNG KÝ
  // ============================================
  async register(req, res, next) {
    try {
      console.log('📝 Register request:', {
        username: req.body.username,
        email: req.body.email,
        fullName: req.body.fullName,
      });
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const result = await authService.register(req.body);
      console.log('✅ Register success:', result.user?.username);
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Register error:', error.message);
      next(error);
    }
  }

  // ============================================
  // ĐĂNG NHẬP
  // ============================================
  async login(req, res, next) {
    try {
      console.log('🔐 Login request:', { 
        emailOrUsername: req.body.emailOrUsername 
      });
      
      const { emailOrUsername, password } = req.body;
      
      if (!emailOrUsername || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin đăng nhập',
        });
      }

      const result = await authService.login(emailOrUsername, password);
      console.log('✅ Login success for:', emailOrUsername);
      res.json(result);
    } catch (error) {
      console.error('❌ Login error:', error.message);
      next(error);
    }
  }

  // ============================================
  // ĐĂNG XUẤT
  // ============================================
  async logout(req, res, next) {
    try {
      const result = await authService.logout(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // ĐỔI MẬT KHẨU
  // ============================================
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin',
        });
      }

      const result = await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // QUÊN MẬT KHẨU
  // ============================================
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập email',
        });
      }

      const result = await authService.forgotPassword(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // RESET MẬT KHẨU
  // ============================================
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin',
        });
      }

      const result = await authService.resetPassword(token, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();