// ============================================
// FILE: backend/src/routes/marketplaceRoutes.js
// MÔ TẢ: Routes cho Marketplace
// ============================================

const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');

// ============================================
// Routes
// ============================================
router.get('/products', protect, marketplaceController.getProducts);
router.post('/products', protect, marketplaceController.createProduct);
router.get('/products/:id', protect, marketplaceController.getProductById);

module.exports = router;