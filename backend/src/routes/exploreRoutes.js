// ============================================
// FILE: backend/src/routes/exploreRoutes.js
// MÔ TẢ: Routes cho trang khám phá
// ============================================

const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/exploreController');
const { protect } = require('../middleware/auth');

// ============================================
// Routes
// ============================================
router.get('/trending', protect, exploreController.getTrending);
router.get('/search', protect, exploreController.search);

module.exports = router;
