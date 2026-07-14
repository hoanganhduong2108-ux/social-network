// ============================================
// FILE: backend/src/routes/postRoutes.js
// MÔ TẢ: Routes quản lý bài viết - THÊM ROUTE NHÓM
// ============================================

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { body } = require('express-validator');

// Validation rules
const postValidation = [
  body('content')
    .optional()
    .isLength({ max: 50000 })
    .withMessage('Nội dung không được vượt quá 50.000 ký tự'),
];

// ============================================
// ROUTE CÓ THAM SỐ ĐỘNG ĐẶT TRƯỚC
// ============================================

// Lấy bài viết trong nhóm
router.get('/group/:groupId', protect, postController.getGroupPosts);

// Lấy bài viết của người dùng theo userId
router.get('/user/:userId', protect, postController.getUserPosts);

// Lấy bảng tin
router.get('/feed', protect, postController.getNewsFeed);

// Tạo bài viết mới
router.post('/', protect, upload.array('media', 10), postValidation, postController.createPost);

// Lấy bài viết theo ID (PHẢI ĐẶT SAU /group/:groupId và /user/:userId)
router.get('/:id', protect, postController.getPostById);

// Cập nhật bài viết
router.put('/:id', protect, postController.updatePost);

// Xóa bài viết
router.delete('/:id', protect, postController.deletePost);

// Interactions
router.post('/:id/like', protect, postController.likePost);
router.delete('/:id/like', protect, postController.unlikePost);
router.post('/:id/comment', protect, upload.array('media', 5), postController.commentOnPost);
router.delete('/comment/:commentId', protect, postController.deleteComment);
router.post('/:id/share', protect, postController.sharePost);

// Pin
router.post('/:id/pin', protect, postController.pinPost);
router.delete('/:id/pin', protect, postController.unpinPost);

module.exports = router;