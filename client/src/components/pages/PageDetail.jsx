// ============================================
// FILE: client/src/components/pages/PageDetail.jsx
// MÔ TẢ: Chi tiết trang (Fanpage)
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
  FiEdit2,
  FiInfo,
  FiMail,
  FiPhone,
  FiGlobe,
  FiStar,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PageDetail = ({ pageId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Lấy thông tin trang
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await api.get(`/pages/${pageId}`);
        setPage(response.data.page);
        setPosts(response.data.page.posts || []);
        setIsFollowing(response.data.page.isFollowing || false);
      } catch (error) {
        console.error('Error fetching page:', error);
        toast.error('Không thể tải thông tin trang');
        navigate('/pages');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [pageId]);

  // Xử lý theo dõi trang
  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/pages/${pageId}/follow`);
        setIsFollowing(false);
        toast.success('Đã bỏ theo dõi trang');
      } else {
        await api.post(`/pages/${pageId}/follow`);
        setIsFollowing(true);
        toast.success('Đã theo dõi trang');
      }
    } catch (error) {
      console.error('Error following page:', error);
      toast.error('Không thể thực hiện hành động');
    }
  };

  if (loading) {
    return <Loading text="Đang tải thông tin trang..." />;
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Không tìm thấy trang</p>
      </div>
    );
  }

  const isAdmin = page.admins?.includes(user?._id) || page.owner?._id === user?._id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover và avatar */}
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
                src={page.avatar || 'https://ui-avatars.com/api/?background=random&bold=true&size=128'}
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
                  className={isFollowing ? 'btn-secondary bg-white/20 hover:bg-white/30 text-white' : 'btn-primary'}
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

      {/* Tab navigation */}
      <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-gray-700">
        <button className="px-4 py-2 border-b-2 border-primary-500 text-primary-500 font-medium">
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

      {/* Nội dung */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bài viết */}
        <div className="lg:col-span-2">
          {isFollowing && (
            <CreatePost
              onPostCreated={(newPost) => {
                setPosts([newPost, ...posts]);
              }}
            />
          )}
          <div className="space-y-4 mt-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            {posts.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Chưa có bài viết nào
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Thông tin trang */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiInfo className="text-primary-500" />
              Giới thiệu
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {page.description || 'Chưa có mô tả'}
            </p>
            <div className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {page.contact?.email && (
                <p className="flex items-center gap-2">
                  <FiMail className="w-4 h-4" />
                  {page.contact.email}
                </p>
              )}
              {page.contact?.phone && (
                <p className="flex items-center gap-2">
                  <FiPhone className="w-4 h-4" />
                  {page.contact.phone}
                </p>
              )}
              {page.contact?.website && (
                <p className="flex items-center gap-2">
                  <FiGlobe className="w-4 h-4" />
                  <a href={page.contact.website} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
                    {page.contact.website}
                  </a>
                </p>
              )}
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
                    <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                      <div className="flex items-center gap-2">
                        <img
                          src={review.user?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
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
        </div>
      </div>
    </div>
  );
};

export default PageDetail;