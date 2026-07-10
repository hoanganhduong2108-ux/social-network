// ============================================
// FILE: backend/src/controllers/storyController.js
// MÔ TẢ: Controller Story - HOÀN CHỈNH
// ============================================

const Story = require('../models/Story');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

class StoryController {
  // ============================================
  // LẤY DANH SÁCH STORIES
  // ============================================
  async getStories(req, res, next) {
    try {
      console.log('📖 Fetching stories...');
      
      const stories = await Story.find({
        isDeleted: false,
        expiresAt: { $gt: new Date() },
      })
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .limit(20);

      console.log(`📖 Found ${stories.length} stories`);

      res.json({
        success: true,
        stories: stories,
      });
    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi lấy stories',
      });
    }
  }

  // ============================================
  // TẠO STORY MỚI
  // ============================================
  async createStory(req, res, next) {
    try {
      console.log('📝 Creating story...');
      console.log('📝 User:', req.user.id);
      console.log('📝 Body:', req.body);
      console.log('📝 Files:', req.files ? req.files.length : 'none');

      const { content, backgroundColor, privacy, audio, displayDuration } = req.body;

      // Xử lý media từ files upload (multer)
      let mediaData = [];
      if (req.files && req.files.length > 0) {
        mediaData = req.files.map(file => {
          const fileUrl = `/uploads/${file.mimetype.startsWith('image/') ? 'images' : 'videos'}/${path.basename(file.path)}`;
          const fileType = file.mimetype.startsWith('video/') ? 'video' : 'image';
          return {
            type: fileType,
            url: fileUrl,
            publicId: file.filename,
            metadata: {
              size: file.size,
              duration: 0,
            },
          };
        });
      }
      else if (req.body.media) {
        try {
          const parsedMedia = typeof req.body.media === 'string'
            ? JSON.parse(req.body.media)
            : req.body.media;
          if (Array.isArray(parsedMedia)) {
            mediaData = parsedMedia;
          }
        } catch (e) {
          console.log('Could not parse media from body:', e.message);
        }
      }

      // Xử lý audio từ body
      let audioData = null;
      if (audio) {
        try {
          audioData = typeof audio === 'string' ? JSON.parse(audio) : audio;
        } catch (e) {
          audioData = null;
        }
      }

      const storyData = {
        author: req.user.id,
        content: content || '',
        media: mediaData,
        backgroundColor: backgroundColor || '#0866FF',
        privacy: privacy || 'friends',
        audio: audioData,
        displayDuration: parseInt(displayDuration) || 5,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      console.log('📝 Story data:', JSON.stringify(storyData, null, 2));

      const story = await Story.create(storyData);
      console.log('✅ Story created:', story._id);

      const populatedStory = await Story.findById(story._id)
        .populate('author', 'username fullName avatar');

      res.status(201).json({
        success: true,
        story: populatedStory,
      });
    } catch (error) {
      console.error('❌ Error creating story:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi tạo story',
      });
    }
  }

  // ============================================
  // LẤY STORY THEO ID
  // ============================================
  async getStoryById(req, res, next) {
    try {
      console.log('📖 Fetching story by ID:', req.params.id);
      
      const story = await Story.findById(req.params.id)
        .populate('author', 'username fullName avatar');

      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy story',
        });
      }

      // Tăng view
      story.stats.views += 1;
      await story.save();

      res.json({
        success: true,
        story: story,
      });
    } catch (error) {
      console.error('❌ Error fetching story:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi lấy story',
      });
    }
  }

  // ============================================
  // XÓA STORY
  // ============================================
  async deleteStory(req, res, next) {
    try {
      console.log('🗑️ Deleting story:', req.params.id);
      
      const story = await Story.findById(req.params.id);

      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy story',
        });
      }

      // Kiểm tra quyền - chỉ tác giả mới được xóa
      if (story.author.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa story này',
        });
      }

      // Xóa file media nếu có
      if (story.media && story.media.length > 0) {
        for (const media of story.media) {
          if (media.url) {
            const filename = media.url.split('/').pop();
            const searchDirs = ['uploads/images', 'uploads/videos'];
            for (const dir of searchDirs) {
              const fullPath = path.join(__dirname, '../../', dir, filename);
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log(`✅ Deleted media file: ${filename}`);
                break;
              }
            }
          }
        }
      }

      // Xóa audio nếu có
      if (story.audio && story.audio.url) {
        const filename = story.audio.url.split('/').pop();
        const fullPath = path.join(__dirname, '../../', 'uploads/audios', filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`✅ Deleted audio file: ${filename}`);
        }
      }

      story.isDeleted = true;
      story.deletedAt = new Date();
      await story.save();

      res.json({
        success: true,
        message: 'Đã xóa story thành công',
      });
    } catch (error) {
      console.error('❌ Error deleting story:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi xóa story',
      });
    }
  }

  // ============================================
  // CẬP NHẬT STORY
  // ============================================
  async updateStory(req, res, next) {
    try {
      console.log('✏️ Updating story:', req.params.id);
      
      const story = await Story.findById(req.params.id);

      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy story',
        });
      }

      // Kiểm tra quyền - chỉ tác giả mới được sửa
      if (story.author.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền sửa story này',
        });
      }

      const { content, backgroundColor, privacy, audio, displayDuration } = req.body;

      if (content !== undefined) story.content = content;
      if (backgroundColor !== undefined) story.backgroundColor = backgroundColor;
      if (privacy !== undefined) story.privacy = privacy;
      if (audio !== undefined) story.audio = audio;
      if (displayDuration !== undefined) story.displayDuration = parseInt(displayDuration);

      await story.save();

      const populatedStory = await Story.findById(story._id)
        .populate('author', 'username fullName avatar');

      res.json({
        success: true,
        story: populatedStory,
        message: 'Đã cập nhật story thành công',
      });
    } catch (error) {
      console.error('❌ Error updating story:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi cập nhật story',
      });
    }
  }
}

module.exports = new StoryController();