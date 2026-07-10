// ============================================
// FILE: backend/src/controllers/exploreController.js
// MÔ TẢ: Controller cho trang khám phá
// ============================================

class ExploreController {
  // ============================================
  // Lấy xu hướng
  // ============================================
  async getTrending(req, res, next) {
    try {
      // Dữ liệu mẫu (sau này lấy từ database)
      const trending = [
        { topic: '#VibeSpace', posts: 1234 },
        { topic: '#ReactJS', posts: 567 },
        { topic: '#JavaScript', posts: 890 },
        { topic: '#CodingLife', posts: 345 },
        { topic: '#AI', posts: 234 },
      ];

      res.json({
        success: true,
        data: trending,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Tìm kiếm
  // ============================================
  async search(req, res, next) {
    try {
      const { q, type = 'all' } = req.query;
      
      // TODO: Implement search logic
      res.json({
        success: true,
        data: [],
        query: q,
        type,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExploreController();