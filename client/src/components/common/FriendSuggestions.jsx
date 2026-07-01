// ============================================
// FILE: client/src/components/common/FriendSuggestions.jsx
// MÔ TẢ: Đề xuất bạn bè
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { FiUserPlus } from 'react-icons/fi';

const FriendSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await api.get('/users/suggestions/friends');
        setSuggestions(response.data || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

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
                className="font-medium text-sm text-gray-900 dark:text-white hover:text-primary-500 truncate block"
              >
                {user.fullName}
              </Link>
              {user.mutualCount > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.mutualCount} bạn chung
                </p>
              )}
            </div>
            <button className="p-2 rounded-full bg-primary-50 hover:bg-primary-100 text-primary-500 transition-colors">
              <FiUserPlus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <Link
        to="/explore?tab=people"
        className="block text-center text-sm text-primary-500 hover:text-primary-600 mt-3"
      >
        Xem tất cả
      </Link>
    </div>
  );
};

export default FriendSuggestions;