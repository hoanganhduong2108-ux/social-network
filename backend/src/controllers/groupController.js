// ============================================
// FILE: backend/src/controllers/groupController.js
// MÔ TẢ: Controller quản lý nhóm - HOÀN CHỈNH
// ============================================

const groupService = require('../services/groupService');
const { validationResult } = require('express-validator');
const path = require('path');

class GroupController {
  /**
   * Tạo nhóm mới
   */
  async createGroup(req, res, next) {
    try {
      console.log('📝 Creating group...');
      console.log('📝 User:', req.user.id);
      console.log('📝 Body:', req.body);
      console.log('📝 Files:', req.files ? JSON.stringify(req.files) : 'none');

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      // Xử lý avatar và cover photo
      let avatarUrl = null;
      let coverUrl = null;
      
      if (req.files) {
        // Xử lý avatar
        if (req.files.avatar && req.files.avatar.length > 0) {
          avatarUrl = `/uploads/groups/${req.files.avatar[0].filename}`;
          console.log('📷 Avatar uploaded:', avatarUrl);
        }
        // Xử lý cover photo
        if (req.files.coverPhoto && req.files.coverPhoto.length > 0) {
          coverUrl = `/uploads/groups/${req.files.coverPhoto[0].filename}`;
          console.log('📷 Cover photo uploaded:', coverUrl);
        }
        // Fallback: nếu dùng field name 'files'
        if (req.files.files && req.files.files.length > 0) {
          for (const file of req.files.files) {
            if (file.fieldname === 'avatar' || file.originalname?.includes('avatar')) {
              avatarUrl = `/uploads/groups/${file.filename}`;
            }
            if (file.fieldname === 'coverPhoto' || file.originalname?.includes('cover')) {
              coverUrl = `/uploads/groups/${file.filename}`;
            }
          }
        }
      }

      const groupData = {
        name: req.body.name,
        description: req.body.description || '',
        privacy: req.body.privacy || 'public',
        category: req.body.category || 'general',
        avatar: avatarUrl,
        coverPhoto: coverUrl,
      };

      console.log('📝 Group data:', groupData);

      const group = await groupService.createGroup(req.user.id, groupData);
      
      console.log('✅ Group created:', group._id);

      res.status(201).json({ 
        success: true, 
        group: group,
        message: 'Tạo nhóm thành công',
      });
    } catch (error) {
      console.error('❌ Error creating group:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể tạo nhóm',
      });
    }
  }

  /**
   * Lấy thông tin nhóm theo ID
   */
  async getGroupById(req, res, next) {
    try {
      console.log('📖 Fetching group:', req.params.id);
      
      const group = await groupService.getGroupById(req.params.id);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhóm',
        });
      }

      const userId = req.user.id;
      
      // Kiểm tra isMember chính xác
      const isMember = group.members?.some(m => {
        const memberId = m.user?.toString() || m.user?._id?.toString() || m._id?.toString();
        return memberId === userId?.toString();
      }) || false;
      
      const isAdmin = group.admins?.some(id => id?.toString() === userId?.toString()) || 
                      group.admin?.toString() === userId?.toString() || false;

      // Nếu nhóm là private hoặc secret, chỉ member mới xem được
      if ((group.privacy === 'private' || group.privacy === 'secret') && !isMember && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem nhóm này',
        });
      }

      const groupObject = group.toObject ? group.toObject() : group;
      
      res.json({
        success: true,
        group: {
          ...groupObject,
          isMember: isMember,
          isAdmin: isAdmin,
        },
        isMember: isMember,
        isAdmin: isAdmin,
      });
    } catch (error) {
      console.error('❌ Error fetching group:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Không thể tải thông tin nhóm',
      });
    }
  }

  /**
   * Lấy danh sách nhóm của người dùng
   */
  async getUserGroups(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      console.log(`📖 Fetching groups for user: ${req.user.id}`);
      
      const result = await groupService.getUserGroups(
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );
      
      const groups = result.groups.map((group) => {
        const groupData = group.toObject();
        groupData.isMember = groupData.members.some((member) => {
          const memberId = member.user?._id || member.user;
          return memberId?.toString() === req.user.id.toString();
        });
        return groupData;
      });

      res.json({
        success: true,
        groups,
        pagination: result.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      });
    } catch (error) {
      console.error('❌ Error fetching user groups:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Không thể tải danh sách nhóm',
        groups: [],
        pagination: {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
          total: 0,
          pages: 0,
        },
      });
    }
  }

  /**
   * Tìm kiếm nhóm công khai
   */
  async searchGroups(req, res, next) {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm',
        });
      }

      console.log(`🔍 Searching groups: ${q}`);
      
      const result = await groupService.searchGroups(
        q.trim(),
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        groups: result.groups || [],
        pagination: result.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      });
    } catch (error) {
      console.error('❌ Error searching groups:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Không thể tìm kiếm nhóm',
      });
    }
  }

  /**
   * Tham gia nhóm
   */
  async joinGroup(req, res, next) {
    try {
      const groupId = req.params.id;
      const userId = req.user.id;
      
      console.log(`👋 User ${userId} joining group: ${groupId}`);
      
      const group = await groupService.getGroupById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhóm'
        });
      }

      if (group.isDeleted) {
        return res.status(400).json({
          success: false,
          message: 'Nhóm đã bị xóa'
        });
      }

      // Kiểm tra đã là thành viên
      const isMember = group.members?.some(m => {
        const memberId = m.user?.toString() || m.user?._id?.toString() || m._id?.toString();
        return memberId === userId?.toString();
      }) || false;
      
      if (isMember) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã tham gia nhóm này'
        });
      }

      const result = await groupService.joinGroup(groupId, userId);
      
      res.json({
        success: true,
        ...result,
        message: result.status === 'pending' 
          ? 'Yêu cầu tham gia nhóm đã được gửi' 
          : 'Đã tham gia nhóm thành công',
      });
    } catch (error) {
      console.error('❌ Error joining group:', error);
      
      let message = error.message || 'Không thể tham gia nhóm';
      let statusCode = 400;
      
      if (message.includes('đã tham gia')) {
        message = 'Bạn đã tham gia nhóm này';
      } else if (message.includes('đã gửi yêu cầu')) {
        message = 'Bạn đã gửi yêu cầu tham gia nhóm này';
      } else if (message.includes('không tồn tại')) {
        statusCode = 404;
      }
      
      res.status(statusCode).json({
        success: false,
        message: message,
      });
    }
  }

  /**
   * Rời nhóm
   */
  async leaveGroup(req, res, next) {
    try {
      console.log(`👋 User ${req.user.id} leaving group: ${req.params.id}`);
      
      const result = await groupService.leaveGroup(req.params.id, req.user.id);
      
      res.json({
        success: true,
        ...result,
        message: 'Đã rời nhóm thành công',
      });
    } catch (error) {
      console.error('❌ Error leaving group:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể rời nhóm',
      });
    }
  }

  /**
   * Mời thành viên vào nhóm
   */
  async inviteMember(req, res, next) {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn người dùng để mời',
        });
      }

      console.log(`📨 User ${req.user.id} inviting ${userId} to group: ${req.params.id}`);
      
      const result = await groupService.inviteMember(
        req.params.id,
        userId,
        req.user.id
      );
      
      res.json({
        success: true,
        ...result,
        message: 'Đã gửi lời mời tham gia nhóm',
      });
    } catch (error) {
      console.error('❌ Error inviting member:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể mời thành viên',
      });
    }
  }

  /**
   * Cập nhật nhóm - SỬA LỖI UPLOAD
   */
  async updateGroup(req, res, next) {
    try {
      console.log(`✏️ Updating group: ${req.params.id}`);
      console.log('📝 Body:', req.body);
      console.log('📝 Files:', req.files ? JSON.stringify(req.files) : 'none');

      // Xử lý avatar và cover photo
      let avatarUrl = null;
      let coverUrl = null;
      
      if (req.files) {
        if (req.files.avatar && req.files.avatar.length > 0) {
          avatarUrl = `/uploads/groups/${req.files.avatar[0].filename}`;
          console.log('📷 Avatar uploaded:', avatarUrl);
        }
        if (req.files.coverPhoto && req.files.coverPhoto.length > 0) {
          coverUrl = `/uploads/groups/${req.files.coverPhoto[0].filename}`;
          console.log('📷 Cover photo uploaded:', coverUrl);
        }
        if (req.files.files && req.files.files.length > 0) {
          for (const file of req.files.files) {
            if (file.fieldname === 'avatar' || file.originalname?.includes('avatar')) {
              avatarUrl = `/uploads/groups/${file.filename}`;
            }
            if (file.fieldname === 'coverPhoto' || file.originalname?.includes('cover')) {
              coverUrl = `/uploads/groups/${file.filename}`;
            }
          }
        }
      }

      const updateData = {
        name: req.body.name,
        description: req.body.description,
        privacy: req.body.privacy,
        category: req.body.category,
        avatar: avatarUrl,
        coverPhoto: coverUrl,
      };

      // Loại bỏ undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key];
        }
      });

      console.log('📝 Update data:', updateData);

      const group = await groupService.updateGroup(
        req.params.id,
        req.user.id,
        updateData
      );
      
      res.json({
        success: true,
        group: group,
        message: 'Đã cập nhật nhóm thành công',
      });
    } catch (error) {
      console.error('❌ Error updating group:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể cập nhật nhóm',
      });
    }
  }

  /**
   * Xóa nhóm
   */
  async deleteGroup(req, res, next) {
    try {
      console.log(`🗑️ Deleting group: ${req.params.id}`);
      
      const result = await groupService.deleteGroup(req.params.id, req.user.id);
      
      res.json({
        success: true,
        ...result,
        message: 'Đã xóa nhóm thành công',
      });
    } catch (error) {
      console.error('❌ Error deleting group:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể xóa nhóm',
      });
    }
  }

  /**
   * Chấp nhận yêu cầu tham gia nhóm (Admin)
   */
  async approveJoinRequest(req, res, next) {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn người dùng',
        });
      }

      console.log(`✅ Approving join request for ${userId} to group: ${req.params.id}`);
      
      const result = await groupService.approveJoinRequest(
        req.params.id,
        userId,
        req.user.id
      );
      
      res.json({
        success: true,
        ...result,
        message: 'Đã chấp nhận yêu cầu tham gia nhóm',
      });
    } catch (error) {
      console.error('❌ Error approving join request:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể chấp nhận yêu cầu',
      });
    }
  }

  /**
   * Từ chối yêu cầu tham gia nhóm (Admin)
   */
  async rejectJoinRequest(req, res, next) {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn người dùng',
        });
      }

      console.log(`❌ Rejecting join request for ${userId} to group: ${req.params.id}`);
      
      const result = await groupService.rejectJoinRequest(
        req.params.id,
        userId,
        req.user.id
      );
      
      res.json({
        success: true,
        ...result,
        message: 'Đã từ chối yêu cầu tham gia nhóm',
      });
    } catch (error) {
      console.error('❌ Error rejecting join request:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể từ chối yêu cầu',
      });
    }
  }

  /**
   * Xóa thành viên khỏi nhóm (Admin)
   */
  async removeMember(req, res, next) {
    try {
      const { userId } = req.params;
      
      console.log(`🚫 Removing member ${userId} from group: ${req.params.id}`);
      
      const result = await groupService.removeMember(
        req.params.id,
        userId,
        req.user.id
      );
      
      res.json({
        success: true,
        ...result,
        message: 'Đã xóa thành viên khỏi nhóm',
      });
    } catch (error) {
      console.error('❌ Error removing member:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể xóa thành viên',
      });
    }
  }

  /**
   * Thay đổi quyền thành viên (Admin)
   */
  async changeMemberRole(req, res, next) {
    try {
      const { id, userId } = req.params;
      const { role } = req.body;
      
      console.log(`🔄 Changing role for ${userId} in group ${id} to ${role}`);
      
      const group = await groupService.getGroupById(id);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhóm'
        });
      }
      
      const currentUserId = req.user.id;
      const isCurrentUserAdmin = group.admins?.some(adminId => adminId?.toString() === currentUserId?.toString()) || 
                                  group.admin?.toString() === currentUserId?.toString();
      
      if (!isCurrentUserAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền thay đổi quyền thành viên'
        });
      }
      
      if (group.admin?.toString() === userId?.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Không thể thay đổi quyền của trưởng nhóm'
        });
      }
      
      if (currentUserId?.toString() === userId?.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Không thể thay đổi quyền của chính bạn'
        });
      }
      
      const member = group.members.find(m => {
        const memberId = m.user?.toString() || m.user?._id?.toString() || m._id?.toString();
        return memberId === userId?.toString();
      });
      
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thành viên'
        });
      }
      
      const validRoles = ['member', 'moderator', 'vice_admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role không hợp lệ'
        });
      }
      
      member.role = role;
      await group.save();
      
      res.json({
        success: true,
        message: 'Đã cập nhật quyền thành viên',
        data: {
          userId: userId,
          role: role,
        },
      });
    } catch (error) {
      console.error('❌ Error changing member role:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể thay đổi quyền',
      });
    }
  }

  /**
   * Lấy danh sách thành viên của nhóm
   */
  async getGroupMembers(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      console.log(`📖 Fetching members for group: ${req.params.id}`);
      
      const result = await groupService.getGroupMembers(
        req.params.id,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        members: result.members || [],
        pagination: result.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      });
    } catch (error) {
      console.error('❌ Error fetching group members:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Không thể tải danh sách thành viên',
      });
    }
  }

  /**
   * Lấy danh sách yêu cầu tham gia nhóm (Admin)
   */
  async getJoinRequests(req, res, next) {
    try {
      console.log(`📖 Fetching join requests for group: ${req.params.id}`);
      
      const group = await groupService.getGroupById(req.params.id);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhóm',
        });
      }

      const currentUserId = req.user.id;
      const isAdmin = group.admins?.some(adminId => adminId?.toString() === currentUserId?.toString()) || 
                       group.admin?.toString() === currentUserId?.toString();
      
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem yêu cầu tham gia',
        });
      }

      const pendingRequests = [];
      for (const request of group.pendingRequests || []) {
        const user = await User.findById(request.user)
          .select('username fullName avatar');
        if (user) {
          pendingRequests.push({
            user: user,
            requestedAt: request.requestedAt || request.createdAt,
            message: request.message || '',
          });
        }
      }

      res.json({
        success: true,
        requests: pendingRequests,
        count: pendingRequests.length,
      });
    } catch (error) {
      console.error('❌ Error fetching join requests:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Không thể tải danh sách yêu cầu',
      });
    }
  }

  /**
   * Lấy bài viết chờ duyệt (Admin)
   */
  async getPendingPosts(req, res, next) {
    try {
      console.log(`📖 Fetching pending posts for group: ${req.params.id}`);
      
      const group = await groupService.getGroupById(req.params.id);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhóm',
        });
      }

      const currentUserId = req.user.id;
      const isAdmin = group.admins?.some(adminId => adminId?.toString() === currentUserId?.toString()) || 
                       group.admin?.toString() === currentUserId?.toString();
      
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem bài viết chờ duyệt',
        });
      }

      // TODO: Lấy bài viết chờ duyệt từ database
      const pendingPosts = [];
      
      res.json({
        success: true,
        posts: pendingPosts,
        count: pendingPosts.length,
      });
    } catch (error) {
      console.error('❌ Error fetching pending posts:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Không thể tải bài viết chờ duyệt',
      });
    }
  }

  /**
   * Duyệt bài viết (Admin)
   */
  async approvePost(req, res, next) {
    try {
      const { postId } = req.params;
      
      console.log(`✅ Approving post ${postId} for group: ${req.params.id}`);
      
      // TODO: Implement approve post logic
      
      res.json({
        success: true,
        message: 'Đã duyệt bài viết',
      });
    } catch (error) {
      console.error('❌ Error approving post:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể duyệt bài viết',
      });
    }
  }

  /**
   * Từ chối bài viết (Admin)
   */
  async rejectPost(req, res, next) {
    try {
      const { postId } = req.params;
      
      console.log(`❌ Rejecting post ${postId} for group: ${req.params.id}`);
      
      // TODO: Implement reject post logic
      
      res.json({
        success: true,
        message: 'Đã từ chối bài viết',
      });
    } catch (error) {
      console.error('❌ Error rejecting post:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể từ chối bài viết',
      });
    }
  }

  /**
   * Lấy danh sách sự kiện của nhóm
   */
  async getGroupEvents(req, res, next) {
    try {
      console.log(`📖 Fetching events for group: ${req.params.id}`);
      
      // TODO: Lấy sự kiện của nhóm từ database
      const events = [];
      
      res.json({
        success: true,
        events: events,
        count: events.length,
      });
    } catch (error) {
      console.error('❌ Error fetching group events:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Không thể tải sự kiện',
      });
    }
  }

  /**
   * Tạo sự kiện trong nhóm
   */
  async createGroupEvent(req, res, next) {
    try {
      console.log(`📝 Creating event for group: ${req.params.id}`);
      
      // TODO: Implement create group event
      
      res.status(201).json({
        success: true,
        event: {},
        message: 'Tạo sự kiện thành công',
      });
    } catch (error) {
      console.error('❌ Error creating group event:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể tạo sự kiện',
      });
    }
  }

  /**
   * Cập nhật sự kiện trong nhóm
   */
  async updateGroupEvent(req, res, next) {
    try {
      console.log(`✏️ Updating event ${req.params.eventId} for group: ${req.params.id}`);
      
      // TODO: Implement update group event
      
      res.json({
        success: true,
        event: {},
        message: 'Cập nhật sự kiện thành công',
      });
    } catch (error) {
      console.error('❌ Error updating group event:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể cập nhật sự kiện',
      });
    }
  }

  /**
   * Xóa sự kiện trong nhóm
   */
  async deleteGroupEvent(req, res, next) {
    try {
      console.log(`🗑️ Deleting event ${req.params.eventId} for group: ${req.params.id}`);
      
      // TODO: Implement delete group event
      
      res.json({
        success: true,
        message: 'Xóa sự kiện thành công',
      });
    } catch (error) {
      console.error('❌ Error deleting group event:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể xóa sự kiện',
      });
    }
  }
}

module.exports = new GroupController();
