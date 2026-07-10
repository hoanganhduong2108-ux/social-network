// ============================================
// FILE: backend/src/routes/audioRoutes.js
// MÔ TẢ: Routes quản lý âm thanh
// ============================================

const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Upload âm thanh
router.post('/upload', protect, upload.single('audio'), audioController.uploadAudio);

// Lấy danh sách âm thanh của user
router.get('/my-audios', protect, audioController.getMyAudios);

// Xóa âm thanh
router.delete('/:id', protect, audioController.deleteAudio);

module.exports = router;