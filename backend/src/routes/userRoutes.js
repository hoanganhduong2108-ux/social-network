// ============================================
// FILE: backend/src/routes/userRoutes.js
// MÔ TẢ: Routes quản lý người dùng - SỬA LỖI
// ============================================

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// ============================================
// QUAN TRỌNG: Các route không có tham số động phải đặt TRƯỚC
// các route có tham số động (ví dụ: /:id, /:userId)
// ============================================

// ============================================
// Routes không có tham số động - Đặt trước
// ============================================

// Lấy thông tin user hiện tại
router.get('/me', protect, userController.getCurrentUser);

// Tìm kiếm người dùng
router.get('/search', protect, userController.searchUsers);

// Lấy gợi ý bạn bè
router.get('/suggestions/friends', protect, userController.getFriendSuggestions);

// Lấy danh sách lời mời kết bạn
router.get('/friend-requests', protect, userController.getFriendRequests);

// Cập nhật profile
router.put('/profile', protect, userController.updateProfile);

// Avatar và cover photo
router.post('/avatar', protect, upload.single('avatar'), userController.updateAvatar);
router.post('/cover', protect, upload.single('cover'), userController.updateCoverPhoto);

// ============================================
// Routes có tham số động - Đặt sau
// ============================================

// Lấy danh sách bạn bè của user
router.get('/:userId/friends', protect, userController.getFriends);

// Lấy thông tin user theo ID
router.get('/:id', protect, userController.getUserById);

// Lấy thông tin user theo username
router.get('/username/:username', protect, userController.getUserByUsername);

// ============================================
// Friend management
// ============================================
router.post('/friends/request/:userId', protect, userController.sendFriendRequest);
router.post('/friends/accept/:userId', protect, userController.acceptFriendRequest);
router.post('/friends/reject/:userId', protect, userController.rejectFriendRequest);
router.delete('/friends/:userId', protect, userController.unfriend);

// ============================================
// Follow management
// ============================================
router.post('/follow/:userId', protect, userController.followUser);
router.delete('/follow/:userId', protect, userController.unfollowUser);

module.exports = router;