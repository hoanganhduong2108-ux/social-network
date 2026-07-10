// ============================================
// FILE: backend/src/middleware/upload.js
// MÔ TẢ: Cấu hình upload
// ============================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads
const uploadDirs = [
  'uploads',
  'uploads/images',
  'uploads/videos',
  'uploads/audios',
  'uploads/avatars',
  'uploads/posts',
  'uploads/stories',
  'uploads/covers'
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '../../', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'uploads';
    if (file.mimetype.startsWith('image/')) {
      folder = 'uploads/images';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'uploads/videos';
    } else if (file.mimetype.startsWith('audio/')) {
      folder = 'uploads/audios';
    }
    cb(null, path.join(__dirname, '../../', folder));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('📤 File received:', file.originalname);
  console.log('📤 MIME type:', file.mimetype);
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB
  },
  fileFilter: fileFilter,
});

module.exports = { upload };