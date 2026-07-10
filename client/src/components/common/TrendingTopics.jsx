// ============================================
// FILE: src/components/common/TrendingTopics.jsx
// MÔ TẢ: Hiển thị các chủ đề đang thịnh hành
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { FiTrendingUp, FiHash } from 'react-icons/fi';

const TrendingTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // Lấy danh sách chủ đề thịnh hành
  // ============================================
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get('/explore/trending');
        setTopics(response.data.data || response.data || []);
      } catch (error) {
        console.error('Error fetching trending topics:', error);
        // Dữ liệu mẫu khi API chưa có
        setTopics([
          { topic: '#SocialNetwork', posts: 1234 },
          { topic: '#ReactJS', posts: 567 },
          { topic: '#JavaScript', posts: 890 },
          { topic: '#VibeSpace', posts: 345 },
          { topic: '#CodingLife', posts: 234 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  // ============================================
  // Render loading
  // ============================================
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================
  // Không có chủ đề
  // ============================================
  if (topics.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <FiTrendingUp className="text-blue-500" />
        Xu hướng
      </h3>
      <div className="space-y-3">
        {topics.slice(0, 5).map((topic, index) => (
          <Link
            key={index}
            to={`/explore?q=${encodeURIComponent(topic.topic)}`}
            className="block hover:bg-gray-50 dark:hover:bg-gray-700 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400 min-w-[20px]">
                #{index + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {topic.topic}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {topic.posts || topic.count || 0} bài viết
                </p>
              </div>
              <FiHash className="w-4 h-4 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      {/* Xem tất cả */}
      <Link
        to="/explore"
        className="block text-center text-sm text-blue-500 hover:text-blue-600 mt-3"
      >
        Xem tất cả xu hướng
      </Link>
    </div>
  );
};

export default TrendingTopics;