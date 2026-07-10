// ============================================
// FILE: src/pages/StoryView.jsx
// MÔ TẢ: Trang xem chi tiết story - SỬA LỖI THỜI GIAN VIDEO
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Loading from '../components/common/Loading';
import StoryMenu from '../components/common/StoryMenu';
import StoryEditor from '../components/story/StoryEditor';
import { FiX, FiChevronLeft, FiChevronRight, FiVolume2, FiVolumeX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStory, setCurrentStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // ============================================
  // STATE CHỈNH SỬA STORY
  // ============================================
  const [showEditor, setShowEditor] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  
  const progressIntervalRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Lấy user hiện tại
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        setCurrentUser(response.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Lấy tất cả stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await api.get('/stories');
        const allStories = response.stories || [];
        setStories(allStories);

        const index = allStories.findIndex(s => s._id === id);
        if (index !== -1) {
          setCurrentIndex(index);
          setCurrentStory(allStories[index]);
        } else {
          navigate(-1);
          return;
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [id, navigate]);

  // ============================================
  // XỬ LÝ PROGRESS BAR - SỬA LỖI THỜI GIAN VIDEO
  // ============================================
  useEffect(() => {
    if (!currentStory || isPaused) return;

    // Reset progress
    setProgress(0);
    setVideoDuration(0);
    setIsVideoPlaying(false);
    
    // Xóa interval cũ
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Kiểm tra xem story có phải là video không
    const mediaItem = currentStory.media && currentStory.media.length > 0 ? currentStory.media[0] : null;
    const isVideo = mediaItem?.type === 'video';

    // ============================================
    // NẾU LÀ VIDEO - CHẠY THEO DURATION CỦA VIDEO
    // ============================================
    if (isVideo) {
      // Hàm bắt đầu progress cho video
      const startVideoProgress = () => {
        if (videoRef.current) {
          const duration = videoRef.current.duration;
          if (duration && duration > 0 && isFinite(duration)) {
            setVideoDuration(duration);
            const maxDuration = Math.min(duration, 60);
            
            // Tính toán step dựa trên duration thực tế
            const intervalTime = 50; // 50ms
            const totalSteps = (maxDuration * 1000) / intervalTime;
            const step = 100 / totalSteps;

            console.log(`🎬 Video duration: ${maxDuration}s, steps: ${totalSteps}, step: ${step}%`);

            // Xóa interval cũ nếu có
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }

            progressIntervalRef.current = setInterval(() => {
              setProgress((prev) => {
                const newProgress = prev + step;
                if (newProgress >= 100) {
                  clearInterval(progressIntervalRef.current);
                  // Chuyển sang story tiếp theo
                  setTimeout(() => handleNext(), 300);
                  return 100;
                }
                return newProgress;
              });
            }, intervalTime);
          } else {
            // Video chưa load xong, thử lại sau 100ms
            setTimeout(startVideoProgress, 100);
          }
        } else {
          setTimeout(startVideoProgress, 100);
        }
      };

      // Bắt đầu progress khi video đã sẵn sàng
      setTimeout(startVideoProgress, 200);
      setIsVideoPlaying(true);
    } else {
      // ============================================
      // NẾU LÀ ẢNH HOẶC TEXT - CHẠY 5 GIÂY
      // ============================================
      const duration = 5; // 5 giây cho ảnh
      const intervalTime = 50;
      const totalSteps = (duration * 1000) / intervalTime;
      const step = 100 / totalSteps;

      console.log(`🖼️ Image/Text duration: ${duration}s, steps: ${totalSteps}, step: ${step}%`);

      // Xóa interval cũ nếu có
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + step;
          if (newProgress >= 100) {
            clearInterval(progressIntervalRef.current);
            setTimeout(() => handleNext(), 200);
            return 100;
          }
          return newProgress;
        });
      }, intervalTime);
    }

    // Cleanup interval khi unmount hoặc chuyển story
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentStory, isPaused]);

  // ============================================
  // XỬ LÝ KHI VIDEO LOAD XONG
  // ============================================
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      if (duration && duration > 0 && isFinite(duration)) {
        setVideoDuration(duration);
        console.log(`🎬 Video loaded: ${duration}s`);
      }
    }
  };

  // ============================================
  // XỬ LÝ KHI VIDEO KẾT THÚC
  // ============================================
  const handleVideoEnded = () => {
    console.log('🎬 Video ended, moving to next story...');
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setTimeout(() => handleNext(), 500);
  };

  // ============================================
  // XỬ LÝ KHI AUDIO KẾT THÚC (cho story ảnh có audio)
  // ============================================
  const handleAudioEnded = () => {
    // Nếu là ảnh có audio, chờ audio kết thúc rồi mới chuyển
    const mediaItem = currentStory?.media && currentStory.media.length > 0 ? currentStory.media[0] : null;
    const isVideo = mediaItem?.type === 'video';
    
    // Chỉ xử lý khi không phải video (ảnh + audio)
    if (!isVideo && currentStory?.audio) {
      console.log('🎵 Audio ended, moving to next story...');
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setTimeout(() => handleNext(), 500);
    }
  };

  // Chuyển sang story tiếp theo
  const handleNext = () => {
    if (!stories.length) return;
    
    // Dừng interval hiện tại
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < stories.length) {
      setCurrentIndex(nextIndex);
      setCurrentStory(stories[nextIndex]);
      setProgress(0);
      setVideoDuration(0);
      setIsVideoPlaying(false);
      navigate(`/story/${stories[nextIndex]._id}`, { replace: true });
    } else {
      navigate(-1);
    }
  };

  // Quay lại story trước
  const handlePrev = () => {
    if (!stories.length) return;
    
    // Dừng interval hiện tại
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      setCurrentStory(stories[prevIndex]);
      setProgress(0);
      setVideoDuration(0);
      setIsVideoPlaying(false);
      navigate(`/story/${stories[prevIndex]._id}`, { replace: true });
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  // Xóa story
  const handleDeleteStory = async (storyId) => {
    try {
      await api.delete(`/stories/${storyId}`);
      toast.success('Đã xóa story');
      const newStories = stories.filter(s => s._id !== storyId);
      setStories(newStories);
      if (newStories.length > 0) {
        setCurrentIndex(0);
        setCurrentStory(newStories[0]);
        navigate(`/story/${newStories[0]._id}`, { replace: true });
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Không thể xóa story');
    }
  };

  // Mở chỉnh sửa story
  const handleEditStory = (story) => {
    setEditingStory(story);
    setShowEditor(true);
  };

  // Lưu story đã chỉnh sửa
  const handleStoryUpdated = (updatedStory) => {
    const newStories = stories.map(s => 
      s._id === updatedStory._id ? updatedStory : s
    );
    setStories(newStories);
    setCurrentStory(updatedStory);
    setShowEditor(false);
    setEditingStory(null);
    toast.success('Đã cập nhật story!');
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingStory(null);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // ============================================
  // TOGGLE PLAY/PAUSE CHO VIDEO
  // ============================================
  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
        setIsPaused(true);
      }
    }
  };

  // Lấy URL media đúng
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  if (loading) {
    return <Loading text="Đang tải story..." fullScreen />;
  }

  if (!currentStory) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white">Không tìm thấy story</p>
        <button onClick={handleClose} className="absolute top-4 right-4 text-white">
          <FiX className="w-8 h-8" />
        </button>
      </div>
    );
  }

  const mediaItem = currentStory.media && currentStory.media.length > 0 ? currentStory.media[0] : null;
  const isVideo = mediaItem?.type === 'video';
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < stories.length - 1;
  const hasAudio = currentStory?.audio && currentStory.audio.url;
  
  // Tính thời gian hiển thị
  let displayDuration = 5; // Mặc định 5 giây
  if (isVideo && videoDuration > 0) {
    displayDuration = Math.min(videoDuration, 60);
  } else if (isVideo) {
    displayDuration = 'Đang tải...';
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Nút đóng */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-20 transition-colors bg-black/20 p-1 rounded-full"
          aria-label="Đóng"
        >
          <FiX className="w-8 h-8" />
        </button>

        {/* Nút bật/tắt âm thanh */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className="absolute top-4 right-16 text-white hover:text-gray-300 z-20 transition-colors bg-black/20 p-2 rounded-full"
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <FiVolumeX className="w-6 h-6" /> : <FiVolume2 className="w-6 h-6" />}
        </button>

        {/* Menu 3 chấm */}
        <div className="absolute top-4 right-28 z-20">
          <StoryMenu
            story={currentStory}
            currentUser={currentUser}
            onDelete={handleDeleteStory}
            onEdit={handleEditStory}
          />
        </div>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-20">
          {stories.map((_, index) => (
            <div 
              key={index}
              className={`h-1 rounded-full flex-1 overflow-hidden ${
                index < currentIndex ? 'bg-white' : 
                index === currentIndex ? 'bg-white/60' : 'bg-gray-600'
              }`}
            >
              {index === currentIndex && (
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Thời gian hiển thị */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 text-white/40 text-xs bg-black/30 px-2 py-0.5 rounded">
          {isVideo ? `${Math.round(displayDuration)}s` : '5s'}
        </div>

        {/* Nội dung story */}
        <div 
          className="relative w-full max-w-md h-[80vh] flex items-center justify-center cursor-pointer"
          onClick={isVideo ? toggleVideoPlay : undefined}
        >
          {mediaItem ? (
            isVideo ? (
              <video
                ref={videoRef}
                src={getMediaUrl(mediaItem.url)}
                className="w-full h-full object-contain"
                autoPlay
                muted={isMuted}
                playsInline
                onLoadedMetadata={handleVideoLoadedMetadata}
                onEnded={handleVideoEnded}
                onTimeUpdate={() => {
                  // Cập nhật progress theo thời gian video
                  if (videoRef.current && videoDuration > 0) {
                    const currentTime = videoRef.current.currentTime;
                    const duration = Math.min(videoDuration, 60);
                    const newProgress = (currentTime / duration) * 100;
                    if (newProgress <= 100) {
                      setProgress(newProgress);
                    }
                  }
                }}
              />
            ) : (
              <img
                src={getMediaUrl(mediaItem.url)}
                alt="Story"
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center p-8"
              style={{ backgroundColor: currentStory.backgroundColor || '#0866FF' }}
            >
              <p className="text-white text-2xl font-bold text-center">
                {currentStory.content || 'Không có nội dung'}
              </p>
            </div>
          )}

          {/* Overlay play/pause cho video */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isVideoPlaying && (
                <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center pointer-events-none">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Thông tin người đăng */}
          <div className="absolute top-12 left-4 flex items-center gap-3">
            <img
              src={currentStory.author?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
              alt={currentStory.author?.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            <span className="text-white font-semibold drop-shadow-lg">
              {currentStory.author?.fullName || 'Người dùng'}
            </span>
            <span className="text-white/60 text-sm">
              {new Date(currentStory.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Nội dung text */}
          {currentStory.content && mediaItem && (
            <div className="absolute bottom-20 left-0 right-0 p-4 text-center">
              <p className="text-white text-lg font-medium drop-shadow-lg">
                {currentStory.content}
              </p>
            </div>
          )}

          {/* Audio */}
          {hasAudio && (
            <audio
              ref={audioRef}
              src={getMediaUrl(currentStory.audio.url)}
              autoPlay
              muted={isMuted || currentStory.audio.settings?.muted}
              loop={currentStory.audio.settings?.loop || false}
              onEnded={handleAudioEnded}
            />
          )}

          {/* Số thứ tự */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/40 text-sm">
            {currentIndex + 1} / {stories.length}
          </div>
        </div>

        {/* Nút mũi tên */}
        {hasPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-20 transition-colors p-4"
          >
            <FiChevronLeft className="w-10 h-10 drop-shadow-lg" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-20 transition-colors p-4"
          >
            <FiChevronRight className="w-10 h-10 drop-shadow-lg" />
          </button>
        )}

        {/* Click vùng trái/phải */}
        <div className="absolute inset-0 flex z-10">
          <div className="flex-1" onClick={handlePrev} />
          <div className="flex-1" onClick={handleNext} />
        </div>
      </div>

      {/* ============================================ */}
      {/* STORY EDITOR MODAL */}
      {/* ============================================ */}
      {showEditor && editingStory && (
        <StoryEditor
          story={editingStory}
          onClose={handleCloseEditor}
          onSave={handleStoryUpdated}
        />
      )}
    </>
  );
};

export default StoryView;