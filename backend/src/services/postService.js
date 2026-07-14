// ============================================
// FILE: backend/src/services/postService.js
// MÔ TẢ: Dịch vụ quản lý bài viết - THÊM groupId
// ============================================

const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const path = require('path');

class PostService {
  /**
   * Tạo bài viết mới - THÊM groupId
   */
  async createPost(userId, postData) {
    try {
      console.log('📝 Creating post for user:', userId);
      console.log('📝 Media received:', postData.media?.length || 0);
      console.log('📝 Group ID:', postData.groupId);
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      // Xử lý media
      let media = [];
      if (postData.media && Array.isArray(postData.media) && postData.media.length > 0) {
        console.log(`📷 Processing ${postData.media.length} media files`);
        
        for (const item of postData.media) {
          if (item.url) {
            const mediaItem = {
              type: item.type || 'image',
              url: item.url,
              publicId: item.publicId || '',
              metadata: {
                duration: item.duration || 0,
                size: item.size || 0,
              },
              thumbnail: item.thumbnail || item.url,
            };
            media.push(mediaItem);
            console.log(`✅ Added media: ${item.type} - ${item.url}`);
          }
        }
      }

      console.log(`📷 Final media count: ${media.length}`);

      // Tạo bài viết với groupId
      const post = await Post.create({
        author: userId,
        content: postData.content || '',
        media: media,
        type: postData.type || (media.length > 0 && media[0].type === 'video' ? 'video' : 'status'),
        privacy: postData.privacy || 'public',
        feeling: postData.feeling,
        activity: postData.activity,
        location: postData.location,
        with: postData.with,
        lifeEvent: postData.lifeEvent,
        hashtags: postData.hashtags || [],
        mentions: postData.mentions || [],
        audio: postData.audio || null,
        groupId: postData.groupId || null,
      });

      console.log('✅ Post created with ID:', post._id);
      console.log('✅ Post media count:', post.media.length);
      console.log('✅ Post groupId:', post.groupId);

      // Cập nhật thống kê người dùng
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.posts': 1 },
      });

      // Tạo thông báo cho mentions
      if (postData.mentions && postData.mentions.length > 0) {
        for (const mentionId of postData.mentions) {
          if (mentionId.toString() !== userId) {
            await Notification.create({
              recipient: mentionId,
              sender: userId,
              type: 'mention',
              content: `${user.fullName} đã đề cập đến bạn trong một bài viết`,
              contentShort: 'Đề cập trong bài viết',
              relatedId: post._id,
              relatedType: 'post',
              url: `/post/${post._id}`,
              image: user.avatar,
            });
          }
        }
      }

      // Populate dữ liệu trả về
      const populatedPost = await Post.findById(post._id)
        .populate('author', 'username fullName avatar isOnline')
        .populate('with', 'username fullName avatar')
        .populate('mentions', 'username fullName avatar')
        .populate('groupId', 'name avatar');

