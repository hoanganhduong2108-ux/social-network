const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');

/**
 * Dịch vụ quản lý tin nhắn
 */
class MessageService {
  /**
   * Gửi tin nhắn
   * Sửa lỗi: so sánh ObjectId phải dùng toString()
   */
  async sendMessage(senderId, receiverId, content, type = 'text', media = null) {
    try {
      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);

      if (!sender || !receiver) {
        throw new Error('Người dùng không tồn tại');
      }

      // Kiểm tra quyền nhắn tin - Cho phép gửi tin nhắn cho mọi người trừ khi họ cài đặt 'nobody'
      const allowMessages = receiver.privacy?.allowMessages || 'everyone';
      if (allowMessages === 'nobody') {
        throw new Error('Không thể gửi tin nhắn cho người này');
      }

      // Xử lý media nếu có
      let mediaData = null;
      if (media) {
        const result = await cloudinary.uploader.upload(media.path, {
          folder: 'messages',
          resource_type: 'auto',
        });
        mediaData = {
          url: result.secure_url,
          publicId: result.public_id,
          metadata: {
            width: result.width,
            height: result.height,
            duration: result.duration,
            size: result.bytes,
          },
          thumbnail: result.thumbnail_url || result.secure_url,
        };
      }

      // Tạo tin nhắn
      const message = await Message.create({
        conversationId: this.getConversationId(senderId, receiverId),
        sender: senderId,
        content: content || '',
        type: media ? media.mimetype.startsWith('video') ? 'video' : 'image' : type,
        media: mediaData,
      });

      // Populate sender info để frontend hiển thị ngay lập tức
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username fullName avatar');

      // Gửi thông báo
      await Notification.create({
        recipient: receiverId,
        sender: senderId,
        type: 'message',
        content: `${sender.fullName} đã gửi tin nhắn: ${content || `Đã gửi một file`}`,
        contentShort: 'Tin nhắn mới',
        relatedId: message._id,
        relatedType: 'message',
        url: `/messages/${senderId}`,
        image: sender.avatar,
      });

      return populatedMessage;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy tin nhắn giữa 2 người
   */
  async getConversation(userId, otherUserId, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;

      const messages = await Message.find({
        conversationId: this.getConversationId(userId, otherUserId),
        isDeleted: false,
      })
        .populate('sender', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Đánh dấu tin nhắn đã đọc
      const mongoose = require('mongoose');
      let userObjectId;
      try {
        userObjectId = new mongoose.Types.ObjectId(userId);
      } catch (e) {
        userObjectId = userId;
      }

      await Message.updateMany(
        {
          conversationId: this.getConversationId(userId, otherUserId),
          sender: otherUserId,
          'readBy.user': { $ne: userObjectId },
        },
        {
          $push: {
            readBy: { user: userObjectId, readAt: new Date() },
          },
        }
      );

      return {
        messages: messages.reverse(),
        pagination: {
          page,
          limit,
          total: await Message.countDocuments({
            conversationId: this.getConversationId(userId, otherUserId),
            isDeleted: false,
          }),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách cuộc trò chuyện
   * Sửa lỗi: query MongoDB cần dùng ObjectId thay vì string
   */
  async getConversations(userId) {
    try {
      const mongoose = require('mongoose');
      
      // Chuyển userId thành ObjectId để query đúng
      let userObjectId;
      try {
        userObjectId = new mongoose.Types.ObjectId(userId);
      } catch (e) {
        throw new Error('ID người dùng không hợp lệ');
      }

      // Lấy tất cả tin nhắn mà user có liên quan (gửi hoặc nhận)
      const messages = await Message.aggregate([
        {
          $match: {
            // Tìm tin nhắn có userId trong conversationId
            conversationId: { $regex: userId },
            isDeleted: false,
          },
        },
        {
          // Nhóm theo conversationId, lấy tin nhắn cuối cùng
          $group: {
            _id: '$conversationId',
            lastMessageTime: { $max: '$createdAt' },
          },
        },
        {
          $sort: { lastMessageTime: -1 },
        },
      ]);

      const conversationIds = messages.map(m => m._id);
      const conversations = [];

      for (const convId of conversationIds) {
        // Tách ID hai người từ conversationId (format: id1_id2)
        const participants = convId.split('_');
        const otherUserId = participants.find(id => id !== userId);
        
        if (!otherUserId) continue; // Bỏ qua nếu không tìm thấy người kia

        // Lấy tin nhắn cuối cùng
        const lastMessage = await Message.findOne({
          conversationId: convId,
          isDeleted: false,
        })
          .sort({ createdAt: -1 })
          .populate('sender', 'username fullName avatar');

        // Đếm tin nhắn chưa đọc (từ người kia gửi, chưa đọc)
        const unreadCount = await Message.countDocuments({
          conversationId: convId,
          sender: otherUserId,
          'readBy.user': { $ne: userObjectId },
          isDeleted: false,
        });

        // Lấy thông tin người dùng kia
        const otherUser = await User.findById(otherUserId)
          .select('username fullName avatar isOnline lastSeen');

        // Chỉ thêm nếu tìm thấy user
        if (otherUser) {
          conversations.push({
            user: otherUser,
            lastMessage,
            unreadCount,
          });
        }
      }

      return conversations;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa tin nhắn
   */
  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Tin nhắn không tồn tại');
      }

      if (message.sender.toString() !== userId) {
        throw new Error('Không có quyền xóa tin nhắn này');
      }

      message.isDeleted = true;
      message.deletedAt = new Date();
      await message.save();

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  async markAsRead(messageId, userId) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Tin nhắn không tồn tại');
      }

      await message.markAsRead(userId);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  getConversationId(userId1, userId2) {
    return [userId1.toString(), userId2.toString()].sort().join('_');
  }
}

module.exports = new MessageService();