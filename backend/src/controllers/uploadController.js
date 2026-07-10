// ============================================
// FILE: backend/src/controllers/uploadController.js
// MÔ TẢ: Controller upload - SỬA LỖI
// ============================================

const path = require('path');
const fs = require('fs');

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
      const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 
                       req.file.mimetype.startsWith('audio/') ? 'audio' : 'image';

      console.log(`✅ File uploaded: ${req.file.originalname}`);
      console.log(`📁 File URL: ${fileUrl}`);
      console.log(`📁 File type: ${fileType}`);
      console.log(`📁 File size: ${req.file.size} bytes`);

      res.json({
        success: true,
        url: fileUrl,
        publicId: req.file.filename,
        type: fileType,
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
      console.error('Upload multiple error:', error);
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
      console.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi xóa file',
      });
    }
  }
}

module.exports = new UploadController();