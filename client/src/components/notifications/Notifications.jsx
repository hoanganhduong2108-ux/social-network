// ============================================
// FILE: client/src/components/notifications/Notifications.jsx
// MÔ TẢ: Trang thông báo
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNotifications } from '../../hooks/useNotifications';
import { timeAgo } from '../../utils/helpers';
import { 
  FiBell, 
  FiCheck, 
  FiTrash2,
  FiHeart,
  FiMessageSquare,
  FiUserPlus,
  FiShare2,
  FiCalendar,
  FiUsers,
} from 'react-icons/fi';
import Loading from '../common/Loading';

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState('all');

  // Lọc thông báo
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    return true;
  });

  // Icon cho từng loại thông báo
  const getIcon = (type) => {
    const icons = {
      like: <FiHeart className="w-5 h-5 text-red-500" />,
      comment: <FiMessageSquare className="w-5 h-5 text-blue-500" />,
      share: <FiShare2 className="w-5 h-5 text-green-500" />,
      friend_request: <FiUserPlus className="w-5 h-5 text-primary-500" />,
      friend_accept: <FiUserPlus className="w-5 h-5 text-green-500" />,
      group_invite: <FiUsers className="w-5 h-5 text-purple-500" />,
      group_join: <FiUsers className="w-5 h-5 text-orange-500" />,
      event_invite: <FiCalendar className="w-5 h-5 text-pink-500" />,
      mention: <FiMessageSquare className="w-5 h-5 text-yellow-500" />,
    };
    return icons[type] || <FiBell className="w-5 h-5 text-gray-500" />;
  };

  if (loading) {
    return <Loading text="Đang tải thông báo..." />;
  }

  return (
    <>
      <Helmet>
        <title>Thông báo - Social Network</title>
      </Helmet>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Thông báo
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {unreadCount} thông báo chưa đọc
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn-secondary text-sm"
              >
                <FiCheck className="w-4 h-4 mr-2" />
                Đánh dấu đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Danh sách thông báo */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <FiBell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'unread'
                ? 'Không có thông báo chưa đọc'
                : 'Chưa có thông báo nào'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                  !notification.isRead ? 'border-l-4 border-primary-500' : ''
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {notification.sender ? (
                    <img
                      src={notification.sender.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                      alt={notification.sender.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {getIcon(notification.type)}
                    </div>
                  )}
                </div>

                {/* Nội dung */}
                <div className="flex-1 min-w-0">
                  {notification.sender ? (
                    <p className="text-sm text-gray-900 dark:text-white">
                      <Link
                        to={`/profile/${notification.sender.username}`}
                        className="font-medium hover:text-primary-500"
                      >
                        {notification.sender.fullName}
                      </Link>
                      {' '}
                      {notification.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-900 dark:text-white">
                      {notification.content}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-1">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-primary-500"
                      title="Đánh dấu đã đọc"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-red-500"
                    title="Xóa"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications;