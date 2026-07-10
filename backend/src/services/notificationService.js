const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Dịch vụ quản lý thông báo
 */
class NotificationService {
  /**
   * Tạo thông báo
   */
  async createNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      
      // Gửi thông báo realtime qua socket
      const io = require('socket.io');
      const socketServer = io();
      socketServer.to(`user_${notification.recipient}`).emit('new_notification', notification);

      return notification;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông báo của người dùng
   */
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({
        recipient: userId,
        isDeleted: false,
      })
        .populate('sender', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments({
        recipient: userId,
        isDeleted: false,
      });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy số thông báo chưa đọc
   */
  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        recipient: userId,
        isRead: false,
        isDeleted: false,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Thông báo không tồn tại');
      }

      if (notification.recipient.toString() !== userId) {
        throw new Error('Không có quyền truy cập thông báo này');
      }

      await notification.markAsRead();
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa thông báo
   */
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Thông báo không tồn tại');
      }

      if (notification.recipient.toString() !== userId) {
        throw new Error('Không có quyền xóa thông báo này');
      }

      notification.isDeleted = true;
      notification.deletedAt = new Date();
      await notification.save();

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo thông báo hàng loạt
   */
  async createBulkNotifications(recipients, notificationData) {
    try {
      const notifications = [];
      for (const recipientId of recipients) {
        notifications.push({
          ...notificationData,
          recipient: recipientId,
        });
      }

      await Notification.insertMany(notifications);
      return { success: true, count: notifications.length };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new NotificationService();