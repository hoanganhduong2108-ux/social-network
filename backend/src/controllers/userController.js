// ============================================
// FILE: backend/src/controllers/userController.js
// MÔ TẢ: Controller quản lý người dùng - SỬA LỖI KẾT BẠN
// ============================================

const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class UserController {
  /**
   * Lấy thông tin người dùng hiện tại
   */
  async getCurrentUser(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thông tin người dùng theo ID
   */
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thông tin người dùng theo username
   */
  async getUserByUsername(req, res, next) {
    try {
      const user = await userService.getUserByUsername(req.params.username);
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateUser(req.user.id, req.body);
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật ảnh đại diện
   */
  async updateAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn ảnh',
        });
      }

      const avatar = await userService.updateAvatar(req.user.id, req.file);
      res.json({ success: true, avatar });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật ảnh bìa
   */
  async updateCoverPhoto(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn ảnh',
        });
      }

      const coverPhoto = await userService.updateCoverPhoto(req.user.id, req.file);
      res.json({ success: true, coverPhoto });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ============================================
   * GỬI LỜI MỜI KẾT BẠN - SỬA LỖI
   * ============================================
   */
  async sendFriendRequest(req, res, next) {
    try {
      const result = await userService.sendFriendRequest(
        req.user.id,
        req.params.userId
      );
      res.json(result);
    } catch (error) {
      console.error('Send friend request error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể gửi lời mời kết bạn',
      });
    }
  }

  /**
   * ============================================
   * CHẤP NHẬN LỜI MỜI KẾT BẠN - SỬA LỖI
   * ============================================
   */
  async acceptFriendRequest(req, res, next) {
    try {
      const result = await userService.acceptFriendRequest(
        req.user.id,
        req.params.userId
      );
      res.json(result);
    } catch (error) {
      console.error('Accept friend request error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể chấp nhận lời mời',
      });
    }
  }

  /**
   * ============================================
   * TỪ CHỐI LỜI MỜI KẾT BẠN
   * ============================================
   */
  async rejectFriendRequest(req, res, next) {
    try {
      const result = await userService.rejectFriendRequest(
        req.user.id,
        req.params.userId
      );
      res.json(result);
    } catch (error) {
      console.error('Reject friend request error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể từ chối lời mời',
      });
    }
  }

  /**
   * ============================================
   * HỦY KẾT BẠN
   * ============================================
   */
  async unfriend(req, res, next) {
    try {
      const result = await userService.unfriend(
        req.user.id,
        req.params.userId
      );
      res.json(result);
    } catch (error) {
      console.error('Unfriend error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể hủy kết bạn',
      });
    }
  }

  /**
   * Theo dõi người dùng
   */
  async followUser(req, res, next) {
    try {
      const result = await userService.followUser(
        req.user.id,
        req.params.userId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bỏ theo dõi người dùng
   */
  async unfollowUser(req, res, next) {
    try {
      const result = await userService.unfollowUser(
        req.user.id,
        req.params.userId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * ============================================
   * TÌM KIẾM NGƯỜI DÙNG - SỬA LỖI
   * ============================================
   */
  async searchUsers(req, res, next) {
    try {
      const { q, page, limit, location, gender } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm',
        });
      }

      const result = await userService.searchUsers(
        q.trim(),
        req.user.id, // Thêm userId để kiểm tra bạn bè
        parseInt(page) || 1,
        parseInt(limit) || 20,
        location,
        gender
      );
      res.json(result);
    } catch (error) {
      console.error('Search users error:', error);
      next(error);
    }
  }

  /**
   * ============================================
   * LẤY DANH SÁCH BẠN BÈ - SỬA LỖI
   * ============================================
   */
  async getFriends(req, res, next) {
    try {
      const { page, limit } = req.query;
      const userId = req.params.userId || req.user.id;
      
      const result = await userService.getFriends(
        userId,
        parseInt(page) || 1,
        parseInt(limit) || 20
      );
      res.json(result);
    } catch (error) {
      console.error('Get friends error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể tải danh sách bạn bè',
      });
    }
  }

  /**
   * ============================================
   * LẤY DANH SÁCH LỜI MỜI KẾT BẠN - SỬA LỖI
   * ============================================
   */
  async getFriendRequests(req, res, next) {
    try {
      const requests = await userService.getFriendRequests(req.user.id);
      res.json({ 
        success: true, 
        requests: requests || [],
        count: requests ? requests.length : 0,
      });
    } catch (error) {
      console.error('Get friend requests error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể tải lời mời kết bạn',
        requests: [],
        count: 0,
      });
    }
  }

  /**
   * ============================================
   * LẤY GỢI Ý BẠN BÈ
   * ============================================
   */
  async getFriendSuggestions(req, res, next) {
    try {
      const { limit } = req.query;
      const suggestions = await userService.getFriendSuggestions(
        req.user.id,
        parseInt(limit) || 10
      );
      res.json({ success: true, suggestions });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();