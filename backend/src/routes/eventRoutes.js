// ============================================
// FILE: backend/src/routes/eventRoutes.js
// MÔ TẢ: Routes quản lý sự kiện
// ============================================

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation rules
const createEventValidation = [
  body('title')
    .notEmpty()
    .withMessage('Tiêu đề sự kiện là bắt buộc')
    .isLength({ max: 200 })
    .withMessage('Tiêu đề không được vượt quá 200 ký tự'),
  body('startTime')
    .notEmpty()
    .withMessage('Thời gian bắt đầu là bắt buộc'),
  body('endTime')
    .notEmpty()
    .withMessage('Thời gian kết thúc là bắt buộc'),
  body('location.name')
    .notEmpty()
    .withMessage('Địa điểm là bắt buộc'),
];

// Routes
router.post('/', protect, createEventValidation, eventController.createEvent);
router.get('/', protect, eventController.getEvents);
router.get('/:id', protect, eventController.getEventById);
router.put('/:id', protect, eventController.updateEvent);
router.post('/:id/rsvp', protect, eventController.rsvpEvent);
router.post('/:id/cancel', protect, eventController.cancelEvent);

module.exports = router;