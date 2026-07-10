// ============================================
// FILE: backend/src/routes/watchRoutes.js
// MÔ TẢ: Routes cho Watch/Video
// ============================================

const express = require('express');
const router = express.Router();
const watchController = require('../controllers/watchController');
const { protect } = require('../middleware/auth');

// ============================================
// Routes
// ============================================
router.get('/videos', protect, watchController.getVideos);

module.exports = router;