const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Message routes
router.post('/', protect, upload.single('media'), messageController.sendMessage);
router.get('/conversations', protect, messageController.getConversations);
router.get('/:userId', protect, messageController.getConversation);
router.delete('/:messageId', protect, messageController.deleteMessage);
router.post('/:messageId/read', protect, messageController.markAsRead);

module.exports = router;