// ============================================
// FILE: src/pages/Home.jsx
// MÔ TẢ: Trang chủ - Bảng tin
// ============================================

import React from 'react';
import { Helmet } from 'react-helmet-async';
import NewsFeed from '../components/feed/NewsFeed';
import FriendSuggestions from '../components/common/FriendSuggestions';
import TrendingTopics from '../components/common/TrendingTopics';

const Home = (props) => {
  return (
    <>
      <Helmet>
        <title>Bảng tin - DRK</title>
        <meta name="description" content="Kết nối và chia sẻ với bạn bè trên DRK" />
      </Helmet>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cột chính - Bảng tin */}
        <div className="flex-1">
          <NewsFeed {...props} />
        </div>

        {/* Cột phải - Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0 space-y-4">
          {/* Đề xuất bạn bè */}
          <FriendSuggestions />
          
          {/* Xu hướng */}
          <TrendingTopics />
          
          {/* Footer */}
          <div className="text-xs text-gray-500 dark:text-[#B0B3B8] space-x-2">
            <a href="#" className="hover:underline">Quyền riêng tư</a>
            <span>·</span>
            <a href="#" className="hover:underline">Điều khoản</a>
            <span>·</span>
            <a href="#" className="hover:underline">Trợ giúp</a>
            <span>·</span>
            <span>DRK v1.0.0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;