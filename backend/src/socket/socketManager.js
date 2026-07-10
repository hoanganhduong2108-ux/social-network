// ============================================
// FILE: backend/src/socket/socketManager.js
// MÔ TẢ: Quản lý Socket.io
// ============================================

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

// ============================================
// Khởi tạo Socket.io
// ============================================
const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // ============================================
  // Middleware xác thực socket
  // ============================================
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log('🔐 Socket authentication token:', token ? 'Present' : 'Missing');

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      console.log(`✅ Socket authenticated for user: ${user.username}`);
      next();
    } catch (error) {
      console.error('❌ Socket authentication error:', error.message);
      next(new Error('Authentication error: ' + error.message));
    }
  });

  // ============================================
  // Xử lý kết nối
  // ============================================
  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.user.username} (${socket.id})`);
    
    // Tham gia phòng của user
    const roomId = `user_${socket.user._id}`;
    socket.join(roomId);
    console.log(`📡 User ${socket.user.username} joined room: ${roomId}`);
    
    // Cập nhật online status
    User.findByIdAndUpdate(socket.user._id, { 
      isOnline: true, 
      lastSeen: new Date() 
    }).then(() => {
      // Broadcast online status
      socket.broadcast.emit('user_online', {
        userId: socket.user._id,
        username: socket.user.username,
      });
    }).catch(err => console.error('Error updating online status:', err));

    // ============================================
    // Xử lý tin nhắn
    // ============================================
    socket.on('send_message', async (data) => {
      try {
        console.log(`💬 Message from ${socket.user.username}:`, data);
        
        const Message = require('../models/Message');
        const message = new Message({
          conversationId: data.conversationId,
          sender: socket.user._id,
          content: data.content,
          type: data.type || 'text',
          media: data.media,
        });
        await message.save();

        // Gửi tin nhắn đến người nhận
        const receiverRoom = `user_${data.receiverId}`;
        io.to(receiverRoom).emit('receive_message', {
          ...message.toObject(),
          sender: {
            _id: socket.user._id,
            username: socket.user.username,
            fullName: socket.user.fullName,
            avatar: socket.user.avatar,
          },
        });

        // Xác nhận đã gửi
        socket.emit('message_sent', {
          messageId: message._id,
          conversationId: data.conversationId,
        });
      } catch (error) {
        console.error('❌ Send message error:', error);
        socket.emit('message_error', { error: error.message });
      }
    });

    // ============================================
    // Xử lý đánh dấu đã đọc
    // ============================================
    socket.on('mark_read', async (data) => {
      try {
        const Message = require('../models/Message');
        await Message.updateMany(
          {
            conversationId: data.conversationId,
            sender: { $ne: socket.user._id },
            'readBy.user': { $ne: socket.user._id },
          },
          {
            $push: {
              readBy: {
                user: socket.user._id,
                readAt: new Date(),
              },
            },
          }
        );

        io.to(`user_${data.receiverId}`).emit('message_read', {
          conversationId: data.conversationId,
          userId: socket.user._id,
        });
      } catch (error) {
        console.error('❌ Mark read error:', error);
      }
    });

    // ============================================
    // Xử lý typing
    // ============================================
    socket.on('typing', (data) => {
      const receiverRoom = `user_${data.receiverId}`;
      io.to(receiverRoom).emit('user_typing', {
        userId: socket.user._id,
        username: socket.user.username,
        conversationId: data.conversationId,
      });
    });

    socket.on('stop_typing', (data) => {
      const receiverRoom = `user_${data.receiverId}`;
      io.to(receiverRoom).emit('user_stop_typing', {
        userId: socket.user._id,
        conversationId: data.conversationId,
      });
    });

    // ============================================
    // Xử lý ngắt kết nối
    // ============================================
    socket.on('disconnect', async () => {
      console.log(`👤 User disconnected: ${socket.user.username} (${socket.id})`);
      
      // Cập nhật online status
      try {
        await User.findByIdAndUpdate(socket.user._id, {
          isOnline: false,
          lastSeen: new Date(),
        });

        // Broadcast offline status
        socket.broadcast.emit('user_offline', {
          userId: socket.user._id,
          username: socket.user.username,
        });
      } catch (error) {
        console.error('❌ Error updating offline status:', error);
      }
    });

    // ============================================
    // Xử lý lỗi socket
    // ============================================
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.user.username}:`, error);
    });
  });

  return io;
};

// ============================================
// Lấy instance của io
// ============================================
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// ============================================
// Gửi thông báo realtime
// ============================================
const sendNotification = (userId, notification) => {
  if (!io) {
    console.error('❌ Socket.io not initialized');
    return;
  }
  const roomId = `user_${userId}`;
  io.to(roomId).emit('new_notification', notification);
  console.log(`📨 Notification sent to user ${userId}`);
};

module.exports = { initSocket, getIO, sendNotification };