// ============================================
// FILE: backend/src/middleware/upload.js
// MÔ TẢ: Cấu hình upload - THÊM GROUPS
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
  'uploads/covers',
  'uploads/groups', // THÊM THƯ MỤC GROUPS
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '../../', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'uploads';
    
    // Xác định thư mục dựa vào fieldname
    if (file.fieldname === 'avatar' || file.fieldname === 'groupAvatar') {
      folder = 'uploads/groups';
    } else if (file.fieldname === 'coverPhoto' || file.fieldname === 'groupCover') {
      folder = 'uploads/groups';
    } else if (file.fieldname === 'media' || file.fieldname === 'postMedia') {
      folder = file.mimetype.startsWith('video/') ? 'uploads/videos' : 'uploads/images';
    } else if (file.fieldname === 'storyMedia') {
      folder = file.mimetype.startsWith('video/') ? 'uploads/videos' : 'uploads/images';
    } else if (file.fieldname === 'audio' || file.fieldname === 'music') {
      folder = 'uploads/audios';
    } else if (file.fieldname === 'avatar' && !file.fieldname.includes('group')) {
      folder = 'uploads/avatars';
    } else if (file.mimetype.startsWith('image/')) {
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
  console.log('📤 Field name:', file.fieldname);
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