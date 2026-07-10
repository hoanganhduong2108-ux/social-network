// ============================================
// FILE: src/components/common/StoryCard.jsx
// MÔ TẢ: Hiển thị story - SỬA LỖI HIỂN THỊ VÀ ĐIỀU HƯỚNG
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiMoreHorizontal, 
  FiTrash2, 
  FiEdit2, 
  FiCopy, 
  FiFlag, 
  FiUserMinus,
  FiBellOff,
  FiAlertCircle,
  FiPlay
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const StoryCard = ({ story, currentUser, onDeleteStory }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // ============================================
  // KIỂM TRA DỮ LIỆU STORY HỢP LỆ
  // ============================================
  if (!story || !story._id) {
    console.warn('⚠️ Invalid story data:', story);
    return null;
  }

  const isOwner = story?.author?._id === currentUser?._id || story?.author === currentUser?._id;

  // ============================================
  // LẤY URL CHO STORY
  // ============================================
  const getStoryMedia = () => {
    // Kiểm tra media từ story
    if (story.media && story.media.length > 0) {
      const mediaItem = story.media[0];
      if (mediaItem && mediaItem.url) {
        const url = mediaItem.url;
        const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
        
        return {
          type: mediaItem.type || 'image',
          url: fullUrl,
          thumbnail: mediaItem.thumbnail || fullUrl,
          duration: mediaItem.metadata?.duration || 0,
        };
      }
    }
    
    // Fallback: avatar của người đăng
    if (story.author?.avatar) {
      const avatarUrl = story.author.avatar.startsWith('http') 
        ? story.author.avatar 
        : `http://localhost:5000${story.author.avatar}`;
      return {
        type: 'image',
        url: avatarUrl,
        thumbnail: avatarUrl,
        duration: 0,
      };
    }
    
    if (story.user?.avatar) {
      const avatarUrl = story.user.avatar.startsWith('http') 
        ? story.user.avatar 
        : `http://localhost:5000${story.user.avatar}`;
      return {
        type: 'image',
        url: avatarUrl,
        thumbnail: avatarUrl,
        duration: 0,
      };
    }
    
    // Default
    return {
      type: 'image',
      url: 'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=Story',
      thumbnail: 'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=Story',
      duration: 0,
    };
  };

  const media = getStoryMedia();
  const isVideo = media.type === 'video';

  // ============================================
  // AUTO PLAY VIDEO KHI HOVER
  // ============================================
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const video = videoRef.current;
    const container = containerRef.current;

    const handleMouseEnter = () => {
      video.play().catch(() => {});
    };

    const handleMouseLeave = () => {
      video.pause();
      video.currentTime = 0;
    };

    container?.addEventListener('mouseenter', handleMouseEnter);
    container?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container?.removeEventListener('mouseenter', handleMouseEnter);
      container?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVideo]);

  // ============================================
  // XỬ LÝ KHI VIDEO LOAD XONG
  // ============================================
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
  };

  const getUserName = () => {
    if (story.user?.fullName) return story.user.fullName;
    if (story.author?.fullName) return story.author.fullName;
    return 'Người dùng';
  };

  const getUserAvatar = () => {
    if (story.user?.avatar) {
      return story.user.avatar.startsWith('http') 
        ? story.user.avatar 
        : `http://localhost:5000${story.user.avatar}`;
    }
    if (story.author?.avatar) {
      return story.author.avatar.startsWith('http') 
        ? story.author.avatar 
        : `http://localhost:5000${story.author.avatar}`;
    }
    return 'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=User';
  };

  // ============================================
  // ĐƯỜNG DẪN ĐẾN STORY - KIỂM TRA ID
  // ============================================
  const storyLink = story?._id ? `/story/${story._id}` : '#';

  // ============================================
  // XỬ LÝ CLICK VÀO STORY
  // ============================================
  const handleStoryClick = (e) => {
    if (!story?._id) {
      e.preventDefault();
      toast.error('Không tìm thấy story');
      return;
    }
    // Link sẽ tự động điều hướng
  };

  // Xử lý xóa story
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Bạn có chắc muốn xóa story này?')) {
      onDeleteStory && onDeleteStory(story._id);
      setShowMenu(false);
    }
  };

  // Sao chép link
  const handleCopyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const link = `${window.location.origin}/story/${story._id}`;
    navigator.clipboard.writeText(link);
    toast.success('Đã sao chép liên kết');
    setShowMenu(false);
  };

  // Chỉnh sửa story
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/story/${story._id}?edit=true`);
    setShowMenu(false);
  };

  // Báo cáo
  const handleReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info('Đã báo cáo story');
    setShowMenu(false);
  };

  // Bỏ theo dõi
  const handleUnfollow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info(`Đã bỏ theo dõi ${getUserName()}`);
    setShowMenu(false);
  };

  // Tắt thông báo
  const handleTurnOffNotification = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info(`Đã tắt thông báo từ ${getUserName()}`);
    setShowMenu(false);
  };

  // Báo lỗi
  const handleReportError = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info('Đã gửi báo cáo lỗi');
    setShowMenu(false);
  };

  // Menu items cho chủ sở hữu
  const ownerMenuItems = [
    { icon: FiEdit2, label: 'Chỉnh sửa', action: handleEdit },
    { icon: FiTrash2, label: 'Xóa story', action: handleDelete, danger: true },
    { icon: FiCopy, label: 'Sao chép liên kết', action: handleCopyLink },
  ];

  // Menu items cho người xem
  const viewerMenuItems = [
    { icon: FiCopy, label: 'Sao chép liên kết', action: handleCopyLink },
    { icon: FiBellOff, label: 'Tắt thông báo', action: handleTurnOffNotification },
    { icon: FiUserMinus, label: 'Bỏ theo dõi', action: handleUnfollow },
    { icon: FiFlag, label: 'Báo cáo', action: handleReport },
    { icon: FiAlertCircle, label: 'Báo lỗi', action: handleReportError },
  ];

  const menuItems = isOwner ? ownerMenuItems : viewerMenuItems;

  return (
    <div 
      ref={containerRef}
      className="flex-shrink-0 w-24 group relative"
    >
      {/* ============================================ */}
      {/* STORY CARD - CLICK ĐỂ XEM STORY */}
      {/* ============================================ */}
      <Link 
        to={storyLink} 
        className="block"
        onClick={handleStoryClick}
      >
        <div className="relative w-24 h-36 rounded-xl overflow-hidden bg-gray-200 dark:bg-[#3A3B3C] border-2 border-[#0866FF] hover:border-[#1877F2] transition-all">
          
          {/* ============================================ */}
          {/* HIỂN THỊ NỘI DUNG STORY */}
          {/* ============================================ */}
          {isVideo ? (
            <div className="w-full h-full relative">
              <video
                ref={videoRef}
                src={media.url}
                className="w-full h-full object-cover"
                muted
                playsInline
                loop={false}
                onLoadedData={handleVideoLoaded}
                onError={() => setImageError(true)}
                poster={media.thumbnail}
              />
              
              {/* Loading overlay */}
              {!isVideoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}

              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                  <FiPlay className="w-4 h-4 text-white ml-0.5" />
                </div>
              </div>

              {/* Badge video */}
              <div className="absolute top-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded font-medium">
                VIDEO
              </div>

              {/* Duration badge */}
              {media.duration > 0 && (
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded">
                  {Math.round(media.duration)}s
                </div>
              )}
            </div>
          ) : (
            <img
              src={media.url}
              alt={getUserName()}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.src = 'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=Story';
              }}
            />
          )}

          {/* ============================================ */}
          {/* AVATAR NGƯỜI ĐĂNG */}
          {/* ============================================ */}
          <div className="absolute top-2 left-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#0866FF] overflow-hidden bg-white">
              <img 
                src={getUserAvatar()} 
                alt={getUserName()} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.target.src = 'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=User';
                }}
              />
            </div>
          </div>

          {/* ============================================ */}
          {/* TÊN NGƯỜI ĐĂNG */}
          {/* ============================================ */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-xs font-medium truncate">{getUserName()}</p>
          </div>

          {/* ============================================ */}
          {/* GRADIENT OVERLAY */}
          {/* ============================================ */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>
      </Link>

      {/* ============================================ */}
      {/* NÚT 3 CHẤM - GÓC TRÊN PHẢI */}
      {/* ============================================ */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 z-10"
        aria-label="Menu story"
      >
        <FiMoreHorizontal className="w-4 h-4" />
      </button>

      {/* ============================================ */}
      {/* MENU DROPDOWN */}
      {/* ============================================ */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
          <div className="absolute right-0 mt-1 w-56 bg-[#242526] rounded-xl shadow-lg border border-[#3E4042] py-1 z-50">
            {/* Thông tin người đăng */}
            <div className="px-3 py-2 flex items-center gap-2 border-b border-[#3E4042]">
              <img
                src={getUserAvatar()}
                alt={getUserName()}
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=User';
                }}
              />
              <span className="text-xs text-white font-medium truncate">{getUserName()}</span>
            </div>
            
            {/* Menu items */}
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-[#3A3B3C] transition-colors text-sm ${
                  item.danger ? 'text-red-500 hover:bg-red-500/10' : 'text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StoryCard;