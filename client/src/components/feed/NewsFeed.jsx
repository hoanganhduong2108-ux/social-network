// ============================================
// FILE: client/src/components/feed/NewsFeed.jsx
// MÔ TẢ: Bảng tin hiển thị các bài viết
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import StoryCard from './StoryCard';
import Loading from '../common/Loading';
import { FiRefreshCw } from 'react-icons/fi';

const NewsFeed = () => {
  // ============================================
  // Khởi tạo hooks và state
  // ============================================
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stories, setStories] = useState([]);

  // ============================================
  // Lấy bài viết từ API
  // ============================================
  const fetchPosts = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await api.get('/posts/feed', {
        params: { page: pageNum, limit: 10 },
      });

      const newPosts = response.posts || [];
      
      if (refresh || pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ============================================
  // Lấy stories
  // ============================================
  const fetchStories = useCallback(async () => {
    try {
      const response = await api.get('/stories');
      setStories(response.stories || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  }, []);

  // ============================================
  // Xử lý tạo bài viết mới
  // ============================================
  const handleNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  // ============================================
  // Xử lý cập nhật bài viết
  // ============================================
  const handleUpdatePost = (updatedPost) => {
    setPosts(prev =>
      prev.map(post =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  // ============================================
  // Xử lý xóa bài viết
  // ============================================
  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  // ============================================
  // Xử lý tải thêm
  // ============================================
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  // ============================================
  // Xử lý refresh
  // ============================================
  const handleRefresh = () => {
    fetchPosts(1, true);
    fetchStories();
  };

  // ============================================
  // Effect: Fetch dữ liệu ban đầu
  // ============================================
  useEffect(() => {
    fetchPosts(1);
    fetchStories();
  }, [fetchPosts, fetchStories]);

  // ============================================
  // Render
  // ============================================
  if (loading && posts.length === 0) {
    return <Loading text="Đang tải bài viết..." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Nút refresh */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stories */}
      {stories.length > 0 && (
        <div className="mb-4 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {stories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        </div>
      )}

      {/* Tạo bài viết mới */}
      <CreatePost onPostCreated={handleNewPost} />

      {/* Danh sách bài viết */}
      <div className="space-y-4 mt-4">
        {posts.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                onUpdate={handleUpdatePost}
                onDelete={handleDeletePost}
              />
            ))}
            
            {/* Nút tải thêm */}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-3 text-primary-500 hover:text-primary-600 font-medium disabled:opacity-50"
              >
                {loading ? 'Đang tải...' : 'Xem thêm bài viết'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;