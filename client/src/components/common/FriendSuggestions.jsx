// ============================================
// FILE: src/components/common/FriendSuggestions.jsx
// MÔ TẢ: Đề xuất bạn bè - CHỈ HIỂN THỊ USER ĐÃ ĐĂNG KÝ
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FriendSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await api.get('/users/suggestions/friends');
        setSuggestions(response.data.suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  const handleSendFriendRequest = async (userId) => {
    try {
      await api.post(`/users/friends/request/${userId}`);
      toast.success('Đã gửi lời mời kết bạn');
      setSuggestions((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, requestSent: true } : user
        )
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Không thể gửi lời mời');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
        Gợi ý kết bạn
      </h3>
      <div className="space-y-3">
        {suggestions.slice(0, 5).map((user) => (
          <div key={user._id} className="flex items-center gap-3">
            <Link to={`/profile/${user.username}`}>
              <img
                src={user.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                to={`/profile/${user.username}`}
                className="font-medium text-sm text-gray-900 dark:text-white hover:text-[#0866FF] truncate block"
              >
                {user.fullName}
              </Link>
              {user.mutualCount > 0 && (
                <p className="text-xs text-gray-500 dark:text-[#B0B3B8]">
                  {user.mutualCount} bạn chung
                </p>
              )}
            </div>
            <button
              onClick={() => handleSendFriendRequest(user._id)}
              disabled={user.requestSent}
              className={`p-2 rounded-full transition-colors ${
                user.requestSent
                  ? 'bg-gray-100 dark:bg-[#3A3B3C] text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 dark:bg-[#0866FF]/20 hover:bg-blue-100 dark:hover:bg-[#0866FF]/30 text-[#0866FF]'
              }`}
              title={user.requestSent ? 'Đã gửi yêu cầu' : 'Kết bạn'}
            >
              <FiUserPlus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      {suggestions.length > 5 && (
        <Link
          to="/friends?tab=suggestions"
          className="block text-center text-sm text-[#0866FF] hover:text-[#1877F2] mt-3"
        >
          Xem tất cả
        </Link>
      )}
    </div>
  );
};

export default FriendSuggestions;