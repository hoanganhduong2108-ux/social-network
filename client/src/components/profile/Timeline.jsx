// ============================================
// FILE: client/src/components/profile/Timeline.jsx
// MÔ TẢ: Dòng thời gian của người dùng
// ============================================

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import PostCard from '../feed/PostCard';
import CreatePost from '../feed/CreatePost';
import Loading from '../common/Loading';
import { FiPlus } from 'react-icons/fi';

const Timeline = ({ userId, isOwnProfile }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Lấy bài viết
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get(`/posts/user/${userId}`, {
          params: { page, limit: 10 },
        });
        const newPosts = response.data.posts || [];
        if (page === 1) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        setHasMore(newPosts.length === 10);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [userId, page]);

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(prev =>
      prev.map(post =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  if (loading && posts.length === 0) {
    return <Loading text="Đang tải bài viết..." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {isOwnProfile && (
        <CreatePost onPostCreated={handleNewPost} />
      )}
      
      <div className="space-y-4 mt-4">
        {posts.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {isOwnProfile ? 'Bạn chưa có bài viết nào' : 'Chưa có bài viết nào'}
            </p>
            {isOwnProfile && (
              <button className="btn-primary mt-4">
                <FiPlus className="w-4 h-4 mr-2" />
                Tạo bài viết
              </button>
            )}
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={handleUpdatePost}
                onDelete={handleDeletePost}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => setPage(p => p + 1)}
                className="w-full py-3 text-primary-500 hover:text-primary-600 font-medium"
              >
                Xem thêm
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Timeline;