      return populatedPost;
    } catch (error) {
      console.error('❌ Create post error:', error);
      throw error;
    }
  }

  /**
   * Lấy bài viết trong nhóm
   */
  async getGroupPosts(groupId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const posts = await Post.find({
        groupId: groupId,
        isDeleted: false,
        isApproved: true,
      })
        .populate('author', 'username fullName avatar isOnline')
        .populate('groupId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({
        groupId: groupId,
        isDeleted: false,
        isApproved: true,
      });

      return {
        posts,
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
   * Lấy bài viết trên bảng tin - KHÔNG LẤY BÀI VIẾT NHÓM
   */
  async getNewsFeed(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      const friendIds = user.friends.map(id => id.toString());
      const followingIds = user.following.map(id => id.toString());
      const authorIds = [...new Set([...friendIds, ...followingIds, userId])];

      const posts = await Post.find({
        author: { $in: authorIds },
        isApproved: true,
        isDeleted: false,
        groupId: { $eq: null },
        $or: [
          { author: userId },
          { privacy: 'public' },
          { privacy: 'friends', author: { $in: friendIds } },
          { privacy: 'friends-of-friends' },
          { privacy: 'only-me', author: userId },
        ],
      })
        .populate('author', 'username fullName avatar isOnline')
        .populate('with', 'username fullName avatar')
        .populate('mentions', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({
        author: { $in: authorIds },
        isApproved: true,
        isDeleted: false,
        groupId: { $eq: null },
      });

      return {
        posts,
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
   * Lấy bài viết theo ID
   */
  async getPostById(postId) {
    try {
      const post = await Post.findById(postId)
        .populate('author', 'username fullName avatar')
        .populate('with', 'username fullName avatar')
        .populate('mentions', 'username fullName avatar')
        .populate('groupId', 'name avatar')
        .populate({
          path: 'comments',
          options: { sort: { createdAt: -1 }, limit: 10 },
          populate: {
            path: 'author',
            select: 'username fullName avatar',
          },
        })
        .populate('share.originalPost', 'author content media')
        .populate('share.originalAuthor', 'username fullName avatar');

      if (!post) {
        throw new Error('Bài viết không tồn tại');
      }

      await post.incrementViews();
      return post;
    } catch (error) {
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
        isApproved: true,
      })
        .populate('author', 'username fullName avatar')
        .populate('groupId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({
        author: userId,
        isDeleted: false,
        isApproved: true,
      });

      return {
        posts,
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

  // Cập nhật bài viết
  async updatePost(postId, userId, updateData) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Bài viết không tồn tại');
      }

      if (post.author.toString() !== userId) {
        throw new Error('Không có quyền cập nhật bài viết này');
      }

      const allowedFields = ['content', 'privacy', 'media', 'audio', 'feeling', 'activity', 'location', 'hashtags'];
      
      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        filteredData,
        { new: true, runValidators: true }
      )
        .populate('author', 'username fullName avatar')
        .populate('with', 'username fullName avatar')
        .populate('mentions', 'username fullName avatar')
        .populate('groupId', 'name avatar');

      return updatedPost;
    } catch (error) {
      throw error;
    }
  }

  // Xóa bài viết
  async deletePost(postId, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Bài viết không tồn tại');
      }

      if (post.author.toString() !== userId) {
        throw new Error('Không có quyền xóa bài viết này');
      }

      post.isDeleted = true;
      post.deletedAt = new Date();
      await post.save();

      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.posts': -1 },
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Like bài viết
  async likePost(postId, userId, reaction = 'like') {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Bài viết không tồn tại');
      }

      const existingLike = post.likes.find(
        like => like.user.toString() === userId
      );

      if (existingLike) {
        existingLike.reaction = reaction;
        existingLike.timestamp = new Date();
        await post.save();
        await post.updateStats();
        return { success: true, action: 'updated' };
      }

      post.likes.push({ user: userId, reaction });
      await post.save();
      await post.updateStats();

      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.likes': 1 },
      });

      if (post.author.toString() !== userId) {
        const reactionsMap = {
          like: 'thích',
          love: 'yêu thích',
          haha: 'haha',
          wow: 'ngạc nhiên',
          sad: 'buồn',
          angry: 'phẫn nộ',
        };

        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: 'like',
          content: `đã ${reactionsMap[reaction]} bài viết của bạn`,
          contentShort: 'Phản hồi bài viết',
          relatedId: postId,
          relatedType: 'post',
          url: `/post/${postId}`,
        });
      }

      return { success: true, action: 'added' };
    } catch (error) {
      throw error;
    }
  }

  // Bỏ like bài viết
  async unlikePost(postId, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Bài viết không tồn tại');
      }

      post.likes = post.likes.filter(
        like => like.user.toString() !== userId
      );
      await post.save();
      await post.updateStats();

      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.likes': -1 },
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Bình luận bài viết
  async commentOnPost(postId, userId, content, parentCommentId = null, media = null) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Bài viết không tồn tại');
      }

      let mediaData = [];
      if (media && media.length > 0) {
        for (const file of media) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'comments',
            resource_type: 'auto',
          });
          mediaData.push({
            type: file.mimetype.startsWith('video') ? 'video' : 'image',
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }

      const comment = await Comment.create({
        post: postId,
        author: userId,
        content,
        media: mediaData,
        parentComment: parentCommentId || null,
      });

      post.comments.push(comment._id);
      await post.save();
      await post.updateStats();

      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.comments': 1 },
      });

      if (parentCommentId) {
        await Comment.findByIdAndUpdate(parentCommentId, {
          $push: { replies: comment._id },
        });
      }

      if (post.author.toString() !== userId) {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: 'comment',
          content: `đã bình luận: "${content.substring(0, 100)}..."`,
          contentShort: 'Bình luận mới',
          relatedId: postId,
          relatedType: 'post',
          url: `/post/${postId}`,
        });
      }

      const populatedComment = await Comment.findById(comment._id)
        .populate('author', 'username fullName avatar');

      return populatedComment;
    } catch (error) {
      throw error;
    }
  }

  // Xóa bình luận
  async deleteComment(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new Error('Bình luận không tồn tại');
      }

      const post = await Post.findById(comment.post);
      if (comment.author.toString() !== userId && post.author.toString() !== userId) {
        throw new Error('Không có quyền xóa bình luận này');
      }

      comment.isDeleted = true;
      comment.deletedAt = new Date();
      await comment.save();

      await Post.findByIdAndUpdate(comment.post, {
        $inc: { 'stats.comments': -1 },
      });
      await User.findByIdAndUpdate(comment.author, {
        $inc: { 'stats.comments': -1 },
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Chia sẻ bài viết
  async sharePost(postId, userId, customMessage = null) {
    try {
      const originalPost = await Post.findById(postId);
      if (!originalPost) {
        throw new Error('Bài viết không tồn tại');
      }

      const sharedPost = await Post.create({
        author: userId,
        content: customMessage || '',
        type: 'share',
        privacy: originalPost.privacy,
        share: {
          originalPost: postId,
          originalAuthor: originalPost.author,
          customMessage: customMessage,
        },
        groupId: originalPost.groupId || null,
      });

      originalPost.shares.push({ user: userId });
      await originalPost.save();
      await originalPost.updateStats();

      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.shares': 1 },
      });

      if (originalPost.author.toString() !== userId) {
        await Notification.create({
          recipient: originalPost.author,
          sender: userId,
          type: 'share',
          content: `đã chia sẻ bài viết của bạn`,
          contentShort: 'Chia sẻ bài viết',
          relatedId: postId,
          relatedType: 'post',
          url: `/post/${sharedPost._id}`,
        });
      }

      const populatedPost = await Post.findById(sharedPost._id)
        .populate('author', 'username fullName avatar')
        .populate('share.originalPost', 'author content media')
        .populate('share.originalAuthor', 'username fullName avatar')
        .populate('groupId', 'name avatar');

      return populatedPost;
    } catch (error) {
      throw error;
    }
  }

  // Ghim bài viết
  async pinPost(postId, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Bài viết không tồn tại');
      }

      if (post.author.toString() !== userId) {
        throw new Error('Không có quyền ghim bài viết này');
      }

      await Post.updateMany(
        { author: userId, isPinned: true },
        { isPinned: false }
      );

      post.isPinned = true;
      await post.save();

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Bỏ ghim bài viết
  async unpinPost(postId, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Bài viết không tồn tại');
      }

      if (post.author.toString() !== userId) {
        throw new Error('Không có quyền bỏ ghim bài viết này');
      }

      post.isPinned = false;
      await post.save();

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Lấy bài viết theo hashtag
  async getPostsByHashtag(hashtag, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const posts = await Post.find({
        hashtags: { $in: [hashtag] },
        isApproved: true,
        isDeleted: false,
      })
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({
        hashtags: { $in: [hashtag] },
        isApproved: true,
        isDeleted: false,
      });

      return {
        posts,
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

  // Báo cáo bài viết
  async reportPost(postId, userId, reason, description = '') {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Bài viết không tồn tại');
      }

      const alreadyReported = post.reports.some(
        report => report.user.toString() === userId
      );

      if (alreadyReported) {
        throw new Error('Bạn đã báo cáo bài viết này rồi');
      }

      post.reports.push({
        user: userId,
        reason,
        description,
        timestamp: new Date(),
      });

      post.reportCount = post.reports.length;
      post.isReported = true;

      await post.save();

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PostService();