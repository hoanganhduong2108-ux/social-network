// ============================================
// FILE: src/pages/Explore.jsx
// MÔ TẢ: Trang khám phá
// ============================================

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import Loading from '../components/common/Loading';
import PostCard from '../components/feed/PostCard';
import { FiSearch, FiTrendingUp, FiHash } from 'react-icons/fi';

const Explore = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await api.get('/explore/search', {
        params: { q: searchQuery, type: activeTab },
      });
      setResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await api.get('/explore/trending');
        setTrending(response.data || []);
      } catch (error) {
        console.error('Error fetching trending:', error);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(new Event('submit'));
    }
  }, [initialQuery]);

  return (
    <>
      <Helmet>
        <title>Khám phá - VibeSpace</title>
        <meta name="description" content="Khám phá nội dung mới trên VibeSpace" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Thanh tìm kiếm */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết, người dùng, nhóm..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'posts', 'people', 'groups', 'pages'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tab === 'all' && 'Tất cả'}
              {tab === 'posts' && 'Bài viết'}
              {tab === 'people' && 'Người dùng'}
              {tab === 'groups' && 'Nhóm'}
              {tab === 'pages' && 'Trang'}
            </button>
          ))}
        </div>

        {/* Kết quả tìm kiếm */}
        {loading ? (
          <Loading text="Đang tìm kiếm..." />
        ) : (
          <>
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((item) => (
                  <PostCard key={item._id} post={item} />
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Không tìm thấy kết quả cho "{searchQuery}"
                </p>
              </div>
            ) : (
              /* Xu hướng */
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-blue-500" />
                  Xu hướng hôm nay
                </h2>
                <div className="space-y-3">
                  {trending.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <span className="text-2xl font-bold text-gray-300 dark:text-gray-600">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.topic}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.posts} bài viết
                        </p>
                      </div>
                      <FiHash className="text-gray-400 w-5 h-5" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Explore;