// ============================================
// FILE: backend/src/controllers/groupController.js
// MÔ TẢ: Controller quản lý nhóm
// ============================================

const groupService = require('../services/groupService');
const { validationResult } = require('express-validator');

class GroupController {
  /**
   * Tạo nhóm mới
   */
  async createGroup(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const group = await groupService.createGroup(req.user.id, req.body);
      res.status(201).json({ success: true, group });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thông tin nhóm
   */
  async getGroupById(req, res, next) {
    try {
      const group = await groupService.getGroupById(req.params.id);
      res.json({ success: true, group });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách nhóm của người dùng
   */
  async getUserGroups(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await groupService.getUserGroups(
        req.user.id,
        parseInt(page) || 1,
        parseInt(limit) || 20
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tham gia nhóm
   */
  async joinGroup(req, res, next) {
    try {
      const result = await groupService.joinGroup(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rời nhóm
   */
  async leaveGroup(req, res, next) {
    try {
      const result = await groupService.leaveGroup(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mời thành viên vào nhóm
   */
  async inviteMember(req, res, next) {
    try {
      const { userId } = req.body;
      const result = await groupService.inviteMember(
        req.params.id,
        userId,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật nhóm
   */
  async updateGroup(req, res, next) {
    try {
      const group = await groupService.updateGroup(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json({ success: true, group });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa nhóm
   */
  async deleteGroup(req, res, next) {
    try {
      // TODO: Implement delete group
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GroupController();