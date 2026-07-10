// ============================================
// FILE: backend/src/controllers/audioController.js
// MÔ TẢ: Controller quản lý âm thanh
// ============================================

const Audio = require('../models/Audio');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

class AudioController {
  // Upload âm thanh
  async uploadAudio(req, res, next) {
    try {
      console.log('🎵 Upload audio request received');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file âm thanh',
        });
      }

      const audioUrl = `/uploads/audios/${req.file.filename}`;
      const publicId = req.file.filename;

      const audio = await Audio.create({
        user: req.user.id,
        name: req.body.name || req.file.originalname,
        url: audioUrl,
        publicId: publicId,
        duration: req.body.duration || 0,
        type: req.body.type || 'custom',
        settings: {
          volume: req.body.volume || 1.0,
          muted: req.body.muted || false,
          loop: req.body.loop || false,
        },
      });

      console.log(`✅ Audio uploaded: ${audio.name}`);

      res.status(201).json({
        success: true,
        audio: audio,
        message: 'Upload âm thanh thành công',
      });
    } catch (error) {
      console.error('❌ Upload audio error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi upload âm thanh',
      });
    }
  }

  // Lấy danh sách âm thanh của user
  async getMyAudios(req, res, next) {
    try {
      const audios = await Audio.find({
        user: req.user.id,
        isDeleted: false,
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        audios: audios,
      });
    } catch (error) {
      console.error('❌ Get audios error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi lấy danh sách âm thanh',
      });
    }
  }

  // Xóa âm thanh
  async deleteAudio(req, res, next) {
    try {
      const audio = await Audio.findById(req.params.id);

      if (!audio) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy âm thanh',
        });
      }

      if (audio.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền xóa âm thanh này',
        });
      }

      // Xóa file
      const filePath = path.join(__dirname, '../../uploads/audios', audio.publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted audio file: ${audio.publicId}`);
      }

      audio.isDeleted = true;
      await audio.save();

      res.json({
        success: true,
        message: 'Xóa âm thanh thành công',
      });
    } catch (error) {
      console.error('❌ Delete audio error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi xóa âm thanh',
      });
    }
  }
}

module.exports = new AudioController();