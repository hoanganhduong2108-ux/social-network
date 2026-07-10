// ============================================
// FILE: src/components/feed/NewsFeed.jsx
// MÔ TẢ: Bảng tin - SỬA LỖI HIỂN THỊ STORY
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import CreatePost from './CreatePost';
import CreateStory from './CreateStory';
import PostCard from './PostCard';
import PostEditor from './PostEditor';
import StoryCard from '../common/StoryCard';
import Loading from '../common/Loading';
import { FiRefreshCw, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const NewsFeed = ({ showCreateStory, setShowCreateStory, openCreateStory }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [localShowCreateStory, setLocalShowCreateStory] = useState(false);
  
  // ============================================
  // STATE CHỈNH SỬA POST
  // ============================================
  const [editingPost, setEditingPost] = useState(null);
  const [showPostEditor, setShowPostEditor] = useState(false);

  // ============================================
  // FETCH POSTS
  // ============================================
  const fetchPosts = useCallback(
    async (pageNum = 1, refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else if (pageNum === 1) {
          setLoading(true);
        }

        console.log(`📖 Fetching posts page ${pageNum}...`);
        const response = await api.get('/posts/feed', {
          params: { page: pageNum, limit: 10 },
        });

        console.log('📖 Posts response:', response);
        const newPosts = response.posts || [];

        if (refresh || pageNum === 1) {
          setPosts(newPosts);
          console.log(`✅ Set ${newPosts.length} posts`);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
          console.log(`✅ Added ${newPosts.length} more posts`);
        }

        setHasMore(newPosts.length === 10);
        setPage(pageNum);
      } catch (error) {
        console.error('❌ Error fetching posts:', error);
        toast.error('Không thể tải bài viết');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ============================================
  // FETCH STORIES
  // ============================================
  const fetchStories = useCallback(async () => {
    try {
      console.log('📖 Fetching stories...');
      const response = await api.get('/stories');
      console.log('📖 Stories response:', response);
      
      const validStories = (response.stories || []).filter(story => {
        if (!story || !story._id) {
          console.warn('⚠️ Invalid story found:', story);
          return false;
        }
        if (story.expiresAt) {
          const expiresAt = new Date(story.expiresAt);
          const now = new Date();
          if (expiresAt < now) {
            console.log(`⏰ Story expired: ${story._id}`);
            return false;
          }
        }
        return true;
      });
      
      console.log(`✅ Found ${validStories.length} valid stories`);
      setStories(validStories);
    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      setStories([]);
    }
  }, []);

  // ============================================
  // HANDLE NEW POST
  // ============================================
  const handleNewPost = (newPost) => {
    console.log('📝 New post received in NewsFeed:', newPost);
    
    if (!newPost || !newPost._id) {
      console.error('❌ Invalid post data:', newPost);
      toast.error('Dữ liệu bài viết không hợp lệ');
      return;
    }

    setPosts(prev => {
      const exists = prev.some(p => p._id === newPost._id);
      if (exists) {
        console.log('⚠️ Post already exists in feed');
        return prev;
      }
      console.log('✅ Adding new post to feed, ID:', newPost._id);
      return [newPost, ...prev];
    });
  };

  // ============================================
  // HANDLE UPDATE POST
  // ============================================
  const handleUpdatePost = (updatedPost) => {
    console.log('📝 Updating post:', updatedPost?._id);
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  // ============================================
  // HANDLE DELETE POST
  // ============================================
  const handleDeletePost = (postId) => {
    console.log('🗑️ Deleting post:', postId);
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  // ============================================
  // HANDLE NEW STORY - SỬA LỖI (THÊM LOG VÀ KIỂM TRA)
  // ============================================
  const handleNewStory = (newStory) => {
    console.log('📝 New story received in NewsFeed:', newStory);
    
    if (!newStory || !newStory._id) {
      console.error('❌ Invalid story data:', newStory);
      toast.error('Dữ liệu story không hợp lệ');
      return;
    }

    setStories(prev => {
      // Kiểm tra trùng lặp
      const exists = prev.some(s => s._id === newStory._id);
      if (exists) {
        console.log('⚠️ Story already exists in list');
        return prev;
      }
      console.log('✅ Adding new story to list, ID:', newStory._id);
      return [newStory, ...prev];
    });
  };

  // ============================================
  // XỬ LÝ CHỈNH SỬA POST
  // ============================================
  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowPostEditor(true);
  };

  const handleCloseEditor = () => {
    setShowPostEditor(false);
    setEditingPost(null);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => 
      prev.map(p => p._id === updatedPost._id ? updatedPost : p)
    );
    handleCloseEditor();
  };

  // ============================================
  // XỬ LÝ STORY
  // ============================================
  const handleDeleteStory = async (storyId) => {
    try {
      await api.delete(`/stories/${storyId}`);
      setStories(prev => prev.filter(s => s._id !== storyId));
      toast.success('Đã xóa story');
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Không thể xóa story');
    }
  };

  const handleEditStory = (story) => {
    toast.info('Tính năng chỉnh sửa story đang phát triển');
  };

  // ============================================
  // LOAD MORE & REFRESH
  // ============================================
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Refreshing feed...');
    fetchPosts(1, true);
    fetchStories();
  };

  const openStoryModal = () => {
    if (openCreateStory) {
      openCreateStory();
    } else if (setShowCreateStory) {
      setShowCreateStory(true);
    } else {
      setLocalShowCreateStory(true);
    }
  };

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    console.log('📖 Initial fetch...');
    fetchPosts(1);
    fetchStories();
  }, [fetchPosts, fetchStories]);

  useEffect(() => {
    const handleStoryCreated = () => {
      fetchStories();
    };
    window.addEventListener('storyCreated', handleStoryCreated);
    return () => window.removeEventListener('storyCreated', handleStoryCreated);
  }, [fetchStories]);

  // ============================================
  // RENDER
  // ============================================
  if (loading && posts.length === 0) {
    return <Loading text="Đang tải bài viết..." />;
  }

  const validStories = stories.filter(story => story && story._id);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Nút refresh */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors disabled:opacity-50 text-gray-700 dark:text-white"
        >
          <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stories */}
      <div className="mb-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" id="stories-carousel">
          {/* Nút tạo story */}
          <div
            onClick={openStoryModal}
            className="flex-shrink-0 w-24 cursor-pointer group"
          >
            <div className="relative w-24 h-36 rounded-xl overflow-hidden bg-gray-200 dark:bg-[#3A3B3C] border-2 border-[#0866FF] hover:border-[#1877F2] transition-all">
              <img
                src={user?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                alt={user?.fullName}
                className="w-full h-[124px] object-cover opacity-80"
              />
              <div className="absolute top-[108px] left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#0866FF] border-4 border-white dark:border-[#242526] flex items-center justify-center text-white z-10 shadow-md">
                <FiPlus className="w-5 h-5" />
              </div>
              <div className="bg-white dark:bg-[#242526] h-[56px] pt-4 pb-2 px-1 text-center">
                <span className="text-[11px] font-bold text-gray-900 dark:text-white block leading-tight">
                  Tạo tin
                </span>
              </div>
            </div>
          </div>

          {/* Danh sách stories */}
          {validStories.length > 0 ? (
            validStories.map((story) => (
              <StoryCard
                key={story._id}
                story={story}
                currentUser={user}
                onDeleteStory={handleDeleteStory}
              />
            ))
          ) : (
            <div className="text-sm text-gray-400 dark:text-[#B0B3B8] py-2 px-1">
              Chưa có story nào
            </div>
          )}
        </div>
      </div>

      {/* Tạo bài viết mới */}
      <CreatePost onPostCreated={handleNewPost} />

      {/* Danh sách bài viết */}
      <div className="space-y-4 mt-4">
        {posts.length === 0 ? (
          <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-[#3E4042] transition-colors duration-300">
            <p className="text-gray-500 dark:text-[#B0B3B8]">
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
                onEdit={handleEditPost}
              />
            ))}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-3 text-[#0866FF] hover:text-[#1877F2] font-medium disabled:opacity-50"
              >
                {loading ? 'Đang tải...' : 'Xem thêm bài viết'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Modal tạo story */}
      {(localShowCreateStory || showCreateStory) && (
        <CreateStory
          onClose={() => {
            setLocalShowCreateStory(false);
            if (setShowCreateStory) setShowCreateStory(false);
          }}
          onStoryCreated={handleNewStory}
        />
      )}

      {/* POST EDITOR MODAL */}
      {showPostEditor && editingPost && (
        <PostEditor
          post={editingPost}
          onClose={handleCloseEditor}
          onSave={handlePostUpdated}
        />
      )}
    </div>
  );
};

export default NewsFeed;