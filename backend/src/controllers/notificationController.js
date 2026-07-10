const notificationService = require('../services/notificationService');

/**
 * Controller quản lý thông báo
 */
class NotificationController {
  /**
   * Lấy thông báo của người dùng
   */
  async getUserNotifications(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await notificationService.getUserNotifications(
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
   * Lấy số thông báo chưa đọc
   */
  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      res.json({ success: true, count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(req, res, next) {
    try {
      const result = await notificationService.markAsRead(
        req.params.notificationId,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa thông báo
   */
  async deleteNotification(req, res, next) {
    try {
      const result = await notificationService.deleteNotification(
        req.params.notificationId,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();