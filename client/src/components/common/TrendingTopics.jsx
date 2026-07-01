// ============================================
// FILE: client/src/components/common/TrendingTopics.jsx
// MÔ TẢ: Hiển thị các chủ đề đang thịnh hành
// ============================================

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FiTrendingUp } from 'react-icons/fi';

const TrendingTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get('/explore/trending');
        setTopics(response.data || []);
      } catch (error) {
        console.error('Error fetching trending topics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

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

  if (topics.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <FiTrendingUp className="text-primary-500" />
        Xu hướng
      </h3>
      <div className="space-y-3">
        {topics.slice(0, 5).map((topic, index) => (
          <div key={index}>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {topic.topic}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {topic.posts} bài viết
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;chua