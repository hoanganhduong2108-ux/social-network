const Page = require('../models/Page');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Dịch vụ quản lý trang
 */
class PageService {
  /**
   * Tạo trang mới
   */
  async createPage(userId, pageData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      // Tạo username từ tên
      const username = pageData.username || pageData.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Tạo trang
      const page = await Page.create({
        ...pageData,
        username,
        owner: userId,
        admins: [userId],
        stats: { followers: 0 },
      });

      return page;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin trang
   */
  async getPageById(pageId) {
    try {
      const page = await Page.findById(pageId)
        .populate('owner', 'username fullName avatar')
        .populate('admins', 'username fullName avatar')
        .populate('editors', 'username fullName avatar')
        .populate('moderators', 'username fullName avatar')
        .populate('followers.user', 'username fullName avatar')
        .populate('pinnedPosts', 'author content media createdAt')
        .populate('events', 'title startTime endTime');

      if (!page) {
        throw new Error('Trang không tồn tại');
      }

      return page;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách trang của người dùng
   */
  async getUserPages(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const pages = await Page.find({
        $or: [
          { owner: userId },
          { admins: userId },
        ],
        isDeleted: false,
      })
        .populate('owner', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Page.countDocuments({
        $or: [
          { owner: userId },
          { admins: userId },
        ],
        isDeleted: false,
      });

      return {
        pages,
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
   * Theo dõi trang
   */
  async followPage(pageId, userId) {
    try {
      const page = await Page.findById(pageId);
      if (!page) {
        throw new Error('Trang không tồn tại');
      }

      if (page.followers.some(f => f.user.toString() === userId)) {
        throw new Error('Đã theo dõi trang này');
      }

      await page.addFollower(userId);

      // Thông báo cho admin
      for (const adminId of page.admins) {
        await Notification.create({
          recipient: adminId,
          sender: userId,
          type: 'page_like',
          content: `Có người theo dõi trang ${page.name}`,
          contentShort: 'Theo dõi trang mới',
          relatedId: pageId,
          relatedType: 'page',
          url: `/pages/${pageId}`,
        });
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bỏ theo dõi trang
   */
  async unfollowPage(pageId, userId) {
    try {
      const page = await Page.findById(pageId);
      if (!page) {
        throw new Error('Trang không tồn tại');
      }

      await page.removeFollower(userId);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật trang
   */
  async updatePage(pageId, userId, updateData) {
    try {
      const page = await Page.findById(pageId);
      if (!page) {
        throw new Error('Trang không tồn tại');
      }

      if (!page.admins.includes(userId) && page.owner.toString() !== userId) {
        throw new Error('Không có quyền cập nhật trang');
      }

      const allowedFields = [
        'name', 'description', 'avatar', 'coverPhoto', 'category',
        'subcategory', 'contact', 'hours', 'settings'
      ];

      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      const updatedPage = await Page.findByIdAndUpdate(
        pageId,
        filteredData,
        { new: true, runValidators: true }
      );

      return updatedPage;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Thêm đánh giá cho trang
   */
  async addReview(pageId, userId, rating, content, images = []) {
    try {
      const page = await Page.findById(pageId);
      if (!page) {
        throw new Error('Trang không tồn tại');
      }

      const review = {
        user: userId,
        rating,
        content,
        images,
        createdAt: new Date(),
        isApproved: false,
      };

      page.reviews.push(review);
      
      // Cập nhật thống kê
      const totalRating = page.reviews.reduce((sum, r) => sum + r.rating, 0);
      page.stats.averageRating = totalRating / page.reviews.length;
      page.stats.reviews = page.reviews.length;
      
      await page.save();

      return review;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PageService();