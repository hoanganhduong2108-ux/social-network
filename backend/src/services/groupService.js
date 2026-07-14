// ============================================
// FILE: backend/src/services/groupService.js
// MÔ TẢ: Dịch vụ quản lý nhóm - HOÀN CHỈNH
// ============================================

const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');
const path = require('path');

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

      let avatarUrl = groupData.avatar || null;

      const group = await Group.create({
        name: groupData.name,
        description: groupData.description || '',
        privacy: groupData.privacy || 'public',
        category: groupData.category || 'general',
        avatar: avatarUrl,
        coverPhoto: groupData.coverPhoto || null,
        admin: userId,
        admins: [userId],
        members: [{ user: userId, role: 'admin' }],
        stats: { members: 1 },
        settings: {
          requireApproval: groupData.privacy === 'private',
          allowMemberPosts: true,
          allowMemberInvites: false,
          allowMemberEvents: false,
          allowMemberPolls: true,
          allowMemberFiles: true,
          autoApprovePosts: false,
          postModeration: true,
          commentModeration: false,
          filterKeywords: [],
        },
      });

      return group;
    } catch (error) {
      console.error('❌ Create group error:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin nhóm theo ID
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
      console.error('❌ Get group by id error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách nhóm của người dùng
   */
  async getUserGroups(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const visibilityQuery = {
        isDeleted: false,
        $or: [
          { privacy: 'public' },
          { 'members.user': userId },
        ],
      };

      const groups = await Group.find(visibilityQuery)
        .populate('admin', 'username fullName avatar')
        .populate('members.user', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Group.countDocuments(visibilityQuery);

      return {
        groups: groups || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total || 0,
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      console.error('❌ Get user groups error:', error);
      return {
        groups: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      };
    }
  }

  /**
   * Tìm kiếm nhóm công khai
   */
  async searchGroups(query, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(query, 'i');

      const groups = await Group.find({
        $or: [
          { name: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } },
        ],
        privacy: 'public',
        isDeleted: false,
      })
        .populate('admin', 'username fullName avatar')
        .populate('members.user', 'username fullName avatar')
        .sort({ memberCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Group.countDocuments({
        $or: [
          { name: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } },
        ],
        privacy: 'public',
        isDeleted: false,
      });

      return {
        groups: groups || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total || 0,
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      console.error('❌ Search groups error:', error);
      return {
        groups: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      };
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

      if (group.isDeleted) {
        throw new Error('Nhóm đã bị xóa');
      }

      // Kiểm tra đã là thành viên
      if (group.isMember(userId)) {
        throw new Error('Bạn đã tham gia nhóm này');
      }

      // Kiểm tra đã gửi yêu cầu trước đó
      const existingRequest = group.pendingRequests?.some(
        r => r.user.toString() === userId
      );
      if (existingRequest) {
        throw new Error('Bạn đã gửi yêu cầu tham gia nhóm này');
      }

      // Kiểm tra cài đặt phê duyệt
      if (group.settings?.requireApproval || group.privacy === 'private') {
        group.pendingRequests.push({ 
          user: userId, 
          requestedAt: new Date() 
        });
        await group.save();

        const user = await User.findById(userId);
        for (const adminId of group.admins) {
          await Notification.create({
            recipient: adminId,
            sender: userId,
            type: 'group_join_request',
            content: `${user?.fullName || 'Người dùng'} muốn tham gia nhóm ${group.name}`,
            contentShort: 'Yêu cầu tham gia nhóm',
            relatedId: groupId,
            relatedType: 'group',
            url: `/groups/${groupId}`,
            image: user?.avatar,
          });
        }

        return { 
          success: true, 
          status: 'pending',
          message: 'Yêu cầu tham gia nhóm đã được gửi'
        };
      }

      // Thêm thành viên (public group)
      await group.addMember(userId);
      group.stats.members = group.members.length;
      await group.save();

      await Notification.create({
        recipient: userId,
        sender: userId,
        type: 'group_join',
        content: `Bạn đã tham gia nhóm ${group.name}`,
        contentShort: 'Đã tham gia nhóm',
        relatedId: groupId,
        relatedType: 'group',
        url: `/groups/${groupId}`,
        image: group.avatar,
      });

      return { 
        success: true, 
        status: 'joined',
        message: 'Đã tham gia nhóm thành công'
      };
    } catch (error) {
      console.error('❌ Join group error:', error);
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
        throw new Error('Bạn không tham gia nhóm này');
      }

      if (group.admin.toString() === userId && group.admins.length === 1) {
        throw new Error('Không thể rời nhóm khi là admin duy nhất');
      }

      await group.removeMember(userId);

      if (group.admins.includes(userId)) {
        group.admins = group.admins.filter(id => id.toString() !== userId);
        await group.save();
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Leave group error:', error);
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

      group.invitedUsers.push({
        user: userId,
        invitedBy: inviterId,
      });
      await group.save();

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
      console.error('❌ Invite member error:', error);
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
      console.error('❌ Update group error:', error);
      throw error;
    }
  }

  /**
   * Xóa nhóm (soft delete)
   */
  async deleteGroup(groupId, userId) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Nhóm không tồn tại');
      }

      if (group.admin.toString() !== userId && !group.admins.includes(userId)) {
        throw new Error('Không có quyền xóa nhóm');
      }

      group.isDeleted = true;
      group.deletedAt = new Date();
      await group.save();

      return { success: true };
    } catch (error) {
      console.error('❌ Delete group error:', error);
      throw error;
    }
  }

  /**
   * Chấp nhận yêu cầu tham gia nhóm
   */
  async approveJoinRequest(groupId, userId, approverId) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Nhóm không tồn tại');
      }

      if (!group.isAdmin(approverId)) {
        throw new Error('Không có quyền phê duyệt yêu cầu');
      }

      const requestIndex = group.pendingRequests.findIndex(
        r => r.user.toString() === userId
      );
      if (requestIndex === -1) {
        throw new Error('Không tìm thấy yêu cầu tham gia');
      }

      group.pendingRequests.splice(requestIndex, 1);
      await group.addMember(userId);

      await Notification.create({
        recipient: userId,
        sender: approverId,
        type: 'group_join',
        content: `Yêu cầu tham gia nhóm ${group.name} đã được chấp nhận`,
        contentShort: 'Đã chấp nhận tham gia nhóm',
        relatedId: groupId,
        relatedType: 'group',
        url: `/groups/${groupId}`,
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Approve join request error:', error);
      throw error;
    }
  }

  /**
   * Từ chối yêu cầu tham gia nhóm
   */
  async rejectJoinRequest(groupId, userId, approverId) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Nhóm không tồn tại');
      }

      if (!group.isAdmin(approverId)) {
        throw new Error('Không có quyền từ chối yêu cầu');
      }

      const requestIndex = group.pendingRequests.findIndex(
        r => r.user.toString() === userId
      );
      if (requestIndex === -1) {
        throw new Error('Không tìm thấy yêu cầu tham gia');
      }

      group.pendingRequests.splice(requestIndex, 1);
      await group.save();

      await Notification.create({
        recipient: userId,
        sender: approverId,
        type: 'group_join',
        content: `Yêu cầu tham gia nhóm ${group.name} đã bị từ chối`,
        contentShort: 'Yêu cầu bị từ chối',
        relatedId: groupId,
        relatedType: 'group',
        url: `/groups/${groupId}`,
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Reject join request error:', error);
      throw error;
    }
  }

  /**
   * Xóa thành viên khỏi nhóm
   */
  async removeMember(groupId, userId, removerId) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Nhóm không tồn tại');
      }

      if (!group.isAdmin(removerId)) {
        throw new Error('Không có quyền xóa thành viên');
      }

      if (group.admin.toString() === userId) {
        throw new Error('Không thể xóa admin của nhóm');
      }

      await group.removeMember(userId);

      if (group.admins.includes(userId)) {
        group.admins = group.admins.filter(id => id.toString() !== userId);
        await group.save();
      }

      await Notification.create({
        recipient: userId,
        sender: removerId,
        type: 'group_join',
        content: `Bạn đã bị xóa khỏi nhóm ${group.name}`,
        contentShort: 'Đã bị xóa khỏi nhóm',
        relatedId: groupId,
        relatedType: 'group',
        url: `/groups/${groupId}`,
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Remove member error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách thành viên của nhóm
   */
  async getGroupMembers(groupId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const group = await Group.findById(groupId)
        .populate({
          path: 'members.user',
          select: 'username fullName avatar isOnline lastSeen',
        });

      if (!group) {
        throw new Error('Nhóm không tồn tại');
      }

      const members = group.members || [];
      const total = members.length;
      const paginatedMembers = members.slice(skip, skip + parseInt(limit));

      return {
        members: paginatedMembers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      console.error('❌ Get group members error:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra user có trong nhóm không
   */
  async isMember(groupId, userId) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        return false;
      }
      return group.isMember(userId);
    } catch (error) {
      console.error('❌ Check is member error:', error);
      return false;
    }
  }

  /**
   * Kiểm tra user có là admin không
   */
  async isAdmin(groupId, userId) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        return false;
      }
      return group.isAdmin(userId);
    } catch (error) {
      console.error('❌ Check is admin error:', error);
      return false;
    }
  }
}

module.exports = new GroupService();
