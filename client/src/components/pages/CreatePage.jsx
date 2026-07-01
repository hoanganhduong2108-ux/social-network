// ============================================
// FILE: client/src/pages/Home.jsx
// MÔ TẢ: Trang chủ - Hiển thị bảng tin
// ============================================

import React from 'react';
import { Helmet } from 'react-helmet-async';
import NewsFeed from '../components/feed/NewsFeed';
import FriendSuggestions from '../components/common/FriendSuggestions';
import TrendingTopics from '../components/common/TrendingTopics';

const Home = () => {
  return (
    <>
      {/* Meta tags cho SEO */}
      <Helmet>
        <title>Bảng tin - Social Network</title>
        <meta name="description" content="Kết nối và chia sẻ với bạn bè trên Social Network" />
      </Helmet>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cột chính - Bảng tin */}
        <div className="flex-1">
          <NewsFeed />
        </div>

        {/* Cột phải - Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0 space-y-4">
          {/* Đề xuất bạn bè */}
          <FriendSuggestions />
          
          {/* Xu hướng */}
          <TrendingTopics />
          
          {/* Footer */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-x-2">
            <a href="#" className="hover:underline">Quyền riêng tư</a>
            <span>·</span>
            <a href="#" className="hover:underline">Điều khoản</a>
            <span>·</span>
            <a href="#" className="hover:underline">Trợ giúp</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;