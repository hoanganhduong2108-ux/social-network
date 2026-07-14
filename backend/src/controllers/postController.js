// ============================================
// FILE: backend/src/controllers/postController.js
// MÔ TẢ: Controller quản lý bài viết - THÊM GROUP ID
// ============================================

const postService = require('../services/postService');
const { validationResult } = require('express-validator');

class PostController {
  // Tạo bài viết mới - THÊM groupId
  async createPost(req, res, next) {
    try {
      console.log('📝 Creating post...');
      console.log('📝 User:', req.user.id);
      console.log('📝 Body:', req.body);
      console.log('📝 Files:', req.files ? req.files.length : 0);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      // Xử lý media từ body
      let mediaData = [];
      if (req.body.media) {
        try {
          let parsedMedia = req.body.media;
          if (typeof req.body.media === 'string') {
            parsedMedia = JSON.parse(req.body.media);
          }
          if (Array.isArray(parsedMedia) && parsedMedia.length > 0) {
            mediaData = parsedMedia.map(item => ({
              type: item.type || 'image',
              url: item.url,
              publicId: item.publicId || '',
              duration: item.duration || 0,
              size: item.size || 0,
            }));
            console.log(`📷 Media from body: ${mediaData.length} items`);
          }
        } catch (e) {
          console.error('❌ Error parsing media from body:', e.message);
        }
      }

      // Nếu không có media từ body, lấy từ files upload
      if (mediaData.length === 0 && req.files && req.files.length > 0) {
        mediaData = req.files.map(file => ({
          type: file.mimetype?.startsWith('video') ? 'video' : 'image',
          url: `/uploads/${file.mimetype?.startsWith('video') ? 'videos' : 'images'}/${file.filename}`,
          publicId: file.filename,
          duration: 0,
          size: file.size,
        }));
      }

      // Xử lý audio
      let audioData = null;
      if (req.body.audio) {
        try {
          audioData = typeof req.body.audio === 'string' 
            ? JSON.parse(req.body.audio) 
            : req.body.audio;
        } catch (e) {
          console.error('❌ Error parsing audio:', e.message);
        }
      }

      // ============================================
      // LẤY groupId TỪ BODY NẾU CÓ
      // ============================================
      const groupId = req.body.groupId || null;

      const postData = {
        content: req.body.content || '',
        media: mediaData,
        privacy: req.body.privacy || 'public',
        audio: audioData,
        feeling: req.body.feeling,
        activity: req.body.activity,
        location: req.body.location,
        with: req.body.with,
        hashtags: req.body.hashtags || [],
        mentions: req.body.mentions || [],
        type: req.body.type || (mediaData.length > 0 && mediaData[0].type === 'video' ? 'video' : 'status'),
        groupId: groupId,
      };

      console.log('📝 Post data:', JSON.stringify(postData, null, 2));

      const post = await postService.createPost(req.user.id, postData);
      
      console.log('✅ Post created:', post._id);
      console.log('✅ Post groupId:', post.groupId);

      res.status(201).json({
        success: true,
        post: post,
        message: 'Bài viết đã được tạo thành công',
      });
    } catch (error) {
      console.error('❌ Create post error:', error);
      next(error);
    }
  }

  /**
   * Lấy bài viết trong nhóm
   */
  async getGroupPosts(req, res, next) {
    try {
      const { groupId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      console.log(`📖 Fetching posts for group: ${groupId}`);
      
      const result = await postService.getGroupPosts(
        groupId,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        posts: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('❌ Error fetching group posts:', error);
      next(error);
    }
  }

  // Lấy bài viết theo ID
  async getPostById(req, res, next) {
    try {
      const post = await postService.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Bài viết không tồn tại',
        });
      }
      res.json({ success: true, post });
    } catch (error) {
      next(error);
    }
  }

  // Lấy bài viết của người dùng
  async getUserPosts(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      console.log(`📖 Fetching posts for user: ${userId}`);
      
      const result = await postService.getUserPosts(
        userId,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        posts: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('❌ Error fetching user posts:', error);
      next(error);
    }
  }

  // Lấy bảng tin - KHÔNG LẤY BÀI VIẾT NHÓM
  async getNewsFeed(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      console.log(`📖 Fetching news feed for user: ${req.user.id}`);
      
      const result = await postService.getNewsFeed(
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );
      
      console.log(`📖 Found ${result.posts.length} posts`);
      
      res.json({
        success: true,
        posts: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('❌ Error fetching news feed:', error);
      next(error);
    }
  }

  // Cập nhật bài viết
  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { content, media, privacy, audio } = req.body;

      const post = await postService.getPostById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Bài viết không tồn tại',
        });
      }

      if (post.author._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa bài viết này',
        });
      }

      const updateData = {};
      if (content !== undefined) updateData.content = content;
      if (privacy !== undefined) updateData.privacy = privacy;
      if (media !== undefined) updateData.media = media;
      if (audio !== undefined) updateData.audio = audio;

      const updatedPost = await postService.updatePost(id, userId, updateData);
      
      res.json({
        success: true,
        post: updatedPost,
        message: 'Đã cập nhật bài viết thành công',
      });
    } catch (error) {
      console.error('Update post error:', error);
      next(error);
    }
  }

  // Xóa bài viết
  async deletePost(req, res, next) {
    try {
      const result = await postService.deletePost(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Like bài viết
  async likePost(req, res, next) {
    try {
      const { reaction } = req.body;
      const result = await postService.likePost(
        req.params.id,
        req.user.id,
        reaction || 'like'
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Bỏ like bài viết
  async unlikePost(req, res, next) {
    try {
      const result = await postService.unlikePost(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Bình luận bài viết
  async commentOnPost(req, res, next) {
    try {
      const { content, parentCommentId } = req.body;
      const media = req.files || [];

      const comment = await postService.commentOnPost(
        req.params.id,
        req.user.id,
        content,
        parentCommentId,
        media
      );

      res.status(201).json({ success: true, comment });
    } catch (error) {
      next(error);
    }
  }

  // Xóa bình luận
  async deleteComment(req, res, next) {
    try {
      const result = await postService.deleteComment(
        req.params.commentId,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Chia sẻ bài viết
  async sharePost(req, res, next) {
    try {
      const { customMessage } = req.body;
      const post = await postService.sharePost(
        req.params.id,
        req.user.id,
        customMessage
      );
      res.status(201).json({ success: true, post });
    } catch (error) {
      next(error);
    }
  }

  // Ghim bài viết
  async pinPost(req, res, next) {
    try {
      const result = await postService.pinPost(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Bỏ ghim bài viết
  async unpinPost(req, res, next) {
    try {
      const result = await postService.unpinPost(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();