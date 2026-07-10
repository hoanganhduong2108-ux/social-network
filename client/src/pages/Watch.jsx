// ============================================
// FILE: src/pages/Watch.jsx
// MÔ TẢ: Trang xem video - LẤY TỪ DATABASE THỰC TẾ
// ============================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import Loading from '../components/common/Loading';
import { FiPlay, FiClock, FiEye, FiUser, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Watch = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // ============================================
  // Lấy video từ database (bài viết có video)
  // ============================================
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        
        // Lấy bài viết có video từ bảng tin
        const response = await api.get('/posts/feed', {
          params: { 
            page: 1, 
            limit: 50,
            type: 'video' // Chỉ lấy bài viết có video
          }
        });

        const posts = response.posts || [];
        
        // Lọc các bài viết có video
        const videoPosts = posts.filter(post => 
          post.media && post.media.some(m => m.type === 'video')
        );

        // Chuyển đổi dữ liệu bài viết thành video
        const videoData = videoPosts.map(post => {
          const videoMedia = post.media.find(m => m.type === 'video');
          return {
            _id: post._id,
            title: post.content ? post.content.substring(0, 60) : 'Video không có tiêu đề',
            description: post.content || '',
            url: videoMedia?.url || '',
            thumbnail: videoMedia?.thumbnail || videoMedia?.url || '',
            duration: videoMedia?.metadata?.duration || '0:00',
            views: post.stats?.views || 0,
            author: post.author || {
              fullName: 'Người dùng',
              username: 'user',
              avatar: 'https://ui-avatars.com/api/?background=random&bold=true',
              subscribers: 0,
            },
            createdAt: post.createdAt,
            likes: post.stats?.likes || 0,
            comments: post.stats?.comments || 0,
          };
        });

        setVideos(videoData);
        
        if (videoData.length > 0) {
          setSelectedVideo(videoData[0]);
        } else {
          // Không có video nào, hiển thị thông báo
          toast.info('Chưa có video nào được đăng tải');
        }
      } catch (error) {
        console.error('❌ Error fetching videos:', error);
        toast.error('Không thể tải video');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // ============================================
  // Xử lý khi chọn video
  // ============================================
  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    // Có thể tăng view ở đây
  };

  // ============================================
  // Render loading
  // ============================================
  if (loading) {
    return <Loading text="Đang tải video..." />;
  }

  // ============================================
  // Render không có video
  // ============================================
  if (videos.length === 0) {
    return (
      <>
        <Helmet>
          <title>Video - DRK</title>
          <meta name="description" content="Xem video mới nhất từ bạn bè" />
        </Helmet>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12 bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#3E4042]">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Chưa có video nào
            </h3>
            <p className="text-gray-500 dark:text-[#B0B3B8]">
              Hãy đăng bài viết có video để chia sẻ với bạn bè!
            </p>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // Lấy URL media đúng
  // ============================================
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  // ============================================
  // Format thời gian
  // ============================================
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================
  // Render chính
  // ============================================
  return (
    <>
      <Helmet>
        <title>Video - DRK</title>
        <meta name="description" content="Xem video mới nhất từ bạn bè trên DRK" />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiPlay className="text-[#0866FF]" />
          Video
          <span className="text-sm font-normal text-gray-500 dark:text-[#B0B3B8] ml-2">
            ({videos.length} video)
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============================================ */}
          {/* VIDEO CHÍNH */}
          {/* ============================================ */}
          <div className="lg:col-span-2">
            {selectedVideo && (
              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#3E4042] overflow-hidden">
                <div className="aspect-video bg-black rounded-t-xl overflow-hidden">
                  <video
                    src={getMediaUrl(selectedVideo.url)}
                    controls
                    className="w-full h-full"
                    poster={selectedVideo.thumbnail}
                    autoPlay={false}
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedVideo.title}
                  </h2>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-[#B0B3B8]">
                    <span className="flex items-center gap-1">
                      <FiEye className="w-4 h-4" />
                      {selectedVideo.views || 0} lượt xem
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {selectedVideo.duration || '0:00'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      {formatDate(selectedVideo.createdAt)}
                    </span>
                  </div>

                  <p className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-3">
                    {selectedVideo.description}
                  </p>

                  <div className="mt-3 flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-[#3E4042]">
                    <img
                      src={
                        selectedVideo.author?.avatar ||
                        'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true'
                      }
                      alt={selectedVideo.author?.fullName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#0866FF]"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedVideo.author?.fullName || 'Người dùng'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#B0B3B8]">
                        @{selectedVideo.author?.username || 'user'}
                      </p>
                    </div>
                    <button className="ml-auto btn-primary text-sm px-4 py-1.5">
                      Theo dõi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* DANH SÁCH VIDEO ĐỀ XUẤT */}
          {/* ============================================ */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiPlay className="text-[#0866FF] w-4 h-4" />
              Video đề xuất
            </h3>

            {videos.map((video) => (
              <div
                key={video._id}
                onClick={() => handleSelectVideo(video)}
                className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedVideo?._id === video._id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-[#3A3B3C] border border-transparent'
                }`}
              >
                <div className="relative flex-shrink-0 w-32 h-20 bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={getMediaUrl(video.thumbnail || video.url)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration || '0:00'}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                      <FiPlay className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[#B0B3B8] mt-1 truncate">
                    {video.author?.fullName || 'Người dùng'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-[#B0B3B8] mt-0.5">
                    <span>{video.views || 0} lượt xem</span>
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}

            {videos.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-[#B0B3B8]">
                <p>Chưa có video nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Watch;