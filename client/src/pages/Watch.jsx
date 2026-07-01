// ============================================
// FILE: client/src/pages/Watch.jsx
// MÔ TẢ: Trang xem video
// ============================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import Loading from '../components/common/Loading';
import { FiPlay, FiClock, FiEye } from 'react-icons/fi';

const Watch = () => {
  // ============================================
  // Khởi tạo hooks và state
  // ============================================
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // ============================================
  // Lấy danh sách video
  // ============================================
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get('/watch/videos');
        setVideos(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedVideo(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // ============================================
  // Render
  // ============================================
  if (loading) {
    return <Loading text="Đang tải video..." />;
  }

  return (
    <>
      <Helmet>
        <title>Video - Social Network</title>
        <meta name="description" content="Xem video mới nhất từ bạn bè" />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video chính */}
          <div className="lg:col-span-2">
            {selectedVideo && (
              <div className="card">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    src={selectedVideo.url}
                    controls
                    className="w-full h-full"
                    poster={selectedVideo.thumbnail}
                  />
                </div>
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedVideo.title}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiEye className="w-4 h-4" />
                      {selectedVideo.views || 0} lượt xem
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {selectedVideo.duration || '0:00'}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {selectedVideo.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={selectedVideo.author?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                      alt={selectedVideo.author?.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedVideo.author?.fullName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedVideo.author?.subscribers || 0} người đăng ký
                      </p>
                    </div>
                    <button className="ml-auto btn-primary">
                      Theo dõi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Danh sách video */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Video đề xuất
            </h3>
            {videos.map((video) => (
              <div
                key={video._id}
                onClick={() => setSelectedVideo(video)}
                className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  selectedVideo?._id === video._id
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="relative flex-shrink-0 w-32 h-20 bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={video.thumbnail || video.url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                    {video.duration || '0:00'}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                      <FiPlay className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {video.author?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {video.views || 0} lượt xem
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Watch;