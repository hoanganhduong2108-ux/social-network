const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Notification routes
router.get('/', protect, notificationController.getUserNotifications);
router.get('/unread', protect, notificationController.getUnreadCount);
router.put('/:notificationId/read', protect, notificationController.markAsRead);
router.put('/read-all', protect, notificationController.markAllAsRead);
router.delete('/:notificationId', protect, notificationController.deleteNotification);

module.exports = router;