// ============================================
// FILE: backend/src/app.js
// MÔ TẢ: Cấu hình ứng dụng Express - SỬA LỖI STATIC FILES
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const groupRoutes = require('./routes/groupRoutes');
const pageRoutes = require('./routes/pageRoutes');
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storyRoutes = require('./routes/storyRoutes');
const exploreRoutes = require('./routes/exploreRoutes');
const watchRoutes = require('./routes/watchRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const audioRoutes = require('./routes/audioRoutes');

const app = express();

// ============================================
// TẠO THƯ MỤC UPLOADS
// ============================================
const uploadDirs = [
  'uploads',
  'uploads/images',
  'uploads/videos',
  'uploads/audios',
  'uploads/avatars',
  'uploads/posts',
  'uploads/stories',
  'uploads/covers',
  'uploads/groups',
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DRK Social Network API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      messages: '/api/messages',
      notifications: '/api/notifications',
      groups: '/api/groups',
      pages: '/api/pages',
      events: '/api/events',
      payments: '/api/payments',
      admin: '/api/admin',
      stories: '/api/stories',
      explore: '/api/explore',
      watch: '/api/watch',
      marketplace: '/api/marketplace',
      upload: '/api/upload',
      audio: '/api/audio',
    },
  });
});

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút',
  },
});
app.use('/api', limiter);

// Body Parser
app.use(express.json({ limit: '10gb' }));
app.use(express.urlencoded({ extended: true, limit: '10gb' }));

// ============================================
// STATIC FILES - QUAN TRỌNG
// ============================================
// Phục vụ tất cả file trong thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Log để debug
console.log('✅ Static files serving enabled for /uploads');
console.log(`📁 Uploads path: ${path.join(__dirname, '../uploads')}`);

// Logging
app.use((req, res, next) => {
  if (!req.url.includes('.well-known') && !req.url.includes('favicon')) {
    console.log(`📨 ${req.method} ${req.url}`);
  }
  next();
});

// Register routes
console.log('📦 Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/watch', watchRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/audio', audioRoutes);
console.log('✅ All routes registered successfully!');

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  if (!req.url.includes('.well-known') && !req.url.includes('favicon.ico')) {
    console.log(`❌ Route not found: ${req.method} ${req.url}`);
  }
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url,
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;