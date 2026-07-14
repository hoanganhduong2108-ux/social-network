// ============================================
// FILE: backend/src/controllers/pageController.js
// MÔ TẢ: Controller quản lý trang (Page) - SỬA LỖI RESPONSE
// ============================================

const pageService = require('../services/pageService');
const { validationResult } = require('express-validator');

class PageController {
  /**
   * Tạo trang mới
   */
  async createPage(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const page = await pageService.createPage(req.user.id, req.body);
      
      res.status(201).json({
        success: true,
        page: page,
        message: 'Tạo trang thành công',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thông tin trang
   */
  async getPageById(req, res, next) {
    try {
      const page = await pageService.getPageById(req.params.id);
      res.json({ 
        success: true, 
        page 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách trang của người dùng
   */
  async getUserPages(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await pageService.getUserPages(
        req.user.id,
        parseInt(page) || 1,
        parseInt(limit) || 20
      );
      
      // ============================================
      // TRẢ VỀ RESPONSE ĐÚNG CẤU TRÚC
      // ============================================
      res.json({
        success: true,
        pages: result.pages || [],
        pagination: result.pagination || {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
          total: 0,
          pages: 0,
        },
      });
    } catch (error) {
      console.error('❌ Error fetching user pages:', error);
      res.json({
        success: true,
        pages: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
      });
    }
  }

  /**
   * Theo dõi trang
   */
  async followPage(req, res, next) {
    try {
      const result = await pageService.followPage(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bỏ theo dõi trang
   */
  async unfollowPage(req, res, next) {
    try {
      const result = await pageService.unfollowPage(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật trang
   */
  async updatePage(req, res, next) {
    try {
      const page = await pageService.updatePage(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json({ 
        success: true, 
        page 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm đánh giá cho trang
   */
  async addReview(req, res, next) {
    try {
      const { rating, content } = req.body;
      const images = req.files || [];
      
      const review = await pageService.addReview(
        req.params.id,
        req.user.id,
        rating,
        content,
        images
      );
      res.status(201).json({ 
        success: true, 
        review 
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PageController();