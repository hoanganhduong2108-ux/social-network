// ============================================
// FILE: backend/src/routes/groupRoutes.js
// MÔ TẢ: Routes quản lý nhóm - SỬA LỖI UPLOAD
// ============================================

const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { body } = require('express-validator');

// ============================================
// VALIDATION RULES
// ============================================
const createGroupValidation = [
  body('name')
    .notEmpty()
    .withMessage('Tên nhóm là bắt buộc')
    .isLength({ max: 100 })
    .withMessage('Tên nhóm không được vượt quá 100 ký tự')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Mô tả không được vượt quá 2000 ký tự')
    .trim(),
];

// ============================================
// ROUTES - QUẢN LÝ NHÓM
// ============================================

// Tạo nhóm mới
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
    { name: 'files', maxCount: 5 }
  ]),
  createGroupValidation,
  groupController.createGroup
);

// Lấy danh sách nhóm của người dùng
router.get('/', protect, groupController.getUserGroups);

// TÌM KIẾM NHÓM CÔNG KHAI - THÊM MỚI
router.get('/search', protect, groupController.searchGroups);

// Lấy thông tin nhóm theo ID
router.get('/:id', protect, groupController.getGroupById);

// Cập nhật nhóm - SỬA LỖI UPLOAD
router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
    { name: 'files', maxCount: 5 }
  ]),
  groupController.updateGroup
);

// Xóa nhóm
router.delete('/:id', protect, groupController.deleteGroup);

// ============================================
// ROUTES - QUẢN LÝ THÀNH VIÊN
// ============================================

// Tham gia nhóm
router.post('/:id/join', protect, groupController.joinGroup);

// Rời nhóm
router.post('/:id/leave', protect, groupController.leaveGroup);

// Mời thành viên vào nhóm
router.post('/:id/invite', protect, groupController.inviteMember);

// Lấy danh sách thành viên của nhóm
router.get('/:id/members', protect, groupController.getGroupMembers);

// Xóa thành viên khỏi nhóm
router.delete('/:id/members/:userId', protect, groupController.removeMember);

// Thay đổi quyền thành viên
router.put('/:id/members/:userId/role', protect, groupController.changeMemberRole);

// ============================================
// ROUTES - QUẢN LÝ YÊU CẦU THAM GIA
// ============================================

// Lấy danh sách yêu cầu tham gia nhóm
router.get('/:id/requests', protect, groupController.getJoinRequests);

// Chấp nhận yêu cầu tham gia nhóm
router.post('/:id/requests/:userId/approve', protect, groupController.approveJoinRequest);

// Từ chối yêu cầu tham gia nhóm
router.post('/:id/requests/:userId/reject', protect, groupController.rejectJoinRequest);

// ============================================
// ROUTES - QUẢN LÝ BÀI VIẾT TRONG NHÓM
// ============================================

// Lấy bài viết chờ duyệt
router.get('/:id/pending-posts', protect, groupController.getPendingPosts);

// Duyệt bài viết
router.put('/:id/posts/:postId/approve', protect, groupController.approvePost);

// Từ chối bài viết
router.put('/:id/posts/:postId/reject', protect, groupController.rejectPost);

// ============================================
// ROUTES - QUẢN LÝ SỰ KIỆN TRONG NHÓM
// ============================================

// Lấy danh sách sự kiện của nhóm
router.get('/:id/events', protect, groupController.getGroupEvents);

// Tạo sự kiện trong nhóm
router.post('/:id/events', protect, groupController.createGroupEvent);

// Cập nhật sự kiện trong nhóm
router.put('/:id/events/:eventId', protect, groupController.updateGroupEvent);

// Xóa sự kiện trong nhóm
router.delete('/:id/events/:eventId', protect, groupController.deleteGroupEvent);

module.exports = router;