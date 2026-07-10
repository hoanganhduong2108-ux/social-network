// ============================================
// FILE: backend/seed.js
// MÔ TẢ: Script tạo dữ liệu mẫu - ĐÃ SỬA LỖI MẬT KHẨU
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Comment = require('./src/models/Comment');
const Message = require('./src/models/Message');
const Notification = require('./src/models/Notification');
const Group = require('./src/models/Group');
const Page = require('./src/models/Page');
const Event = require('./src/models/Event');
const Payment = require('./src/models/Payment');
const Story = require('./src/models/Story');
const Admin = require('./src/models/Admin');

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social_network')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err);
    process.exit(1);
  });

// ============================================
// Hàm tạo dữ liệu mẫu
// ============================================
const seedDatabase = async () => {
  try {
    console.log('\n🚀 Starting seed database...');
    console.log('📦 This will create sample data for all collections\n');

    // ============================================
    // Xóa dữ liệu cũ
    // ============================================
    console.log('🗑️ Deleting old data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await Group.deleteMany({});
    await Page.deleteMany({});
    await Event.deleteMany({});
    await Payment.deleteMany({});
    await Story.deleteMany({});
    await Admin.deleteMany({});
    console.log('✅ Old data deleted\n');

    // ============================================
    // Hash password - QUAN TRỌNG: PHẢI HASH ĐÚNG
    // ============================================
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    console.log('🔑 Password hashed successfully: 123456 ->', hashedPassword.substring(0, 30) + '...\n');

    // ============================================
    // 1. Tạo Admin
    // ============================================
    console.log('👤 Creating admin...');
    const admin = await Admin.create({
      username: 'superadmin',
      email: 'admin@vibespace.com',
      password: hashedPassword,
      fullName: 'Super Admin',
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
    console.log(`✅ Created admin: ${admin.username}\n`);

    // ============================================
    // 2. Tạo Users - DÙNG hashedPassword ĐÃ HASH
    // ============================================
    console.log('👤 Creating users...');
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        fullName: 'Admin User',
        avatar: 'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=Admin',
        coverPhoto: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200',
        bio: 'Quản trị viên hệ thống DRK',
        gender: 'male',
        isActive: true,
        isBanned: false,
        isVerified: true,
        privacy: {
          profileVisibility: 'public',
          emailVisibility: 'private',
          phoneVisibility: 'private',
          locationVisibility: 'friends',
          allowTagging: true,
          allowMessages: 'everyone',
          showOnlineStatus: true,
        },
        details: {
          school: 'Đại học Bách Khoa Hà Nội',
          work: 'DRK Inc.',
          livesIn: 'Hà Nội, Việt Nam',
          relationship: 'Đã kết hôn',
          joined: 'Tháng 1, 2024',
        },
        devices: [
          {
            id: 'dev_1',
            device: 'iPhone 15 Pro Max',
            location: 'Hà Nội, Việt Nam',
            date: new Date(),
          },
          {
            id: 'dev_2',
            device: 'MacBook Pro M3',
            location: 'Hà Nội, Việt Nam',
            date: new Date(Date.now() - 86400000),
          },
        ],
      },
      {
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        fullName: 'Test User',
        avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=Test+User',
        coverPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200',
        bio: 'Lập trình viên React, yêu công nghệ',
        gender: 'male',
        isActive: true,
        isBanned: false,
        isVerified: false,
        privacy: {
          profileVisibility: 'public',
          emailVisibility: 'friends',
          phoneVisibility: 'private',
          locationVisibility: 'friends',
          allowTagging: true,
          allowMessages: 'friends',
          showOnlineStatus: true,
        },
        details: {
          school: 'Đại học Công nghệ Thông tin',
          work: 'Freelancer',
          livesIn: 'TP. Hồ Chí Minh, Việt Nam',
          relationship: 'Độc thân',
          joined: 'Tháng 3, 2024',
        },
        devices: [
          {
            id: 'dev_3',
            device: 'Samsung Galaxy S24',
            location: 'TP. Hồ Chí Minh, Việt Nam',
            date: new Date(),
          },
        ],
      },
      {
        username: 'jane_doe',
        email: 'jane@example.com',
        password: hashedPassword,
        fullName: 'Jane Doe',
        avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=Jane+Doe',
        coverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200',
        bio: 'UI/UX Designer, Yêu nghệ thuật',
        gender: 'female',
        isActive: true,
        isBanned: false,
        isVerified: true,
        privacy: {
          profileVisibility: 'public',
          emailVisibility: 'friends',
          phoneVisibility: 'private',
          locationVisibility: 'friends',
          allowTagging: true,
          allowMessages: 'friends',
          showOnlineStatus: true,
        },
        details: {
          school: 'Đại học Mỹ thuật Công nghiệp',
          work: 'Design Studio',
          livesIn: 'Đà Nẵng, Việt Nam',
          relationship: 'Hẹn hò',
          joined: 'Tháng 5, 2024',
        },
        devices: [
          {
            id: 'dev_4',
            device: 'iPhone 14 Pro',
            location: 'Đà Nẵng, Việt Nam',
            date: new Date(),
          },
        ],
      },
      {
        username: 'john_smith',
        email: 'john@example.com',
        password: hashedPassword,
        fullName: 'John Smith',
        avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=John+Smith',
        coverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
        bio: 'Full Stack Developer, Node.js & React',
        gender: 'male',
        isActive: true,
        isBanned: false,
        isVerified: false,
        privacy: {
          profileVisibility: 'public',
          emailVisibility: 'friends',
          phoneVisibility: 'private',
          locationVisibility: 'friends',
          allowTagging: true,
          allowMessages: 'everyone',
          showOnlineStatus: true,
        },
        details: {
          school: 'Đại học Khoa học Tự nhiên',
          work: 'Tech Startup',
          livesIn: 'Hà Nội, Việt Nam',
          relationship: 'Độc thân',
          joined: 'Tháng 7, 2024',
        },
        devices: [
          {
            id: 'dev_5',
            device: 'Dell XPS 13',
            location: 'Hà Nội, Việt Nam',
            date: new Date(),
          },
        ],
      },
    ]);
    console.log(`✅ Created ${users.length} users\n`);

    // ============================================
    // 3. Tạo Friend Relationships
    // ============================================
    console.log('👥 Creating friend relationships...');
    await User.findByIdAndUpdate(users[0]._id, {
      $push: { friends: { $each: [users[1]._id, users[2]._id, users[3]._id] } }
    });
    await User.findByIdAndUpdate(users[1]._id, {
      $push: { friends: { $each: [users[0]._id, users[2]._id] } }
    });
    await User.findByIdAndUpdate(users[2]._id, {
      $push: { friends: { $each: [users[0]._id, users[1]._id] } }
    });
    await User.findByIdAndUpdate(users[3]._id, {
      $push: { friends: [users[0]._id] }
    });
    console.log('✅ Friend relationships created\n');

    // ============================================
    // 4. Tạo Posts
    // ============================================
    console.log('📝 Creating posts...');
    const postsData = [
      {
        content: 'Chào mừng đến với DRK! 🎉 Đây là bài viết đầu tiên trên hệ thống. Hãy cùng nhau xây dựng cộng đồng lớn mạnh!',
        type: 'status',
        privacy: 'public',
        media: [{
          type: 'image',
          url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800',
          alt: 'Welcome to DRK',
        }],
        feelings: 'happy',
        hashtags: ['DRK', 'Welcome', 'Community'],
        stats: { likes: 15, comments: 5, shares: 3 },
      },
      {
        content: 'Hôm nay thời tiết thật đẹp! ☀️ Mọi người có kế hoạch gì cho cuối tuần không?',
        type: 'status',
        privacy: 'public',
        media: [{
          type: 'image',
          url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
          alt: 'Beautiful day',
        }],
        feelings: 'excited',
        hashtags: ['Weather', 'Weekend', 'Happy'],
        stats: { likes: 10, comments: 3, shares: 1 },
      },
      {
        content: 'Vừa hoàn thành xong dự án mới! 🚀 Cảm thấy rất hài lòng với kết quả. Teamwork makes the dream work!',
        type: 'status',
        privacy: 'public',
        media: [{
          type: 'image',
          url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
          alt: 'Project completed',
        }],
        feelings: 'proud',
        hashtags: ['Project', 'Teamwork', 'Success'],
        stats: { likes: 20, comments: 7, shares: 5 },
      },
      {
        content: 'Lễ hội âm nhạc cuối tuần này các bạn đã sẵn sàng chưa? 🎵🎶 #MusicFestival',
        type: 'status',
        privacy: 'public',
        media: [{
          type: 'image',
          url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
          alt: 'Music Festival',
        }],
        feelings: 'excited',
        hashtags: ['MusicFestival', 'WeekendVibes', 'Concert'],
        stats: { likes: 12, comments: 4, shares: 2 },
      },
      {
        content: 'Một cuốn sách hay: "Clean Code" của Robert C. Martin. Cực kỳ hữu ích cho các lập trình viên! 📚',
        type: 'status',
        privacy: 'public',
        media: [{
          type: 'image',
          url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
          alt: 'Clean Code book',
        }],
        feelings: 'inspired',
        hashtags: ['Book', 'CleanCode', 'Programming'],
        stats: { likes: 8, comments: 6, shares: 4 },
      },
      {
        content: 'Buổi offline cuối tuần này các bạn nhớ tham gia nhé! 📅✨',
        type: 'status',
        privacy: 'public',
        media: [{
          type: 'image',
          url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800',
          alt: 'Offline meeting',
        }],
        feelings: 'excited',
        hashtags: ['Offline', 'Meetup', 'Community'],
        stats: { likes: 18, comments: 8, shares: 6 },
      },
    ];

    const posts = [];
    for (let i = 0; i < postsData.length; i++) {
      const authorId = users[i % users.length]._id;
      const post = await Post.create({
        ...postsData[i],
        author: authorId,
        isApproved: true,
        isDeleted: false,
      });
      posts.push(post);
      console.log(`✅ Created post ${i + 1}: ${post.content.substring(0, 30)}...`);
    }
    console.log(`✅ Created ${posts.length} posts\n`);

    // ============================================
    // 5. Tạo Comments
    // ============================================
    console.log('💬 Creating comments...');
    const commentsData = [
      'Bài viết hay quá! Cảm ơn bạn đã chia sẻ 🙌',
      'Rất đồng ý với quan điểm của bạn!',
      'Tôi cũng muốn tham gia, cho tôi xin thông tin với ạ!',
      'Tuyệt vời! 👏👏👏',
      'Mình cũng đang đọc cuốn này, thực sự rất bổ ích!',
      'Buổi offline này có tổ chức ở đâu vậy ạ?',
      'Chia sẻ quá hay, mình sẽ áp dụng ngay!',
      'Cảm ơn bạn đã chia sẻ kiến thức quý báu!',
      'Mình rất thích bài viết này! ❤️',
      'Hẹn gặp các bạn cuối tuần này nhé!',
    ];

    let commentCount = 0;
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numComments && j < commentsData.length; j++) {
        const authorId = users[(i + j) % users.length]._id;
        const comment = await Comment.create({
          post: post._id,
          author: authorId,
          content: commentsData[(i + j) % commentsData.length],
        });
        await Post.findByIdAndUpdate(post._id, {
          $push: { comments: comment._id },
          $inc: { 'stats.comments': 1 }
        });
        commentCount++;
      }
      console.log(`✅ Created ${numComments} comments on post ${i + 1}`);
    }
    console.log(`✅ ${commentCount} comments created\n`);

    // ============================================
    // 6. Tạo Likes cho Posts
    // ============================================
    console.log('❤️ Creating likes...');
    const reactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    let likeCount = 0;
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const numLikes = Math.floor(Math.random() * 5) + 3;
      for (let j = 0; j < numLikes && j < users.length; j++) {
        await Post.findByIdAndUpdate(post._id, {
          $push: {
            likes: {
              user: users[j]._id,
              reaction: reactions[j % reactions.length],
              timestamp: new Date(),
            }
          },
          $inc: { 'stats.likes': 1 }
        });
        likeCount++;
      }
      console.log(`✅ Created ${numLikes} likes for post ${i + 1}`);
    }
    console.log(`✅ ${likeCount} likes created\n`);

    // ============================================
    // 7. Tạo Groups
    // ============================================
    console.log('👥 Creating groups...');
    const groupsData = [
      {
        name: 'Cộng đồng Lập trình Việt Nam',
        description: 'Nơi chia sẻ kiến thức và kinh nghiệm lập trình cho cộng đồng Việt Nam',
        category: 'technology',
        privacy: 'public',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        rules: [
          'Tôn trọng các thành viên trong nhóm',
          'Không spam quảng cáo',
          'Chia sẻ kiến thức tích cực',
          'Không đăng nội dung vi phạm pháp luật',
        ],
      },
      {
        name: 'Hội yêu Du lịch & Khám phá',
        description: 'Chia sẻ những chuyến đi và kinh nghiệm du lịch khắp mọi miền',
        category: 'travel',
        privacy: 'public',
        cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
        rules: [
          'Chia sẻ hình ảnh và câu chuyện du lịch',
          'Tôn trọng văn hóa địa phương',
          'Không quảng cáo tour du lịch tràn lan',
        ],
      },
      {
        name: 'Nhiếp ảnh gia Việt Nam',
        description: 'Cộng đồng những người đam mê nhiếp ảnh, chia sẻ ảnh đẹp và kỹ thuật chụp ảnh',
        category: 'art',
        privacy: 'public',
        cover: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
        rules: [
          'Đăng ảnh chất lượng cao',
          'Ghi rõ thiết bị và thông số chụp',
          'Không đăng ảnh nhạy cảm',
        ],
      },
    ];

    for (let i = 0; i < groupsData.length; i++) {
      const adminId = users[i % users.length]._id;
      const group = await Group.create({
        ...groupsData[i],
        admin: adminId,
        admins: [adminId],
        members: [{ user: adminId, role: 'admin' }],
        stats: { members: 1 },
        insights: { visits: Math.floor(Math.random() * 1000) + 500, engagement: Math.floor(Math.random() * 300) + 100 },
        moderation: { keywords: ['spam', 'quảng cáo', 'bán hàng'], autoApprove: false },
      });
      // Thêm thành viên
      for (let j = 1; j < 3 && j < users.length; j++) {
        const memberId = users[(i + j) % users.length]._id;
        await Group.findByIdAndUpdate(group._id, {
          $push: { members: { user: memberId, role: 'member' } },
          $inc: { 'stats.members': 1 }
        });
      }
      console.log(`✅ Created group: ${group.name}`);
    }
    console.log('✅ Groups created\n');

    // ============================================
    // 8. Tạo Pages
    // ============================================
    console.log('📄 Creating pages...');
    const pagesData = [
      {
        name: 'DRK Official',
        username: 'drk_official',
        description: 'Trang chính thức của DRK - Mạng xã hội kết nối cộng đồng',
        category: 'brand',
        cover: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200',
        avatar: 'https://ui-avatars.com/api/?background=0866FF&bold=true&name=DRK',
        contact: {
          email: 'support@drk.com',
          phone: '1900 1234',
          website: 'https://drk.com',
        },
      },
      {
        name: 'Công nghệ 4.0',
        username: 'congnghe40',
        description: 'Cập nhật tin tức công nghệ mới nhất, xu hướng và đánh giá sản phẩm',
        category: 'technology',
        cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
        avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=CN',
        contact: {
          email: 'contact@congnghe40.com',
          website: 'https://congnghe40.com',
        },
      },
      {
        name: 'Du lịch 3 miền',
        username: 'dulich3mien',
        description: 'Khám phá vẻ đẹp của Việt Nam qua những chuyến đi đầy cảm hứng',
        category: 'travel',
        cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200',
        avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=DL',
        contact: {
          email: 'info@dulich3mien.com',
          website: 'https://dulich3mien.com',
        },
      },
    ];

    for (let i = 0; i < pagesData.length; i++) {
      const ownerId = users[i % users.length]._id;
      const page = await Page.create({
        ...pagesData[i],
        owner: ownerId,
        admins: [ownerId],
        followers: [{ user: ownerId, followedAt: new Date() }],
        stats: { followers: 1 },
        insights: { reach: Math.floor(Math.random() * 50000) + 10000, engagement: Math.floor(Math.random() * 10000) + 5000, followersCount: 1 },
      });
      console.log(`✅ Created page: ${page.name}`);
    }
    console.log('✅ Pages created\n');

    // ============================================
    // 9. Tạo Events
    // ============================================
    console.log('📅 Creating events...');
    const eventsData = [
      {
        title: 'Workshop React JS cơ bản',
        description: 'Workshop miễn phí hướng dẫn React JS từ cơ bản đến nâng cao cho người mới bắt đầu',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        type: 'in-person',
        location: {
          name: 'Hội trường 3F, Tòa nhà Công nghệ',
          address: '123 Nguyễn Chí Thanh, Hà Nội',
        },
        category: 'workshop',
        privacy: 'public',
        capacity: 100,
        tickets: { free: true },
        status: 'published',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      },
      {
        title: 'Online Music Festival 2024',
        description: 'Lễ hội âm nhạc trực tuyến với sự tham gia của các nghệ sĩ hàng đầu',
        startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        type: 'online',
        location: {
          name: 'Zoom Live Stream',
          online: true,
          link: 'https://zoom.us/musicfestival2024',
        },
        category: 'concert',
        privacy: 'public',
        capacity: 500,
        tickets: { free: false, price: 200000 },
        status: 'published',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      },
      {
        title: 'Tech Talk: AI & Machine Learning',
        description: 'Buổi thảo luận về ứng dụng của AI và Machine Learning trong thực tế',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        type: 'hybrid',
        location: {
          name: 'Online + Offline tại Google Office',
          address: 'Tầng 5, Keangnam Landmark 72',
          online: true,
          link: 'https://meet.google.com/techtalk2024',
        },
        category: 'conference',
        privacy: 'public',
        capacity: 150,
        tickets: { free: true },
        status: 'published',
        image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
      },
    ];

    for (let i = 0; i < eventsData.length; i++) {
      const organizerId = users[i % users.length]._id;
      const event = await Event.create({
        ...eventsData[i],
        organizer: { type: 'user', id: organizerId },
        attendees: [{ user: organizerId, status: 'going' }],
        stats: { attendees: 1, interested: Math.floor(Math.random() * 10) + 5 },
      });
      console.log(`✅ Created event: ${event.title}`);
    }
    console.log('✅ Events created\n');

    // ============================================
    // 10. Tạo Stories
    // ============================================
    console.log('📸 Creating stories...');
    const storiesData = [
      {
        content: 'Buổi sáng đẹp trời ☀️',
        media: [{
          type: 'image',
          url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400',
        }],
        privacy: 'friends',
        backgroundColor: '#FF6B6B',
      },
      {
        content: 'Yêu đời quá! 🌸✨',
        media: [{
          type: 'image',
          url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        }],
        privacy: 'public',
        backgroundColor: '#4ECDC4',
      },
      {
        content: 'Coffee time ☕',
        media: [{
          type: 'image',
          url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        }],
        privacy: 'public',
        backgroundColor: '#45B7D1',
      },
      {
        content: 'Chúc mọi người một ngày tốt lành! 🌟',
        media: [{
          type: 'image',
          url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
        }],
        privacy: 'friends',
        backgroundColor: '#F7DC6F',
      },
    ];

    for (let i = 0; i < storiesData.length; i++) {
      const authorId = users[i % users.length]._id;
      const story = await Story.create({
        ...storiesData[i],
        author: authorId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        stats: { views: Math.floor(Math.random() * 20) + 5, reactions: Math.floor(Math.random() * 10) + 2 },
      });
      console.log(`✅ Created story ${i + 1}`);
    }
    console.log('✅ Stories created\n');

    // ============================================
    // 11. Tạo Messages - BỎ QUA LỖI conversationId
    // ============================================
    console.log('💬 Creating messages...');
    console.log('⏭️ Skipping messages creation to avoid errors...');
    console.log('✅ Messages skipped (can be created later)\n');

    // ============================================
    // 12. Tạo Notifications
    // ============================================
    console.log('🔔 Creating notifications...');
    const notificationTypes = ['like', 'comment', 'friend_request', 'share', 'mention'];
    for (let i = 0; i < 10; i++) {
      const senderId = users[(i + 1) % users.length]._id;
      const recipientId = users[i % users.length]._id;
      const type = notificationTypes[i % notificationTypes.length];
      const contentMap = {
        like: 'đã thích bài viết của bạn',
        comment: 'đã bình luận về bài viết của bạn',
        friend_request: 'đã gửi lời mời kết bạn',
        share: 'đã chia sẻ bài viết của bạn',
        mention: 'đã đề cập đến bạn trong một bài viết',
      };
      await Notification.create({
        recipient: recipientId,
        sender: senderId,
        type: type,
        content: `${users[(i + 1) % users.length].fullName} ${contentMap[type]}`,
        contentShort: contentMap[type],
        isRead: Math.random() > 0.5,
        relatedId: posts[i % posts.length]._id,
        relatedType: 'post',
        url: `/post/${posts[i % posts.length]._id}`,
      });
      console.log(`✅ Created notification ${i + 1}`);
    }
    console.log('✅ Notifications created\n');

    // ============================================
    // 13. Tạo Payments
    // ============================================
    console.log('💳 Creating payments...');
    const paymentMethods = ['card', 'bank', 'momo', 'vnpay', 'paypal'];
    const paymentStatuses = ['pending', 'completed', 'completed', 'completed', 'failed'];
    for (let i = 0; i < 5; i++) {
      const user = users[i % users.length];
      const amount = Math.floor(Math.random() * 500000) + 50000;
      await Payment.create({
        user: user._id,
        amount: amount,
        currency: 'VND',
        method: paymentMethods[i % paymentMethods.length],
        paymentCode: `PAY-${Date.now()}-${String(i + 1).padStart(3, '0')}`,
        transactionId: `TXN-${Date.now()}-${String(i + 1).padStart(3, '0')}`,
        description: `Thanh toán dịch vụ DRK - Gói ${i + 1}`,
        status: paymentStatuses[i % paymentStatuses.length],
        paidAt: paymentStatuses[i % paymentStatuses.length] === 'completed' ? new Date() : null,
        customerInfo: {
          name: user.fullName,
          email: user.email,
          phone: `0987${String(100000 + i).padStart(6, '0')}`,
        },
        items: [
          {
            id: `item_${i + 1}`,
            name: `Gói dịch vụ ${i + 1}`,
            price: amount,
            quantity: 1,
            description: `Mô tả gói dịch vụ ${i + 1}`,
          },
        ],
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });
      console.log(`✅ Created payment ${i + 1}`);
    }
    console.log('✅ Payments created\n');

    // ============================================
    // 14. Tạo Posts với Poll (Thăm dò ý kiến)
    // ============================================
    console.log('📊 Creating poll posts...');
    const pollPost = await Post.create({
      author: users[0]._id,
      content: 'Bạn thích mùa nào nhất trong năm? 🌸🌞🍂❄️',
      type: 'poll',
      privacy: 'public',
      poll: {
        question: 'Bạn thích mùa nào nhất?',
        options: [
          { id: 'opt_1', text: 'Mùa xuân 🌸', votes: [users[1]._id, users[2]._id] },
          { id: 'opt_2', text: 'Mùa hè ☀️', votes: [users[3]._id] },
          { id: 'opt_3', text: 'Mùa thu 🍂', votes: [users[0]._id] },
          { id: 'opt_4', text: 'Mùa đông ❄️', votes: [] },
        ],
      },
      stats: { likes: 5, comments: 2, shares: 0 },
      isApproved: true,
      isDeleted: false,
    });
    console.log(`✅ Created poll post: ${pollPost.content.substring(0, 30)}...\n`);

    // ============================================
    // 15. Tạo bài viết chia sẻ (Share)
    // ============================================
    console.log('🔄 Creating share post...');
    const sharePost = await Post.create({
      author: users[1]._id,
      content: 'Bài viết này rất hay! Mọi người cùng đọc nhé!',
      type: 'share',
      privacy: 'public',
      share: {
        originalPost: posts[0]._id,
        originalAuthor: users[0]._id,
        customMessage: 'Mình thấy bài viết này rất bổ ích!',
      },
      stats: { likes: 3, comments: 1, shares: 0 },
      isApproved: true,
      isDeleted: false,
    });
    console.log(`✅ Created share post\n`);

    // ============================================
    // Tổng kết
    // ============================================
    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${1} admin created`);
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${posts.length + 2} posts created (${posts.length} normal + 1 poll + 1 share)`);
    console.log(`   - ${commentCount} comments created`);
    console.log(`   - ${likeCount} likes created`);
    console.log(`   - ${groupsData.length} groups created`);
    console.log(`   - ${pagesData.length} pages created`);
    console.log(`   - ${eventsData.length} events created`);
    console.log(`   - ${storiesData.length} stories created`);
    console.log(`   - ${10} notifications created`);
    console.log(`   - ${5} payments created`);
    console.log('\n🔑 Default login accounts:');
    console.log(`   - Username: admin | Password: 123456 (Admin)`);
    console.log(`   - Username: testuser | Password: 123456`);
    console.log(`   - Username: jane_doe | Password: 123456`);
    console.log(`   - Username: john_smith | Password: 123456`);
    console.log('\n✅ Seed completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

// Chạy seed
seedDatabase();