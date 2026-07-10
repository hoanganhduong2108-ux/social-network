// ============================================
// FILE: backend/src/controllers/adminController.js
// MÔ TẢ: Controller quản trị hệ thống
// ============================================

const User = require('../models/User');
const Post = require('../models/Post');
const Group = require('../models/Group');
const Page = require('../models/Page');
const Event = require('../models/Event');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const { generateToken } = require('../utils/jwt');

class AdminController {
  /**
   * Đăng nhập admin
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin đăng nhập',
        });
      }

      const admin = await Admin.findOne({ username }).select('+password');
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản admin không tồn tại',
        });
      }

      const isMatch = await admin.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Mật khẩu không chính xác',
        });
      }

      if (!admin.isActive || admin.isBanned) {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản admin đã bị khóa',
        });
      }

      // Cập nhật lần đăng nhập cuối
      admin.lastLogin = new Date();
      admin.loginCount += 1;
      admin.ipAddresses.push(req.ip);
      await admin.save();

      const token = generateToken({ id: admin._id, role: 'admin' });

      const adminResponse = admin.toObject();
      delete adminResponse.password;

      res.json({
        success: true,
        admin: adminResponse,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo admin mới (chỉ super admin)
   */
  async createAdmin(req, res, next) {
    try {
      const { username, email, password, fullName, role, permissions } = req.body;

      // Kiểm tra admin hiện tại có phải super admin không
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ Super Admin mới có quyền tạo admin mới',
        });
      }

      const existingAdmin = await Admin.findOne({
        $or: [{ email }, { username }],
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập hoặc email đã tồn tại',
        });
      }

      const admin = await Admin.create({
        username,
        email,
        password,
        fullName,
        role: role || 'admin',
        permissions: permissions || {},
      });

      const adminResponse = admin.toObject();
      delete adminResponse.password;

      res.status(201).json({
        success: true,
        admin: adminResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách admin
   */
  async getAdmins(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const admins = await Admin.find({ isDeleted: false })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Admin.countDocuments({ isDeleted: false });

      res.json({
        success: true,
        admins,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật admin
   */
  async updateAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const { fullName, role, permissions, isActive } = req.body;

      if (req.user.role !== 'super_admin' && req.user._id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền cập nhật admin này',
        });
      }

      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin không tồn tại',
        });
      }

      // Không cho phép thay đổi super admin
      if (admin.role === 'super_admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Không thể thay đổi Super Admin',
        });
      }

      admin.fullName = fullName || admin.fullName;
      admin.role = role || admin.role;
      admin.permissions = permissions || admin.permissions;
      if (typeof isActive === 'boolean') {
        admin.isActive = isActive;
      }

      await admin.save();

      const adminResponse = admin.toObject();
      delete adminResponse.password;

      res.json({
        success: true,
        admin: adminResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa admin
   */
  async deleteAdmin(req, res, next) {
    try {
      const { id } = req.params;

      if (req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ Super Admin mới có quyền xóa admin',
        });
      }

      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin không tồn tại',
        });
      }

      if (admin.role === 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Không thể xóa Super Admin',
        });
      }

      admin.isDeleted = true;
      admin.deletedAt = new Date();
      await admin.save();

      res.json({
        success: true,
        message: 'Đã xóa admin',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thống kê tổng quan
   */
  async getStats(req, res, next) {
    try {
      const [
        totalUsers,
        activeUsers,
        totalPosts,
        totalGroups,
        totalPages,
        totalEvents,
        pendingReports,
        recentActivities,
      ] = await Promise.all([
        User.countDocuments({ isDeleted: false }),
        User.countDocuments({ isActive: true, isBanned: false }),
        Post.countDocuments({ isDeleted: false }),
        Group.countDocuments({ isDeleted: false }),
        Page.countDocuments({ isDeleted: false }),
        Event.countDocuments({ isDeleted: false }),
        Post.countDocuments({ isReported: true, isApproved: true }),
        // Lấy 10 hoạt động gần nhất
        Post.find({ isDeleted: false })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('author', 'fullName username'),
      ]);

      res.json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          totalPosts,
          totalGroups,
          totalPages,
          totalEvents,
          pendingReports,
          recentActivities: recentActivities.map(post => ({
            description: `${post.author?.fullName || 'Người dùng'} đã đăng bài viết mới`,
            time: post.createdAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách người dùng (cho admin)
   */
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = { isDeleted: false };
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Khóa/Mở khóa người dùng
   */
  async toggleBanUser(req, res, next) {
    try {
      const { id } = req.params;
      const { isBanned, banReason } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại',
        });
      }

      user.isBanned = isBanned;
      user.banReason = isBanned ? banReason || 'Vi phạm điều khoản' : '';
      await user.save();

      // Gửi thông báo cho người dùng
      await Notification.create({
        recipient: id,
        type: 'system',
        content: isBanned
          ? `Tài khoản của bạn đã bị khóa. Lý do: ${user.banReason}`
          : 'Tài khoản của bạn đã được mở khóa',
        contentShort: isBanned ? 'Tài khoản bị khóa' : 'Tài khoản được mở khóa',
      });

      res.json({
        success: true,
        message: isBanned ? 'Đã khóa người dùng' : 'Đã mở khóa người dùng',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa người dùng (mềm)
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại',
        });
      }

      user.isDeleted = true;
      user.deletedAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Đã xóa người dùng',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách bài viết (cho admin)
   */
  async getPosts(req, res, next) {
    try {
      const { page = 1, limit = 20, status = 'all' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = { isDeleted: false };
      if (status === 'reported') {
        query.isReported = true;
      } else if (status === 'pending') {
        query.isApproved = false;
      }

      const posts = await Post.find(query)
        .populate('author', 'fullName username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Post.countDocuments(query);

      res.json({
        success: true,
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Duyệt bài viết
   */
  async approvePost(req, res, next) {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Bài viết không tồn tại',
        });
      }

      post.isApproved = isApproved;
      await post.save();

      // Gửi thông báo cho tác giả
      await Notification.create({
        recipient: post.author,
        type: isApproved ? 'post_approved' : 'post_rejected',
        content: isApproved
          ? 'Bài viết của bạn đã được duyệt'
          : 'Bài viết của bạn đã bị từ chối',
        contentShort: isApproved ? 'Bài viết được duyệt' : 'Bài viết bị từ chối',
        relatedId: id,
        relatedType: 'post',
      });

      res.json({
        success: true,
        message: isApproved ? 'Đã duyệt bài viết' : 'Đã từ chối bài viết',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa bài viết (admin)
   */
  async deletePost(req, res, next) {
    try {
      const { id } = req.params;

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Bài viết không tồn tại',
        });
      }

      post.isDeleted = true;
      post.deletedAt = new Date();
      await post.save();

      res.json({
        success: true,
        message: 'Đã xóa bài viết',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách báo cáo
   */
  async getReports(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const posts = await Post.find({
        isReported: true,
        isDeleted: false,
        reports: { $exists: true, $not: { $size: 0 } },
      })
        .populate('author', 'fullName username avatar')
        .populate('reports.user', 'fullName username')
        .sort({ reportCount: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Post.countDocuments({
        isReported: true,
        isDeleted: false,
      });

      res.json({
        success: true,
        reports: posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xử lý báo cáo
   */
  async handleReport(req, res, next) {
    try {
      const { id } = req.params;
      const { action } = req.body;

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Bài viết không tồn tại',
        });
      }

      if (action === 'ignore') {
        post.isReported = false;
        post.reports = [];
        post.reportCount = 0;
      } else if (action === 'delete') {
        post.isDeleted = true;
        post.deletedAt = new Date();
      } else if (action === 'warn') {
        post.isReported = false;
        // Gửi cảnh báo cho tác giả
        await Notification.create({
          recipient: post.author,
          type: 'system',
          content: 'Bài viết của bạn đã bị cảnh báo vì vi phạm điều khoản',
          contentShort: 'Cảnh báo bài viết',
        });
      }

      await post.save();

      res.json({
        success: true,
        message: 'Đã xử lý báo cáo',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy cài đặt hệ thống
   */
  async getSettings(req, res, next) {
    try {
      // TODO: Lấy từ database settings
      const settings = {
        siteName: 'Social Network',
        siteDescription: 'Mạng xã hội kết nối mọi người',
        maintenance: false,
        registrationEnabled: true,
        maxPostLength: 50000,
        maxImageSize: 10, // MB
        maxVideoSize: 100, // MB
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
      };

      res.json({
        success: true,
        settings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật cài đặt hệ thống
   */
  async updateSettings(req, res, next) {
    try {
      // TODO: Lưu vào database settings
      const settings = req.body;

      res.json({
        success: true,
        message: 'Đã cập nhật cài đặt',
        settings,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();