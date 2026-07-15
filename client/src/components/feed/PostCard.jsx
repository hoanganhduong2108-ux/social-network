// ============================================
// FILE: src/components/feed/PostCard.jsx
// MÔ TẢ: Hiển thị một bài viết đơn lẻ - CÓ MENU GIỐNG ẢNH
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { getMediaUrl } from '../../utils/media'; 
import { timeAgo } from '../../utils/helpers';
import {
  FiHeart,
  FiMessageSquare,
  FiShare2,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiBookmark,
  FiFlag,
  FiThumbsUp,
  FiMusic,
  FiVolume2,
  FiVolumeX,
  FiPlay,
  FiPause,
  FiBell,
  FiAlertCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PostCard = ({ post, currentUser, onUpdate, onDelete, onEdit }) => {
  // ============================================
  // State
  // ============================================
  const [showActions, setShowActions] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioVolume, setAudioVolume] = useState(post?.audio?.settings?.volume || 1);
  const [isMuted, setIsMuted] = useState(post?.audio?.settings?.muted || false);
  const audioRef = React.useRef(null);

  // ============================================
  // Computed values
  // ============================================
  const isLiked = post.likes?.some((like) => like.user === currentUser?._id);
  const likeCount = post.stats?.likes || 0;
  const commentCount = post.stats?.comments || 0;
  const shareCount = post.stats?.shares || 0;

  // ============================================
  // Xử lý Like
  // ============================================
  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);

    try {
      if (isLiked) {
        await api.delete(`/posts/${post._id}/like`);
        const updatedPost = {
          ...post,
          likes: post.likes.filter((like) => like.user !== currentUser?._id),
          stats: { ...post.stats, likes: post.stats.likes - 1 },
        };
        if (onUpdate) onUpdate(updatedPost);
      } else {
        await api.post(`/posts/${post._id}/like`);
        const updatedPost = {
          ...post,
          likes: [...post.likes, { user: currentUser?._id }],
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
  // Xử lý Comment
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
      setComments((prev) => [...prev, newComment]);
      setCommentContent('');

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
  // Xử lý Xóa bài viết
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

  // ============================================
  // Xử lý Audio
  // ============================================
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setAudioVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : audioVolume;
    }
  };

  // ============================================
  // Lấy URL media đúng
  // ============================================
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm p-4 border border-gray-200 dark:border-[#3E4042] transition-colors duration-200">
      
      {/* ===== PHẦN HEADER ===== */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author?.username}`}>
            <img
              src={post.author?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
              alt={post.author?.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#0866FF]"
            />
          </Link>
          <div>
            <Link
              to={`/profile/${post.author?.username}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-[#0866FF]"
            >
              {post.author?.fullName}
            </Link>
            <p className="text-xs text-gray-500 dark:text-[#B0B3B8]">
              {timeAgo(post.createdAt)}
              {post.privacy === 'only-me' && ' · Chỉ mình tôi'}
              {post.privacy === 'friends' && ' · Bạn bè'}
            </p>
          </div>
        </div>

        {/* ===== NÚT 3 CHẤM - MENU GIỐNG ẢNH ===== */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors text-gray-500 dark:text-[#B0B3B8]"
          >
            <FiMoreHorizontal className="w-5 h-5" />
          </button>

          {showActions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#242526] rounded-xl shadow-lg border border-gray-200 dark:border-[#3E4042] py-1 z-20">
                {/* Quan tâm */}
                <button 
                  onClick={() => {
                    setShowActions(false);
                    toast.success('Đã quan tâm bài viết này');
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
                >
                  <FiHeart className="w-5 h-5 text-[#0866FF] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Quan tâm</p>
                    <p className="text-xs text-gray-500 dark:text-[#B0B3B8]">Bạn sẽ nhìn thấy nhiều bài viết tương tự hơn.</p>
                  </div>
                </button>
                
                {/* Không quan tâm */}
                <button 
                  onClick={() => {
                    setShowActions(false);
                    toast.success('Đã bỏ qua bài viết này');
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
                >
                  <FiHeart className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Không quan tâm</p>
                    <p className="text-xs text-gray-500 dark:text-[#B0B3B8]">Bạn sẽ nhìn thấy ít bài viết tương tự hơn.</p>
                  </div>
                </button>
                
                {/* Lưu bài viết */}
                <button 
                  onClick={() => {
                    setShowActions(false);
                    toast.success('Đã lưu bài viết');
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
                >
                  <FiBookmark className="w-5 h-5 text-[#0866FF] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Lưu bài viết</p>
                    <p className="text-xs text-gray-500 dark:text-[#B0B3B8]">Thêm vào danh sách mục đã lưu.</p>
                  </div>
                </button>
                
                {/* Bật thông báo */}
                <button 
                  onClick={() => {
                    setShowActions(false);
                    toast.success('Đã bật thông báo cho bài viết này');
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
                >
                  <FiBell className="w-5 h-5 text-gray-500" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Bật thông báo về bài viết này</p>
                </button>
                
                {/* Tại sao tôi nhìn thấy bài viết này? */}
                <button 
                  onClick={() => {
                    setShowActions(false);
                    toast.info('Bài viết được đề xuất dựa trên sở thích của bạn');
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
                >
                  <FiAlertCircle className="w-5 h-5 text-gray-500" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Tại sao tôi nhìn thấy bài viết này?</p>
                </button>
                
                {/* Nhúng */}
                <button 
                  onClick={() => {
                    setShowActions(false);
                    const embedCode = `<iframe src="${window.location.origin}/post/${post._id}" width="100%" height="400"></iframe>`;
                    navigator.clipboard.writeText(embedCode);
                    toast.success('Đã sao chép mã nhúng');
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
                >
                  <FiShare2 className="w-5 h-5 text-gray-500" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Nhúng</p>
                </button>
                
                {/* Chỉnh sửa - Chỉ hiện cho chủ bài viết */}
                {post.author?._id === currentUser?._id && (
                  <>
                    <div className="border-t border-gray-200 dark:border-[#3E4042] my-1"></div>
                    <button
                      onClick={() => {
                        setShowActions(false);
                        if (onEdit) onEdit(post);
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
                    >
                      <FiEdit2 className="w-5 h-5 text-[#0866FF]" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Chỉnh sửa bài viết</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowActions(false);
                        handleDelete();
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium text-red-500">Xóa bài viết</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== PHẦN NỘI DUNG ===== */}
      <div className="mt-3">
        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{post.content}</p>
        
        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className={`mt-3 grid ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 rounded-lg overflow-hidden`}>
            {post.media.map((item, index) => (
              <div key={index} className={post.media.length === 3 && index === 0 ? 'col-span-2' : ''}>
                {item.type === 'image' ? (
                  <img
                    src={getMediaUrl(item.url)}
                    alt={item.alt || 'Post image'}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <video
                    src={getMediaUrl(item.url)}
                    controls
                    className="w-full h-auto"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== AUDIO ===== */}
        {post.audio && post.audio.url && (
          <div className="mt-3 p-3 bg-gray-100 dark:bg-[#18191A] rounded-lg border border-gray-200 dark:border-[#3E4042]">
            <div className="flex items-center gap-3">
              <FiMusic className="w-5 h-5 text-[#0866FF] flex-shrink-0" />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={togglePlay}
                    className="text-gray-700 dark:text-gray-300 hover:text-[#0866FF] transition-colors"
                  >
                    {isPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
                  </button>
                  
                  <div className="flex-1 h-1 bg-gray-300 dark:bg-[#3E4042] rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-[#0866FF] transition-all duration-100"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  
                  <span className="text-xs text-gray-500 dark:text-[#B0B3B8] min-w-[40px]">
                    {post.audio.duration ? `${Math.floor(post.audio.duration)}s` : '--'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-gray-500 hover:text-gray-700 dark:text-[#B0B3B8] dark:hover:text-white transition-colors"
                  >
                    {isMuted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioVolume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-gray-300 dark:bg-[#3E4042] rounded-lg appearance-none cursor-pointer accent-[#0866FF]"
                  />
                  <span className="text-xs text-gray-500 dark:text-[#B0B3B8] min-w-[30px]">
                    {Math.round(audioVolume * 100)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-[#B0B3B8] truncate flex-1 text-right">
                    {post.audio.name || 'Nhạc nền'}
                  </span>
                </div>
              </div>
              
              <audio
                ref={audioRef}
                src={getMediaUrl(post.audio.url)}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                loop={post.audio.settings?.loop || false}
              />
            </div>
          </div>
        )}
      </div>

      {/* ===== PHẦN TƯƠNG TÁC ===== */}
      <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-[#B0B3B8]">
        <div className="flex items-center gap-2">
          <span>{likeCount > 0 && `${likeCount} lượt thích`}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{commentCount > 0 && `${commentCount} bình luận`}</span>
          <span>{shareCount > 0 && `${shareCount} lượt chia sẻ`}</span>
        </div>
      </div>

      {/* ===== PHẦN NÚT TƯƠNG TÁC ===== */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-[#3E4042]">
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-1 justify-center ${
            isLiked
              ? 'text-[#0866FF] bg-gray-100 dark:bg-[#3A3B3C]'
              : 'text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-100 dark:hover:bg-[#3A3B3C]'
          }`}
        >
          <FiThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-[#0866FF]' : ''}`} />
          <span>{isLiked ? 'Đã thích' : 'Thích'}</span>
        </button>

        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors flex-1 justify-center text-gray-500 dark:text-[#B0B3B8]"
        >
          <FiMessageSquare className="w-5 h-5" />
          <span>Bình luận</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors flex-1 justify-center text-gray-500 dark:text-[#B0B3B8]">
          <FiShare2 className="w-5 h-5" />
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* ===== PHẦN BÌNH LUẬN ===== */}
      {showComment && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#3E4042]">
          {/* Danh sách bình luận */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment._id} className="flex items-start gap-3">
                <img
                  src={comment.author?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                  alt={comment.author?.fullName}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-[#3E4042]"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-[#18191A] rounded-lg px-3 py-2">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {comment.author?.fullName}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-[#B0B3B8]">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-[#B0B3B8]">
                    <span>{timeAgo(comment.createdAt)}</span>
                    <button className="hover:text-gray-700 dark:hover:text-white">Thích</button>
                    <button className="hover:text-gray-700 dark:hover:text-white">Trả lời</button>
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
              className="bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold rounded-lg py-2 px-4 disabled:opacity-50 transition-colors"
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