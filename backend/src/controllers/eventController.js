// ============================================
// FILE: backend/src/controllers/eventController.js
// MÔ TẢ: Controller quản lý sự kiện
// ============================================

const eventService = require('../services/eventService');
const { validationResult } = require('express-validator');

class EventController {
  /**
   * Tạo sự kiện mới
   */
  async createEvent(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await eventService.createEvent(req.user.id, req.body);
      res.status(201).json({ success: true, event });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thông tin sự kiện
   */
  async getEventById(req, res, next) {
    try {
      const event = await eventService.getEventById(req.params.id);
      res.json({ success: true, event });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách sự kiện
   */
  async getEvents(req, res, next) {
    try {
      const { page, limit, type } = req.query;
      const result = await eventService.getEvents(
        req.user.id,
        type,
        parseInt(page) || 1,
        parseInt(limit) || 20
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tham gia sự kiện
   */
  async rsvpEvent(req, res, next) {
    try {
      const { status } = req.body;
      const result = await eventService.rsvpEvent(
        req.params.id,
        req.user.id,
        status || 'going'
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật sự kiện
   */
  async updateEvent(req, res, next) {
    try {
      const event = await eventService.updateEvent(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json({ success: true, event });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Hủy sự kiện
   */
  async cancelEvent(req, res, next) {
    try {
      const result = await eventService.cancelEvent(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventController();