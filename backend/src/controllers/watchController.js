// ============================================
// FILE: backend/src/controllers/watchController.js
// MÔ TẢ: Controller cho Watch/Video
// ============================================

class WatchController {
  // ============================================
  // Lấy danh sách video
  // ============================================
  async getVideos(req, res, next) {
    try {
      // Dữ liệu mẫu
      const videos = [
        {
          _id: '1',
          title: 'Hướng dẫn React JS cơ bản',
          description: 'Video hướng dẫn React JS từ cơ bản đến nâng cao',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          duration: '10:30',
          views: 1234,
          author: {
            _id: 'user_1',
            fullName: 'Nguyễn Văn A',
            avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=NVA',
            subscribers: 5678,
          },
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          title: 'JavaScript nâng cao - Closure và Hoisting',
          description: 'Tìm hiểu về Closure và Hoisting trong JavaScript',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          duration: '15:45',
          views: 890,
          author: {
            _id: 'user_2',
            fullName: 'Trần Thị B',
            avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=TTB',
            subscribers: 3456,
          },
          createdAt: new Date().toISOString(),
        },
      ];

      res.json({
        success: true,
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WatchController();