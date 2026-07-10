// ============================================
// FILE: backend/server.js
// MÔ TẢ: Điểm khởi đầu của server - TỰ ĐỘNG TẠO USER
// ============================================

const app = require('./src/app');
const http = require('http');
const { initSocket } = require('./src/socket/socketManager');
const connectDB = require('./src/config/database');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const server = http.createServer(app);

// Khởi tạo Socket.io
const io = initSocket(server);

// Kết nối Database
connectDB();

const PORT = process.env.PORT || 5000;

// ============================================
// HÀM TẠO USER MẶC ĐỊNH
// ============================================
async function createDefaultUsers() {
  try {
    console.log('\n🔑 Checking default users...');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Danh sách user cần tạo/cập nhật
    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        avatar: 'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=Admin',
        isActive: true,
        isBanned: false,
        isVerified: true,
      },
      {
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=Test+User',
        isActive: true,
        isBanned: false,
        isVerified: false,
      },
      {
        username: 'jane_doe',
        email: 'jane@example.com',
        fullName: 'Jane Doe',
        avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=Jane+Doe',
        isActive: true,
        isBanned: false,
        isVerified: true,
      },
      {
        username: 'john_smith',
        email: 'john@example.com',
        fullName: 'John Smith',
        avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=John+Smith',
        isActive: true,
        isBanned: false,
        isVerified: false,
      },
      {
        username: 'demo',
        email: 'demo@example.com',
        fullName: 'Demo User',
        avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=Demo+User',
        isActive: true,
        isBanned: false,
        isVerified: false,
      },
      {
        username: 'hoang',
        email: 'hoang@example.com',
        fullName: 'Hoang Nguyen',
        avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=Hoang+Nguyen',
        isActive: true,
        isBanned: false,
        isVerified: false,
      },
    ];

    let createdCount = 0;
    let updatedCount = 0;

    for (const userData of defaultUsers) {
      // Kiểm tra user đã tồn tại chưa
      const existingUser = await User.findOne({ 
        $or: [{ username: userData.username }, { email: userData.email }] 
      });

      if (!existingUser) {
        // Tạo user mới
        await User.create({
          ...userData,
          password: hashedPassword,
          createdAt: new Date(),
        });
        console.log(`✅ Created user: ${userData.username}`);
        createdCount++;
      } else {
        // Cập nhật lại mật khẩu (đảm bảo đúng)
        await User.updateOne(
          { _id: existingUser._id },
          { $set: { password: hashedPassword } }
        );
        console.log(`🔄 Updated password for: ${userData.username}`);
        updatedCount++;
      }
    }

    console.log(`\n📊 Default users summary:`);
    console.log(`   - ${createdCount} new users created`);
    console.log(`   - ${updatedCount} users password updated`);
    console.log('\n🔑 All default accounts password: 123456');
    console.log('   - admin');
    console.log('   - testuser');
    console.log('   - jane_doe');
    console.log('   - john_smith');
    console.log('   - demo');
    console.log('   - hoang');
    console.log('');

  } catch (error) {
    console.error('❌ Error creating default users:', error.message);
  }
}

server.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Socket.io is running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Tạo user mặc định
  await createDefaultUsers();
});

// ============================================
// Xử lý lỗi
// ============================================
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  
  server.close(() => {
    console.error('🛑 Server closed gracefully');
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  
  server.close(() => {
    console.error('🛑 Server closed gracefully');
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('📨 Received SIGTERM signal. Shutting down gracefully...');
  server.close(() => {
    console.log('🛑 Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📨 Received SIGINT signal (Ctrl+C). Shutting down gracefully...');
  server.close(() => {
    console.log('🛑 Server closed gracefully');
    process.exit(0);
  });
});