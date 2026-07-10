// ============================================
// FILE: backend/src/services/eventService.js
// MÔ TẢ: Dịch vụ quản lý sự kiện
// ============================================

const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');

class EventService {
  /**
   * Tạo sự kiện mới
   */
  async createEvent(userId, eventData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      // Tạo sự kiện
      const event = await Event.create({
        ...eventData,
        organizer: {
          type: 'user',
          id: userId,
        },
        status: 'published',
      });

      return event;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin sự kiện
   */
  async getEventById(eventId) {
    try {
      const event = await Event.findById(eventId)
        .populate('organizer.id', 'username fullName avatar')
        .populate('attendees.user', 'username fullName avatar')
        .populate('invitees.user', 'username fullName avatar');

      if (!event) {
        throw new Error('Sự kiện không tồn tại');
      }

      return event;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách sự kiện
   */
  async getEvents(userId, type = 'upcoming', page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      let query = {};

      // Lọc theo loại
      const now = new Date();
      switch (type) {
        case 'upcoming':
          query.startTime = { $gte: now };
          break;
        case 'ongoing':
          query.startTime = { $lte: now };
          query.endTime = { $gte: now };
          break;
        case 'past':
          query.endTime = { $lt: now };
          break;
        default:
          break;
      }

      const events = await Event.find(query)
        .populate('organizer.id', 'username fullName avatar')
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(limit);

      const total = await Event.countDocuments(query);

      return {
        events,
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
   * Tham gia sự kiện
   */
  async rsvpEvent(eventId, userId, status = 'going') {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Sự kiện không tồn tại');
      }

      // Kiểm tra sự kiện đã kết thúc
      if (event.endTime < new Date()) {
        throw new Error('Sự kiện đã kết thúc');
      }

      // Kiểm tra sức chứa
      if (event.capacity && event.attendees.length >= event.capacity) {
        throw new Error('Sự kiện đã đầy');
      }

      await event.addAttendee(userId, status);

      // Tạo thông báo cho người tổ chức
      const user = await User.findById(userId);
      await Notification.create({
        recipient: event.organizer.id,
        sender: userId,
        type: 'event_invite',
        content: `${user.fullName} đã ${status === 'going' ? 'tham gia' : 'quan tâm'} đến sự kiện ${event.title}`,
        contentShort: 'Phản hồi sự kiện',
        relatedId: eventId,
        relatedType: 'event',
        url: `/events/${eventId}`,
        image: user.avatar,
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật sự kiện
   */
  async updateEvent(eventId, userId, updateData) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Sự kiện không tồn tại');
      }

      // Kiểm tra quyền
      if (event.organizer.id.toString() !== userId) {
        throw new Error('Không có quyền cập nhật sự kiện');
      }

      const allowedFields = [
        'title', 'description', 'image', 'startTime', 'endTime',
        'location', 'category', 'tags', 'privacy', 'capacity', 'tickets'
      ];

      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        filteredData,
        { new: true, runValidators: true }
      );

      return updatedEvent;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Hủy sự kiện
   */
  async cancelEvent(eventId, userId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Sự kiện không tồn tại');
      }

      if (event.organizer.id.toString() !== userId) {
        throw new Error('Không có quyền hủy sự kiện');
      }

      event.isCancelled = true;
      event.cancelReason = 'Bị hủy bởi người tổ chức';
      await event.save();

      // Thông báo cho tất cả người tham gia
      for (const attendee of event.attendees) {
        await Notification.create({
          recipient: attendee.user,
          sender: userId,
          type: 'event_invite',
          content: `Sự kiện ${event.title} đã bị hủy`,
          contentShort: 'Sự kiện bị hủy',
          relatedId: eventId,
          relatedType: 'event',
          url: `/events/${eventId}`,
        });
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EventService();