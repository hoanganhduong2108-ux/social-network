// ============================================
// FILE: backend/src/services/userService.js
// MÔ TẢ: Dịch vụ quản lý người dùng - SỬA LỖI KẾT BẠN
// ============================================

const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');

class UserService {
  /**
   * Lấy thông tin người dùng theo ID
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId)
        .select('-password -__v')
        .populate('friends', 'username fullName avatar isOnline lastSeen')
        .populate('followers', 'username fullName avatar')
        .populate('following', 'username fullName avatar');

      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin người dùng theo username
   */
  async getUserByUsername(username) {
    try {
      const user = await User.findOne({ username })
        .select('-password -__v')
        .populate('friends', 'username fullName avatar isOnline')
        .populate('followers', 'username fullName avatar')
        .populate('following', 'username fullName avatar');

      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async updateUser(userId, updateData) {
    try {
      const allowedFields = [
        'fullName', 'bio', 'gender', 'birthday', 'phone',
        'location', 'education', 'work', 'socialLinks', 'privacy'
      ];

      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        filteredData,
        { new: true, runValidators: true }
      ).select('-password -__v');

      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật ảnh đại diện
   */
  async updateAvatar(userId, file) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'avatars',
        width: 500,
        height: 500,
        crop: 'fill',
      });

      user.avatar = result.secure_url;
      await user.save();

      return user.avatar;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật ảnh bìa
   */
  async updateCoverPhoto(userId, file) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'covers',
        width: 1500,
        height: 500,
        crop: 'fill',
      });

      user.coverPhoto = result.secure_url;
      await user.save();

      return user.coverPhoto;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ============================================
   * GỬI LỜI MỜI KẾT BẠN - SỬA LỖI
   * ============================================
   */
  async sendFriendRequest(currentUserId, targetUserId) {
    try {
      // Kiểm tra ID hợp lệ
      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        throw new Error('ID người dùng không hợp lệ');
      }

      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(targetUserId);

      if (!currentUser || !targetUser) {
        throw new Error('Người dùng không tồn tại');
      }

      // Kiểm tra đã là bạn bè - dùng toString() để so sánh đúng ObjectId vs string
      const targetIdStr = targetUserId.toString();
      if (currentUser.friends.some(id => id.toString() === targetIdStr)) {
        throw new Error('Đã là bạn bè');
      }

      // Kiểm tra đã gửi lời mời - dùng toString()
      if (currentUser.friendRequests.sent.some(id => id.toString() === targetIdStr)) {
        throw new Error('Đã gửi lời mời kết bạn');
      }

      // Kiểm tra đã nhận lời mời (nếu có thì tự động accept) - dùng toString()
      if (currentUser.friendRequests.received.some(id => id.toString() === targetIdStr)) {
        return await this.acceptFriendRequest(currentUserId, targetUserId);
      }

      // Gửi lời mời - sử dụng $addToSet để tránh duplicate
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { 'friendRequests.sent': targetUserId }
      });

      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { 'friendRequests.received': currentUserId }
      });

      // Tạo thông báo cho người nhận
      await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'friend_request',
        content: `${currentUser.fullName} đã gửi lời mời kết bạn`,
        contentShort: 'Lời mời kết bạn mới',
        relatedId: currentUserId,
        relatedType: 'user',
        url: `/profile/${currentUser.username}`,
        image: currentUser.avatar,
      });

      return { 
        success: true, 
        message: 'Đã gửi lời mời kết bạn',
        data: {
          senderId: currentUserId,
          receiverId: targetUserId,
          senderName: currentUser.fullName,
        }
      };
    } catch (error) {
      console.error('Send friend request error:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * CHẤP NHẬN LỜI MỜI KẾT BẠN - SỬA LỖI
   * ============================================
   */
  async acceptFriendRequest(currentUserId, targetUserId) {
    try {
      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(targetUserId);

      if (!currentUser || !targetUser) {
        throw new Error('Người dùng không tồn tại');
      }

      // Kiểm tra lời mời tồn tại - dùng toString() để so sánh đúng
      const targetIdStr = targetUserId.toString();
      const hasRequest = currentUser.friendRequests.received.some(id => id.toString() === targetIdStr);
      if (!hasRequest) {
        throw new Error('Không có lời mời kết bạn');
      }

      // Chấp nhận kết bạn - thêm vào danh sách friends
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { friends: targetUserId },
        $pull: { 'friendRequests.received': targetUserId }
      });

      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { friends: currentUserId },
        $pull: { 'friendRequests.sent': currentUserId }
      });

      // Tạo thông báo cho người gửi
      await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'friend_accept',
        content: `${currentUser.fullName} đã chấp nhận lời mời kết bạn`,
        contentShort: 'Đã chấp nhận kết bạn',
        relatedId: currentUserId,
        relatedType: 'user',
        url: `/profile/${currentUser.username}`,
        image: currentUser.avatar,
      });

      return { 
        success: true, 
        message: 'Đã chấp nhận kết bạn',
        data: {
          userId: currentUserId,
          friendId: targetUserId,
        }
      };
    } catch (error) {
      console.error('Accept friend request error:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * TỪ CHỐI LỜI MỜI KẾT BẠN
   * ============================================
   */
  async rejectFriendRequest(currentUserId, targetUserId) {
    try {
      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(targetUserId);

      if (!currentUser || !targetUser) {
        throw new Error('Người dùng không tồn tại');
      }

      await User.findByIdAndUpdate(currentUserId, {
        $pull: { 'friendRequests.received': targetUserId }
      });

      await User.findByIdAndUpdate(targetUserId, {
        $pull: { 'friendRequests.sent': currentUserId }
      });

      return { success: true, message: 'Đã từ chối lời mời' };
    } catch (error) {
      console.error('Reject friend request error:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * HỦY KẾT BẠN
   * ============================================
   */
  async unfriend(currentUserId, targetUserId) {
    try {
      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(targetUserId);

      if (!currentUser || !targetUser) {
        throw new Error('Người dùng không tồn tại');
      }

      await User.findByIdAndUpdate(currentUserId, {
        $pull: { friends: targetUserId }
      });

      await User.findByIdAndUpdate(targetUserId, {
        $pull: { friends: currentUserId }
      });

      return { success: true, message: 'Đã hủy kết bạn' };
    } catch (error) {
      console.error('Unfriend error:', error);
      throw error;
    }
  }

  /**
   * Theo dõi người dùng
   */
  async followUser(currentUserId, targetUserId) {
    try {
      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(targetUserId);

      if (!currentUser || !targetUser) {
        throw new Error('Người dùng không tồn tại');
      }

      if (currentUser.following.includes(targetUserId)) {
        throw new Error('Đã theo dõi người này');
      }

      await User.findByIdAndUpdate(currentUserId, {
        $push: { following: targetUserId }
      });

      await User.findByIdAndUpdate(targetUserId, {
        $push: { followers: currentUserId }
      });

      return { success: true };
    } catch (error) {
      console.error('Follow user error:', error);
      throw error;
    }
  }

  /**
   * Bỏ theo dõi người dùng
   */
  async unfollowUser(currentUserId, targetUserId) {
    try {
      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(targetUserId);

      if (!currentUser || !targetUser) {
        throw new Error('Người dùng không tồn tại');
      }

      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId }
      });

      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId }
      });

      return { success: true };
    } catch (error) {
      console.error('Unfollow user error:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * TÌM KIẾM NGƯỜI DÙNG - SỬA LỖI HIỂN THỊ BẠN BÈ
   * ============================================
   */
  async searchUsers(query, userId, page = 1, limit = 20, location = null, gender = null) {
    try {
      const skip = (page - 1) * limit;

      if (!query || query.trim().length < 2) {
        return {
          users: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0,
          },
        };
      }

      const searchRegex = new RegExp(query.trim(), 'i');
      
      const matchQuery = {
        $or: [
          { username: { $regex: searchRegex } },
          { fullName: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ],
        isActive: true,
        isBanned: false,
        isDeleted: false,
      };

      if (location && location.trim()) {
        matchQuery['location.city'] = { $regex: new RegExp(location.trim(), 'i') };
      }

      if (gender && gender !== 'all') {
        matchQuery.gender = gender;
      }

      // Lấy user hiện tại để kiểm tra bạn bè
      const currentUser = await User.findById(userId).select('friends friendRequests');
      const friendIds = currentUser ? currentUser.friends.map(id => id.toString()) : [];
      const sentRequestIds = currentUser ? currentUser.friendRequests.sent.map(id => id.toString()) : [];

      const users = await User.find(matchQuery)
        .select('username fullName avatar bio isOnline lastSeen createdAt location gender')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Thêm thông tin trạng thái bạn bè
      const usersWithStatus = users.map(user => {
        const userIdStr = user._id.toString();
        const isFriend = friendIds.includes(userIdStr);
        const requestSent = sentRequestIds.includes(userIdStr);
        const isCurrentUser = userIdStr === userId;
        
        return {
          ...user.toObject(),
          isFriend,
          requestSent,
          isCurrentUser,
        };
      });

      const total = await User.countDocuments(matchQuery);

      return {
        users: usersWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      console.error('Search users service error:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * LẤY DANH SÁCH BẠN BÈ - SỬA LỖI
   * ============================================
   */
  async getFriends(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const user = await User.findById(userId)
        .populate({
          path: 'friends',
          select: 'username fullName avatar bio isOnline lastSeen createdAt location',
          match: { 
            isActive: true, 
            isBanned: false,
            isDeleted: false,
          },
        });

      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      let friends = user.friends || [];
      const total = friends.length;
      const paginatedFriends = friends.slice(skip, skip + parseInt(limit));

      return {
        friends: paginatedFriends,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      console.error('Get friends error:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * LẤY DANH SÁCH LỜI MỜI KẾT BẠN - SỬA LỖI
   * ============================================
   */
  async getFriendRequests(userId) {
    try {
      const user = await User.findById(userId)
        .populate({
          path: 'friendRequests.received',
          select: 'username fullName avatar bio isOnline createdAt location',
          match: {
            isActive: true,
            isBanned: false,
            isDeleted: false,
          },
        });

      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      // Lọc và format lại dữ liệu
      const requests = user.friendRequests.received
        .filter(request => request && request._id)
        .map(request => ({
          _id: request._id,
          sender: {
            _id: request._id,
            username: request.username,
            fullName: request.fullName,
            avatar: request.avatar,
            bio: request.bio,
            isOnline: request.isOnline,
            createdAt: request.createdAt,
          },
          createdAt: request.createdAt || new Date(),
        }));

      return requests;
    } catch (error) {
      console.error('Get friend requests error:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * ĐỀ XUẤT BẠN BÈ
   * ============================================
   */
  async getFriendSuggestions(userId, limit = 10) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      const friendIds = user.friends.map(id => id.toString());
      const sentRequests = user.friendRequests.sent.map(id => id.toString());
      const receivedRequests = user.friendRequests.received.map(id => id.toString());
      
      const excludedIds = [...friendIds, ...sentRequests, ...receivedRequests, userId];

      const suggestions = await User.aggregate([
        {
          $match: {
            _id: { $nin: excludedIds.map(id => new mongoose.Types.ObjectId(id)) },
            isActive: true,
            isBanned: false,
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'friends',
            foreignField: '_id',
            as: 'mutualFriends',
          },
        },
        {
          $addFields: {
            mutualCount: {
              $size: {
                $filter: {
                  input: '$mutualFriends',
                  as: 'friend',
                  cond: { $in: ['$$friend._id', user.friends] },
                },
              },
            },
          },
        },
        {
          $sort: { mutualCount: -1, createdAt: -1 },
        },
        {
          $limit: limit,
        },
        {
          $project: {
            username: 1,
            fullName: 1,
            avatar: 1,
            bio: 1,
            mutualCount: 1,
            isOnline: 1,
          },
        },
      ]);

      return suggestions;
    } catch (error) {
      console.error('Get friend suggestions error:', error);
      throw error;
    }
  }

  /**
   * Lấy bài viết của người dùng
   */
  async getUserPosts(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const posts = await Post.find({
        author: userId,
        isDeleted: false,
      })
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({
        author: userId,
        isDeleted: false,
      });

      return {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      console.error('Get user posts error:', error);
      throw error;
    }
  }
}

module.exports = new UserService();