// ============================================
// FILE: backend/src/routes/groupRoutes.js
// MÔ TẢ: Routes quản lý nhóm
// ============================================

const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation rules
const createGroupValidation = [
  body('name')
    .notEmpty()
    .withMessage('Tên nhóm là bắt buộc')
    .isLength({ max: 100 })
    .withMessage('Tên nhóm không được vượt quá 100 ký tự'),
];

// Routes
router.post('/', protect, createGroupValidation, groupController.createGroup);
router.get('/', protect, groupController.getUserGroups);
router.get('/:id', protect, groupController.getGroupById);
router.put('/:id', protect, groupController.updateGroup);
router.delete('/:id', protect, groupController.deleteGroup);

router.post('/:id/join', protect, groupController.joinGroup);
router.post('/:id/leave', protect, groupController.leaveGroup);
router.post('/:id/invite', protect, groupController.inviteMember);

module.exports = router;