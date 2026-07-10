// ============================================
// FILE: backend/src/routes/adminRoutes.js
// MÔ TẢ: Routes quản trị hệ thống
// ============================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly, superAdminOnly } = require('../middleware/auth');
const { body } = require('express-validator');

// ============================================
// Xác thực admin (không cần token)
// ============================================
router.post('/login', adminController.login);

// ============================================
// Quản lý Admin (cần xác thực)
// ============================================
router.use(protect);
router.use(adminOnly);

// Thống kê
router.get('/stats', adminController.getStats);

// Quản lý người dùng
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.toggleBanUser);
router.delete('/users/:id', adminController.deleteUser);

// Quản lý bài viết
router.get('/posts', adminController.getPosts);
router.put('/posts/:id/approve', adminController.approvePost);
router.delete('/posts/:id', adminController.deletePost);

// Quản lý báo cáo
router.get('/reports', adminController.getReports);
router.put('/reports/:id', adminController.handleReport);

// Quản lý admin (chỉ super admin)
router.post('/admins', superAdminOnly, adminController.createAdmin);
router.get('/admins', superAdminOnly, adminController.getAdmins);
router.put('/admins/:id', superAdminOnly, adminController.updateAdmin);
router.delete('/admins/:id', superAdminOnly, adminController.deleteAdmin);

// Cài đặt hệ thống
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;