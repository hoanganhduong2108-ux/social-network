const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./src/models/Admin');

async function setupAdmin() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social_network');

  const existingAdmin = await Admin.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('Tài khoản quản trị "admin" đã tồn tại.');
  } else {
    await Admin.create({
      username: 'admin',
      email: 'admin@drk.com',
      password: '123456',
      fullName: 'Quản trị viên DRK',
      role: 'super_admin',
      permissions: {
        manageUsers: true,
        managePosts: true,
        manageGroups: true,
        managePages: true,
        manageEvents: true,
        managePayments: true,
        manageSettings: true,
        viewReports: true,
        manageReports: true,
        manageAdmins: true,
        manageContent: true,
        viewAnalytics: true,
      },
      isActive: true,
    });
    console.log('Đã tạo tài khoản quản trị: admin / 123456');
  }

  await mongoose.disconnect();
}

setupAdmin().catch(async (error) => {
  console.error('Không thể thiết lập tài khoản quản trị:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
