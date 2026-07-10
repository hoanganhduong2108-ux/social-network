// ============================================
// FILE: src/pages/FindFriendsPage.jsx
// MÔ TẢ: Trang tìm bạn bè mới
// ============================================

import React from 'react';
import { Helmet } from 'react-helmet-async';
import FindFriends from '../components/friends/FindFriends';

const FindFriendsPage = () => {
  return (
    <>
      <Helmet>
        <title>Tìm bạn bè mới - DRK</title>
        <meta name="description" content="Kết nối với những người bạn mới trên DRK" />
      </Helmet>
      <FindFriends />
    </>
  );
};

export default FindFriendsPage;