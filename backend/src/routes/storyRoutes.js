// ============================================
// FILE: backend/src/routes/storyRoutes.js
// MÔ TẢ: Routes Story - THÊM XÓA
// ============================================

const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Lấy danh sách stories
router.get('/', protect, storyController.getStories);

// Lấy story theo ID
router.get('/:id', protect, storyController.getStoryById);

// Tạo story mới
router.post('/', protect, upload.array('media', 5), storyController.createStory);

// Cập nhật story
router.put('/:id', protect, storyController.updateStory);

// Xóa story
router.delete('/:id', protect, storyController.deleteStory);

module.exports = router;