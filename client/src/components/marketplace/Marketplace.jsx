// ============================================
// FILE: src/components/marketplace/Marketplace.jsx
// MÔ TẢ: Trang chợ - Mua bán sản phẩm
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import {
  FiSearch,
  FiPlus,
  FiGrid,
  FiList,
  FiMapPin,
  FiTag,
  FiDollarSign,
} from 'react-icons/fi';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/marketplace/products', {
          params: { search: searchTerm, filter },
        });
        setProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchTerm, filter]);

  if (loading) {
    return <Loading text="Đang tải sản phẩm..." />;
  }

  return (
    <>
      <Helmet>
        <title>Chợ - VibeSpace</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Chợ
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Mua bán các mặt hàng mới và đã qua sử dụng
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Đăng bán
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="electronics">Điện tử</option>
              <option value="fashion">Thời trang</option>
              <option value="home">Nhà cửa</option>
              <option value="vehicles">Xe cộ</option>
              <option value="books">Sách</option>
              <option value="other">Khác</option>
            </select>
            <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20'
                    : 'text-gray-400'
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${
                  viewMode === 'list'
                    ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20'
                    : 'text-gray-400'
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <FiTag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
            </p>
          </div>
        ) : (
          <div
            className={`grid ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'grid-cols-1 gap-3'
            }`}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// Component ProductCard
const ProductCard = ({ product, viewMode }) => {
  return (
    <Link
      to={`/marketplace/${product._id}`}
      className={`card hover:shadow-lg transition-all duration-200 ${
        viewMode === 'list' ? 'flex gap-4' : ''
      }`}
    >
      <div
        className={`${
          viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'
        } bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden`}
      >
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400x400'}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className={`flex-1 ${viewMode === 'list' ? 'py-2' : 'mt-3'}`}>
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
          {product.title}
        </h3>
        <p className="text-lg font-bold text-blue-500 mt-1 flex items-center gap-1">
          <FiDollarSign className="w-4 h-4" />
          {product.price?.toLocaleString()}đ
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <FiMapPin className="w-3 h-3" />
          <span>{product.location || 'Không xác định'}</span>
        </div>
        {viewMode === 'list' && product.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <img
              src={
                product.seller?.avatar ||
                'https://ui-avatars.com/api/?background=random&bold=true'
              }
              alt={product.seller?.fullName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {product.seller?.fullName}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(product.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Marketplace;