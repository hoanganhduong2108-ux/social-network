const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Dịch vụ quản lý nhóm
 */
class GroupService {
  /**
   * Tạo nhóm mới
   */
  async createGroup(userId, groupData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      // Tạo nhóm
      const group = await Group.create({
        ...groupData,
        admin: userId,
        admins: [userId],
        members: [{ user: userId, role: 'admin' }],
        stats: { members: 1 },
      });

      return group;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin nhóm
   */
  async getGroupById(groupId) {
    try {
      const group = await Group.findById(groupId)
        .populate('admin', 'username fullName avatar')
        .populate('admins', 'username fullName avatar')
        .populate('moderators', 'username fullName avatar')
        .populate('members.user', 'username fullName avatar')
        .populate('pinnedPosts', 'author content media createdAt')
        .populate('events', 'title startTime endTime');

      if (!group) {
        throw new Error('Nhóm không tồn tại');
      }

      return group;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách nhóm của người dùng
   */
  async getUserGroups(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const groups = await Group.find({
        'members.user': userId,
        isDeleted: false,
      })
        .populate('admin', 'username fullName avatar')
        .populate('members.user', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Group.countDocuments({
        'members.user': userId,
        isDeleted: false,
      });

      return {
        groups,
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
   * Tham gia nhóm
   */
  async joinGroup(groupId, userId) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Nhóm không tồn tại');
      }

      if (group.isMember(userId)) {
        throw new Error('Đã tham gia nhóm');
      }

      // Kiểm tra cài đặt
      if (group.settings.requireApproval) {
        // Thêm vào danh sách chờ
        group.pendingRequests.push({ user: userId });
        await group.save();

        // Thông báo cho admin
        for (const adminId of group.admins) {
          await Notification.create({
            recipient: adminId,
            sender: userId,
            type: 'group_join',
            content: `Có yêu cầu tham gia nhóm ${group.name}`,
            contentShort: 'Yêu cầu tham gia nhóm',
            relatedId: groupId,
            relatedType: 'group',
            url: `/groups/${groupId}`,
          });
        }

        return { success: true, status: 'pending' };
      }

      // Thêm thành viên
      await group.addMember(userId);

      // Thông báo
      await Notification.create({
        recipient: userId,
        sender: userId,
        type: 'group_join',
        content: `Bạn đã tham gia nhóm ${group.name}`,
        contentShort: 'Đã tham gia nhóm',
        relatedId: groupId,
        relatedType: 'group',
        url: `/groups/${groupId}`,
      });

      return { success: true, status: 'joined' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rời nhóm
   */
  async leaveGroup(groupId, userId) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Nhóm không tồn tại');
      }

      if (!group.isMember(userId)) {
        throw new Error('Không tham gia nhóm này');
      }

      // Kiểm tra nếu là admin duy nhất
      if (group.admin.toString() === userId && group.admins.length === 1) {
        throw new Error('Không thể rời nhóm khi là admin duy nhất');
      }

      await group.removeMember(userId);

      // Nếu là admin, xóa khỏi danh sách admin
      if (group.admins.includes(userId)) {
        group.admins = group.admins.filter(id => id.toString() !== userId);
        await group.save();
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mời thành viên vào nhóm
   */
  async inviteMember(groupId, userId, inviterId) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Nhóm không tồn tại');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      if (!group.isAdmin(inviterId)) {
        throw new Error('Không có quyền mời thành viên');
      }

      if (group.isMember(userId)) {
        throw new Error('Người dùng đã tham gia nhóm');
      }

      // Thêm vào danh sách mời
      group.invitedUsers.push({
        user: userId,
        invitedBy: inviterId,
      });
      await group.save();

      // Thông báo
      await Notification.create({
        recipient: userId,
        sender: inviterId,
        type: 'group_invite',
        content: `Bạn được mời tham gia nhóm ${group.name}`,
        contentShort: 'Lời mời tham gia nhóm',
        relatedId: groupId,
        relatedType: 'group',
        url: `/groups/${groupId}`,
        image: group.avatar,
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật nhóm
   */
  async updateGroup(groupId, userId, updateData) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Nhóm không tồn tại');
      }

      if (!group.isAdmin(userId)) {
        throw new Error('Không có quyền cập nhật nhóm');
      }

      const allowedFields = [
        'name', 'description', 'avatar', 'coverPhoto', 'category',
        'tags', 'privacy', 'location', 'settings'
      ];

      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        filteredData,
        { new: true, runValidators: true }
      );

      return updatedGroup;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new GroupService();