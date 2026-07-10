// ============================================
// FILE: backend/src/routes/pageRoutes.js
// MÔ TẢ: Routes quản lý trang (Page)
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

// Routes
router.post('/', protect, createPageValidation, pageController.createPage);
router.get('/', protect, pageController.getUserPages);
router.get('/:id', protect, pageController.getPageById);
router.put('/:id', protect, pageController.updatePage);

router.post('/:id/follow', protect, pageController.followPage);
router.delete('/:id/follow', protect, pageController.unfollowPage);

router.post('/:id/review', protect, upload.array('images', 5), pageController.addReview);

module.exports = router;