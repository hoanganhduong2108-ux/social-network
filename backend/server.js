const app = require('./src/app');
const http = require('http');
const { initSocket } = require('./src/socket/socketManager');
const connectDB = require('./src/config/database');
require('dotenv').config();

const server = http.createServer(app);

// Khởi tạo Socket.io
const io = initSocket(server);

// Kết nối Database
connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Xử lý lỗi không bắt được
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});