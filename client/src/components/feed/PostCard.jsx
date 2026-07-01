// ============================================
// FILE: client/src/components/feed/PostCard.jsx
// MÔ TẢ: Hiển thị một bài viết đơn lẻ
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/helpers';
import { 
  FiHeart, 
  FiMessageSquare, 
  FiShare2, 
  FiMoreHorizontal,
  FiThumbsUp,
  FiSmile,
  FiEdit2,
  FiTrash2,
  FiBookmark,
  FiFlag,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PostCard = ({ post, onUpdate, onDelete }) => {
  // ============================================
  // Khởi tạo hooks và state
  // ============================================
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  // ============================================
  // Kiểm tra đã like chưa
  // ============================================
  const isLiked = post.likes?.some(like => like.user === user?._id);
  const likeCount = post.stats?.likes || 0;
  const commentCount = post.stats?.comments || 0;
  const shareCount = post.stats?.shares || 0;

  // ============================================
  // Xử lý like bài viết
  // ============================================
  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);

    try {
      if (isLiked) {
        await api.delete(`/posts/${post._id}/like`);
        const updatedPost = {
          ...post,
          likes: post.likes.filter(like => like.user !== user?._id),
          stats: { ...post.stats, likes: post.stats.likes - 1 },
        };
        if (onUpdate) onUpdate(updatedPost);
      } else {
        const response = await api.post(`/posts/${post._id}/like`);
        const updatedPost = {
          ...post,
          likes: [...post.likes, { user: user?._id }],
          stats: { ...post.stats, likes: post.stats.likes + 1 },
        };
        if (onUpdate) onUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Không thể thực hiện hành động');
    } finally {
      setLikeLoading(false);
    }
  };

  // ============================================
  // Xử lý bình luận
  // ============================================
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setCommentLoading(true);
    try {
      const response = await api.post(`/posts/${post._id}/comment`, {
        content: commentContent,
      });
      const newComment = response.comment;
      setComments(prev => [...prev, newComment]);
      setCommentContent('');
      
      // Cập nhật số lượng comment
      const updatedPost = {
        ...post,
        stats: { ...post.stats, comments: post.stats.comments + 1 },
      };
      if (onUpdate) onUpdate(updatedPost);
    } catch (error) {
      console.error('Error commenting:', error);
      toast.error('Không thể bình luận');
    } finally {
      setCommentLoading(false);
    }
  };

  // ============================================
  // Xử lý xóa bài viết
  // ============================================
  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

    try {
      await api.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
      toast.success('Đã xóa bài viết');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Không thể xóa bài viết');
    }
  };

  return (
    <div className="post-card">
      {/* ===== PHẦN HEADER ===== */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author?.username}`}>
            <img
              src={post.author?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
              alt={post.author?.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link
              to={`/profile/${post.author?.username}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-primary-500"
            >
              {post.author?.fullName}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo(post.createdAt)}
              {post.privacy === 'only-me' && ' · Chỉ mình tôi'}
              {post.privacy === 'friends' && ' · Bạn bè'}
            </p>
          </div>
        </div>

        {/* Nút actions */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiMoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              {/* Edit post - only for author */}
              {post.author?._id === user?._id && (
                <button
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
              )}

              {/* Save post */}
              <button
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiBookmark className="w-4 h-4" />
                <span>Lưu bài viết</span>
              </button>

              {/* Report post */}
              <button
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiFlag className="w-4 h-4" />
                <span>Báo cáo</span>
              </button>

              {/* Delete post - only for author */}
              {post.author?._id === user?._id && (
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Xóa bài viết</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== PHẦN NỘI DUNG ===== */}
      <div className="mt-3">
        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
          {post.content}
        </p>
        
        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className={`mt-3 grid ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 rounded-lg overflow-hidden`}>
            {post.media.map((item, index) => (
              <div key={index} className={post.media.length === 3 && index === 0 ? 'col-span-2' : ''}>
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.alt || 'Post image'}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="w-full h-auto"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== PHẦN TƯƠNG TÁC ===== */}
      <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>{likeCount > 0 && `${likeCount} lượt thích`}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{commentCount > 0 && `${commentCount} bình luận`}</span>
          <span>{shareCount > 0 && `${shareCount} lượt chia sẻ`}</span>
        </div>
      </div>

      {/* ===== PHẦN NÚT TƯƠNG TÁC ===== */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isLiked ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{isLiked ? 'Đã thích' : 'Thích'}</span>
        </button>

        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FiMessageSquare className="w-5 h-5" />
          <span>Bình luận</span>
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FiShare2 className="w-5 h-5" />
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* ===== PHẦN BÌNH LUẬN ===== */}
      {showComment && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Danh sách bình luận */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment._id} className="flex items-start gap-3">
                <img
                  src={comment.author?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                  alt={comment.author?.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {comment.author?.fullName}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{timeAgo(comment.createdAt)}</span>
                    <button>Thích</button>
                    <button>Trả lời</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form bình luận */}
          <form onSubmit={handleComment} className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 input-field py-2 text-sm"
              disabled={commentLoading}
            />
            <button
              type="submit"
              disabled={!commentContent.trim() || commentLoading}
              className="btn-primary py-2 px-4 disabled:opacity-50"
            >
              {commentLoading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                'Gửi'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;