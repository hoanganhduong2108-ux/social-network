// ============================================
// FILE: backend/src/controllers/marketplaceController.js
// MÔ TẢ: Controller cho Marketplace
// ============================================

class MarketplaceController {
  // ============================================
  // Lấy danh sách sản phẩm
  // ============================================
  async getProducts(req, res, next) {
    try {
      const { search = '', filter = 'all' } = req.query;
      
      // Dữ liệu mẫu
      const products = [
        {
          _id: '1',
          title: 'iPhone 14 Pro Max - 256GB',
          price: 25000000,
          category: 'Đồ điện tử',
          description: 'iPhone 14 Pro Max chính hãng, còn bảo hành',
          location: 'Hà Nội',
          images: ['https://images.unsplash.com/photo-1675557009875-436f09780264?w=400'],
          seller: {
            _id: 'user_1',
            fullName: 'Nguyễn Văn A',
            avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=NVA',
          },
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          title: 'Laptop Dell XPS 13',
          price: 18000000,
          category: 'Đồ điện tử',
          description: 'Laptop Dell XPS 13, i7, 16GB RAM, 512GB SSD',
          location: 'TP. Hồ Chí Minh',
          images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400'],
          seller: {
            _id: 'user_2',
            fullName: 'Trần Thị B',
            avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=TTB',
          },
          createdAt: new Date().toISOString(),
        },
      ];

      // Lọc theo danh mục
      let filteredProducts = products;
      if (filter !== 'all') {
        filteredProducts = products.filter(p => p.category === filter);
      }

      // Tìm kiếm
      if (search) {
        filteredProducts = filteredProducts.filter(p =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      res.json({
        success: true,
        products: filteredProducts,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Tạo sản phẩm mới
  // ============================================
  async createProduct(req, res, next) {
    try {
      // TODO: Implement create product
      res.json({
        success: true,
        message: 'Product created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Lấy chi tiết sản phẩm
  // ============================================
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      
      const product = {
        _id: id,
        title: 'iPhone 14 Pro Max - 256GB',
        price: 25000000,
        category: 'Đồ điện tử',
        description: 'iPhone 14 Pro Max chính hãng, còn bảo hành',
        location: 'Hà Nội',
        images: ['https://images.unsplash.com/photo-1675557009875-436f09780264?w=400'],
        seller: {
          _id: 'user_1',
          fullName: 'Nguyễn Văn A',
          avatar: 'https://ui-avatars.com/api/?background=random&bold=true&name=NVA',
          createdAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      };

      res.json({
        success: true,
        product,
        isLiked: false,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MarketplaceController();