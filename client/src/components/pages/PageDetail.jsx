// ============================================
// FILE: src/components/pages/PageDetail.jsx
// MÔ TẢ: Chi tiết trang (Fanpage) - SỬA LỖI
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';
import CreatePost from '../feed/CreatePost';
import PostCard from '../feed/PostCard';
import {
  FiUsers,
  FiUserPlus,
  FiUserMinus,
  FiSettings,
  FiInfo,
  FiMail,
  FiPhone,
  FiGlobe,
  FiStar,
  FiRefreshCw,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PageDetail = ({ pageId: propPageId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [error, setError] = useState(null);

  // Lấy pageId từ props hoặc URL params
  const pageId = propPageId;

  // ============================================
  // FETCH PAGE - SỬA LỖI XỬ LÝ RESPONSE
  // ============================================
  const fetchPage = async () => {
    if (!pageId) {
      setError('Không tìm thấy ID trang');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📖 Fetching page:', pageId);
      
      const response = await api.get(`/pages/${pageId}`);
      console.log('📖 Page response:', response);
      
      // ============================================
      // XỬ LÝ RESPONSE ĐÚNG CẤU TRÚC
      // ============================================
      let pageData = null;
      
      // Kiểm tra các trường hợp response khác nhau
      if (response && response.page) {
        // Trường hợp có trường page
        pageData = response.page;
      } else if (response && response.data && response.data.page) {
        // Trường hợp có data.page
        pageData = response.data.page;
      } else if (response && response.success && response.data) {
        // Trường hợp có success và data
        pageData = response.data;
      } else if (response && response._id) {
        // Trường hợp response là object page trực tiếp
        pageData = response;
      } else if (response && typeof response === 'object') {
        // Fallback: lấy toàn bộ response nếu có _id
        if (response._id) {
          pageData = response;
        } else {
          // Tìm kiếm bất kỳ trường nào có _id
          for (const key of Object.keys(response)) {
            if (response[key] && response[key]._id) {
              pageData = response[key];
              break;
            }
          }
        }
      }
      
      // Nếu vẫn không có dữ liệu, thử lấy từ các trường khác
      if (!pageData) {
        pageData = response?.data || response?.page || null;
      }
      
      console.log('📖 Page data:', pageData);
      
      if (!pageData || !pageData._id) {
        console.error('❌ Invalid page data:', pageData);
        setError('Không tìm thấy trang');
        setLoading(false);
        return;
      }
      
      setPage(pageData);
      setIsFollowing(pageData.isFollowing || false);
      setPosts(pageData.posts || []);
      
    } catch (error) {
      console.error('❌ Error fetching page:', error);
      setError(error.message || 'Không thể tải thông tin trang');
      toast.error('Không thể tải thông tin trang');
      
      // Nếu lỗi 404, quay lại trang danh sách
      if (error.response?.status === 404) {
        navigate('/pages');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================
  // HANDLE REFRESH
  // ============================================
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPage();
  };

  // ============================================
  // FOLLOW/UNFOLLOW PAGE
  // ============================================
  const handleFollow = async () => {
    if (!page) return;
    
    try {
      if (isFollowing) {
        await api.delete(`/pages/${pageId}/follow`);
        setIsFollowing(false);
        setPage(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: (prev.stats?.followers || 1) - 1
          }
        }));
        toast.success('Đã bỏ theo dõi trang');
      } else {
        await api.post(`/pages/${pageId}/follow`);
        setIsFollowing(true);
        setPage(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: (prev.stats?.followers || 0) + 1
          }
        }));
        toast.success('Đã theo dõi trang');
      }
    } catch (error) {
      console.error('❌ Error following page:', error);
      toast.error('Không thể thực hiện hành động');
    }
  };

  // ============================================
  // EFFECT
  // ============================================
  useEffect(() => {
    if (pageId) {
      fetchPage();
    }
  }, [pageId]);

  // ============================================
  // RENDER LOADING
  // ============================================
  if (loading) {
    return <Loading text="Đang tải thông tin trang..." />;
  }

  // ============================================
  // RENDER ERROR
  // ============================================
  if (error || !page) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-gray-500 dark:text-gray-400">
          {error || 'Không tìm thấy trang'}
        </p>
        <button
          onClick={() => navigate('/pages')}
          className="mt-4 btn-primary"
        >
          Quay lại danh sách trang
        </button>
      </div>
    );
  }

  // ============================================
  // RENDER CHÍNH
  // ============================================
  const isAdmin = page.admins?.includes(user?._id) || page.owner?._id === user?._id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header với Cover và Avatar */}
      <div className="card p-0 overflow-hidden">
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
          {page.coverPhoto && (
            <img
              src={page.coverPhoto}
              alt={page.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-end gap-4">
              <img
                src={
                  page.avatar ||
                  'https://ui-avatars.com/api/?background=random&bold=true&size=128'
                }
                alt={page.name}
                className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800"
              />
              <div className="flex-1 text-white">
                <h1 className="text-2xl font-bold">{page.name}</h1>
                <p className="text-sm opacity-90">
                  {page.stats?.followers || 0} người theo dõi
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFollow}
                  className={
                    isFollowing
                      ? 'btn-secondary bg-white/20 hover:bg-white/30 text-white'
                      : 'btn-primary'
                  }
                >
                  {isFollowing ? (
                    <>
                      <FiUserMinus className="w-4 h-4 mr-2" />
                      Đang theo dõi
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="w-4 h-4 mr-2" />
                      Theo dõi
                    </>
                  )}
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="btn-secondary bg-white/20 hover:bg-white/30 text-white disabled:opacity-50"
                >
                  <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                {isAdmin && (
                  <button className="btn-secondary bg-white/20 hover:bg-white/30 text-white">
                    <FiSettings className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-gray-700">
        <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-500 font-medium">
          Bài viết
        </button>
        <button
          onClick={() => setShowReviews(!showReviews)}
          className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Đánh giá ({page.stats?.reviews || 0})
        </button>
        <button className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          Giới thiệu
        </button>
      </div>

      {/* Nội dung chính */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Tạo bài viết mới - chỉ hiển thị khi đang theo dõi */}
          {isFollowing && (
            <CreatePost
              onPostCreated={(newPost) => {
                setPosts([newPost, ...posts]);
              }}
            />
          )}
          
          <div className="space-y-4 mt-4">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Chưa có bài viết nào
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar - Thông tin trang */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiInfo className="text-blue-500" />
              Giới thiệu
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {page.description || 'Chưa có mô tả'}
            </p>
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              <p>📅 Tạo ngày: {new Date(page.createdAt).toLocaleDateString('vi-VN')}</p>
              <p>👥 {page.stats?.followers || 0} người theo dõi</p>
              <p>📝 {page.stats?.posts || 0} bài viết</p>
            </div>
          </div>

          {/* Đánh giá */}
          {showReviews && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FiStar className="text-yellow-500" />
                Đánh giá
              </h3>
              {page.reviews?.length > 0 ? (
                <div className="space-y-3">
                  {page.reviews.slice(0, 5).map((review, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            review.user?.avatar ||
                            'https://ui-avatars.com/api/?background=random&bold=true'
                          }
                          alt={review.user?.fullName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {review.user?.fullName}
                        </span>
                        <span className="text-sm text-yellow-500">
                          {'⭐'.repeat(review.rating)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {review.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chưa có đánh giá
                </p>
              )}
            </div>
          )}

          {/* Liên hệ */}
          {(page.contact?.email || page.contact?.phone || page.contact?.website) && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Liên hệ
              </h3>
              <div className="space-y-2 text-sm">
                {page.contact?.email && (
                  <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiMail className="w-4 h-4" />
                    {page.contact.email}
                  </p>
                )}
                {page.contact?.phone && (
                  <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiPhone className="w-4 h-4" />
                    {page.contact.phone}
                  </p>
                )}
                {page.contact?.website && (
                  <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiGlobe className="w-4 h-4" />
                    <a
                      href={page.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {page.contact.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageDetail;