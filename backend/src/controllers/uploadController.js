// ============================================
// FILE: backend/src/controllers/uploadController.js
// MÔ TẢ: Controller upload - SỬA LỖI TIMEOUT VÀ KÍCH THƯỚC
// ============================================

const path = require('path');
const fs = require('fs');

// ============================================
// GIỚI HẠN KÍCH THƯỚC FILE (bytes)
// ============================================
const MAX_FILE_SIZE = {
  image: 100 * 1024 * 1024,   // 100MB
  video: 10000 * 1024 * 1024,  // 10000MB
  audio: 100 * 1024 * 1024,   // 100MB
};

class UploadController {
  async uploadFile(req, res, next) {
    try {
      console.log('📤 Upload request received');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file',
        });
      }

      // ============================================
      // KIỂM TRA KÍCH THƯỚC FILE THEO LOẠI
      // ============================================
      let maxSize = MAX_FILE_SIZE.image;
      let fileType = 'image';
      
      if (req.file.mimetype.startsWith('video/')) {
        maxSize = MAX_FILE_SIZE.video;
        fileType = 'video';
      } else if (req.file.mimetype.startsWith('audio/')) {
        maxSize = MAX_FILE_SIZE.audio;
        fileType = 'audio';
      }

      if (req.file.size > maxSize) {
        const sizeInMB = (maxSize / (1024 * 1024)).toFixed(0);
        return res.status(400).json({
          success: false,
          message: `Kích thước file quá lớn. Tối đa ${sizeInMB}MB cho file ${fileType}`,
        });
      }

      // Xác định thư mục con
      let subFolder = '';
      if (req.file.mimetype.startsWith('image/')) {
        subFolder = 'images/';
      } else if (req.file.mimetype.startsWith('video/')) {
        subFolder = 'videos/';
      } else if (req.file.mimetype.startsWith('audio/')) {
        subFolder = 'audios/';
      }

      const fileUrl = `/uploads/${subFolder}${path.basename(req.file.path)}`;
      const responseType = req.file.mimetype.startsWith('video/') ? 'video' : 
                           req.file.mimetype.startsWith('audio/') ? 'audio' : 'image';

      console.log(`✅ File uploaded: ${req.file.originalname}`);
      console.log(`📁 File URL: ${fileUrl}`);
      console.log(`📁 File type: ${responseType}`);
      console.log(`📁 File size: ${(req.file.size / (1024 * 1024)).toFixed(2)} MB`);

      // ============================================
      // TRẢ VỀ RESPONSE THÀNH CÔNG
      // ============================================
      res.json({
        success: true,
        url: fileUrl,
        publicId: req.file.filename,
        type: responseType,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        duration: 0,
        message: 'Upload thành công',
      });
    } catch (error) {
      console.error('❌ Upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi upload file',
      });
    }
  }

  async uploadMultiple(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file',
        });
      }

      // ============================================
      // KIỂM TRA TỔNG KÍCH THƯỚC
      // ============================================
      const totalSize = req.files.reduce((sum, f) => sum + f.size, 0);
      const maxTotalSize = 10 * 1024 * 1024 * 1024; // 10GB
      
      if (totalSize > maxTotalSize) {
        return res.status(400).json({
          success: false,
          message: `Tổng kích thước các file quá lớn (tối đa ${maxTotalSize / (1024 * 1024 * 1024)}GB)`,
        });
      }

      // ============================================
      // KIỂM TRA TỪNG FILE
      // ============================================
      for (const file of req.files) {
        let maxSize = MAX_FILE_SIZE.image;
        if (file.mimetype.startsWith('video/')) {
          maxSize = MAX_FILE_SIZE.video;
        } else if (file.mimetype.startsWith('audio/')) {
          maxSize = MAX_FILE_SIZE.audio;
        }
        
        if (file.size > maxSize) {
          const sizeInMB = (maxSize / (1024 * 1024)).toFixed(0);
          return res.status(400).json({
            success: false,
            message: `File "${file.originalname}" quá lớn. Tối đa ${sizeInMB}MB`,
          });
        }
      }

      const files = req.files.map((file) => {
        let subFolder = '';
        if (file.mimetype.startsWith('image/')) {
          subFolder = 'images/';
        } else if (file.mimetype.startsWith('video/')) {
          subFolder = 'videos/';
        } else if (file.mimetype.startsWith('audio/')) {
          subFolder = 'audios/';
        }
        const fileUrl = `/uploads/${subFolder}${path.basename(file.path)}`;
        const fileType = file.mimetype.startsWith('video/') ? 'video' : 
                         file.mimetype.startsWith('audio/') ? 'audio' : 'image';
        return {
          url: fileUrl,
          publicId: file.filename,
          type: fileType,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          duration: 0,
        };
      });

      console.log(`✅ Uploaded ${files.length} files`);

      res.json({
        success: true,
        files: files,
        message: 'Upload thành công',
      });
    } catch (error) {
      console.error('❌ Upload multiple error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi upload file',
      });
    }
  }

  async deleteFile(req, res, next) {
    try {
      const { publicId } = req.params;
      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp publicId',
        });
      }

      const searchDirs = ['uploads/images', 'uploads/videos', 'uploads/audios'];
      let deleted = false;

      for (const dir of searchDirs) {
        const fullPath = path.join(__dirname, '../../', dir);
        if (fs.existsSync(fullPath)) {
          const files = fs.readdirSync(fullPath);
          const file = files.find(f => f.includes(publicId));
          if (file) {
            const filePath = path.join(fullPath, file);
            fs.unlinkSync(filePath);
            console.log(`✅ Deleted file: ${file}`);
            deleted = true;
            break;
          }
        }
      }

      res.json({
        success: true,
        message: deleted ? 'Xóa file thành công' : 'Không tìm thấy file',
      });
    } catch (error) {
      console.error('❌ Delete file error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi xóa file',
      });
    }
  }
}

module.exports = new UploadController();