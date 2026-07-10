// ============================================
// FILE: backend/src/routes/uploadRoutes.js
// MÔ TẢ: Routes upload - SỬA LỖI
// ============================================

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Upload file
router.post('/', protect, upload.single('media'), uploadController.uploadFile);

// Upload nhiều file
router.post('/multiple', protect, upload.array('media', 10), uploadController.uploadMultiple);

// Xóa file
router.delete('/:publicId', protect, uploadController.deleteFile);

module.exports = router;