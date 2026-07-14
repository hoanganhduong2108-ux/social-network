// ============================================
// FILE: backend/src/routes/pageRoutes.js
// MÔ TẢ: Routes quản lý trang (Page) - SỬA LỖI
// ============================================

const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { body } = require('express-validator');

// Validation rules
const createPageValidation = [
  body('name')
    .notEmpty()
    .withMessage('Tên trang là bắt buộc')
    .isLength({ max: 100 })
    .withMessage('Tên trang không được vượt quá 100 ký tự'),
  body('category')
    .notEmpty()
    .withMessage('Danh mục là bắt buộc'),
];

// ============================================
// Routes - ĐẶT ĐÚNG THỨ TỰ
// ============================================

// Lấy danh sách trang của người dùng
router.get('/', protect, pageController.getUserPages);

// Tạo trang mới
router.post('/', protect, createPageValidation, pageController.createPage);

// Lấy thông tin trang theo ID (PHẢI ĐẶT SAU /)
router.get('/:id', protect, pageController.getPageById);

// Cập nhật trang
router.put('/:id', protect, pageController.updatePage);

// Theo dõi / Bỏ theo dõi trang
router.post('/:id/follow', protect, pageController.followPage);
router.delete('/:id/follow', protect, pageController.unfollowPage);

// Thêm đánh giá
router.post('/:id/review', protect, upload.array('images', 5), pageController.addReview);

module.exports = router;