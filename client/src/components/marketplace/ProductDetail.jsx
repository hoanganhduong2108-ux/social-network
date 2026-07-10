// ============================================
// FILE: src/components/marketplace/ProductDetail.jsx
// MÔ TẢ: Chi tiết sản phẩm
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';
import {
  FiDollarSign,
  FiMapPin,
  FiMessageSquare,
  FiHeart,
  FiShare2,
  FiFlag,
  FiArrowLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/marketplace/products/${productId}`);
        setProduct(response.data.product);
        setIsLiked(response.data.isLiked || false);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Không thể tải thông tin sản phẩm');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.delete(`/marketplace/products/${productId}/like`);
        setIsLiked(false);
      } else {
        await api.post(`/marketplace/products/${productId}/like`);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error liking product:', error);
      toast.error('Không thể thực hiện hành động');
    }
  };

  const handleContact = () => {
    navigate(`/messages/${product.seller._id}`);
  };

  if (loading) {
    return <Loading text="Đang tải thông tin sản phẩm..." />;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.title} - VibeSpace</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <FiArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-0 overflow-hidden">
            <div className="aspect-square bg-gray-100 dark:bg-gray-700">
              <img
                src={
                  product.images?.[currentImage] || 'https://via.placeholder.com/600x600'
                }
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      currentImage === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {product.title}
              </h1>
              <p className="text-3xl font-bold text-blue-500 mt-2 flex items-center gap-1">
                <FiDollarSign className="w-6 h-6" />
                {product.price?.toLocaleString()}đ
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FiMapPin className="w-4 h-4" />
              <span>{product.location || 'Không xác định'}</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <img
                src={
                  product.seller?.avatar ||
                  'https://ui-avatars.com/api/?background=random&bold=true'
                }
                alt={product.seller?.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {product.seller?.fullName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Thành viên từ {new Date(product.seller?.createdAt).getFullYear()}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Mô tả
              </h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {product.description || 'Không có mô tả'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleContact}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <FiMessageSquare className="w-5 h-5" />
                Nhắn tin cho người bán
              </button>
              <button
                onClick={handleLike}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  isLiked
                    ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                <FiShare2 className="w-5 h-5" />
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                <FiFlag className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;