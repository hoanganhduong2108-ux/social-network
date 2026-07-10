const messageService = require('../services/messageService');

/**
 * Controller quản lý tin nhắn
 */
class MessageController {
  /**
   * Gửi tin nhắn
   */
  async sendMessage(req, res, next) {
    try {
      const { content, type, receiverId } = req.body;
      const media = req.file;

      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn người nhận',
        });
      }

      const message = await messageService.sendMessage(
        req.user.id,
        receiverId,
        content,
        type || 'text',
        media
      );

      res.status(201).json({ success: true, message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy cuộc trò chuyện
   */
  async getConversation(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await messageService.getConversation(
        req.user.id,
        req.params.userId,
        parseInt(page) || 1,
        parseInt(limit) || 50
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách cuộc trò chuyện
   */
  async getConversations(req, res, next) {
    try {
      const conversations = await messageService.getConversations(req.user.id);
      res.json({ success: true, conversations });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa tin nhắn
   */
  async deleteMessage(req, res, next) {
    try {
      const result = await messageService.deleteMessage(
        req.params.messageId,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  async markAsRead(req, res, next) {
    try {
      const result = await messageService.markAsRead(
        req.params.messageId,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();