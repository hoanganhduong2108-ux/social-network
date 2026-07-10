// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

// Dữ liệu giả
const mockUser = {
  _id: '123456789',
  username: 'testuser',
  fullName: 'Nguyễn Văn Test',
  email: 'test@example.com',
  avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=Test+User',
  friends: [],
  followers: [],
  following: [],
  stats: { posts: 5, comments: 10, likes: 20 },
  isActive: true,
  isBanned: false,
};

const mockPosts = [
  {
    _id: '1',
    content: 'Chào mừng bạn đến với Social Network! Đây là bài viết demo.',
    author: mockUser,
    media: [],
    likes: [{ user: '123456789' }],
    comments: [],
    stats: { likes: 1, comments: 0, shares: 0 },
    createdAt: new Date().toISOString(),
    privacy: 'public',
  },
  {
    _id: '2',
    content: 'Hôm nay thời tiết thật đẹp! ☀️',
    author: mockUser,
    media: [],
    likes: [],
    comments: [],
    stats: { likes: 0, comments: 0, shares: 0 },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    privacy: 'public',
  },
];

// Định nghĩa các API mock
export const handlers = [
  // Đăng nhập
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.emailOrUsername === 'test' || body.emailOrUsername === 'test@example.com') {
      return HttpResponse.json({
        success: true,
        user: mockUser,
        token: 'mock-jwt-token-123456',
      });
    }
    return HttpResponse.json(
      { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' },
      { status: 401 }
    );
  }),

  // Đăng ký
  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      user: { ...mockUser, username: body.username, fullName: body.fullName, email: body.email },
      token: 'mock-jwt-token-123456',
    });
  }),

  // Lấy thông tin user hiện tại
  http.get('/api/users/me', () => {
    return HttpResponse.json({
      success: true,
      user: mockUser,
    });
  }),

  // Lấy bảng tin
  http.get('/api/posts/feed', () => {
    return HttpResponse.json({
      success: true,
      posts: mockPosts,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });
  }),

  // Lấy bài viết của user
  http.get('/api/posts/user/:userId', () => {
    return HttpResponse.json({
      success: true,
      posts: mockPosts,
    });
  }),

  // Lấy danh sách bạn bè
  http.get('/api/users/:userId/friends', () => {
    return HttpResponse.json({
      success: true,
      friends: [],
    });
  }),

  // Lấy đề xuất bạn bè
  http.get('/api/users/suggestions/friends', () => {
    return HttpResponse.json({
      success: true,
      suggestions: [],
    });
  }),

  // Lấy xu hướng
  http.get('/api/explore/trending', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { topic: '#SocialNetwork', posts: 1234 },
        { topic: '#ReactJS', posts: 567 },
        { topic: '#JavaScript', posts: 890 },
      ],
    });
  }),

  // Lấy danh sách nhóm
  http.get('/api/groups', () => {
    return HttpResponse.json({
      success: true,
      groups: [],
    });
  }),

  // Lấy danh sách trang
  http.get('/api/pages', () => {
    return HttpResponse.json({
      success: true,
      pages: [],
    });
  }),

  // Lấy danh sách sự kiện
  http.get('/api/events', () => {
    return HttpResponse.json({
      success: true,
      events: [],
    });
  }),

  // Lấy danh sách cuộc trò chuyện
  http.get('/api/messages/conversations', () => {
    return HttpResponse.json({
      success: true,
      conversations: [],
    });
  }),

  // Lấy thông báo
  http.get('/api/notifications', () => {
    return HttpResponse.json({
      success: true,
      notifications: [],
      unreadCount: 0,
    });
  }),

  // Lấy số thông báo chưa đọc
  http.get('/api/notifications/unread', () => {
    return HttpResponse.json({
      success: true,
      count: 0,
    });
  }),
];