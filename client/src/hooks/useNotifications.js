// ============================================
// FILE: src/hooks/useNotifications.js
// MÔ TẢ: Hook quản lý thông báo - SỬA LỖI
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';
import { api } from '../services/api';

export const useNotifications = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ============================================
  // Lấy danh sách thông báo
  // ============================================
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.notifications || []);
      const unread = response.notifications?.filter((n) => !n.isRead).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // Lấy số thông báo chưa đọc
  // ============================================
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/unread');
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  }, []);

  // ============================================
  // Đánh dấu đã đọc
  // ============================================
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  }, []);

  // ============================================
  // Đánh dấu tất cả đã đọc
  // ============================================
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  }, []);

  // ============================================
  // Xóa thông báo
  // ============================================
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      const deleted = notifications.find((n) => n._id === notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  }, [notifications]);

  // ============================================
  // Lắng nghe thông báo realtime
  // ============================================
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleNotificationReadAck = ({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('notification_read_ack', handleNotificationReadAck);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('notification_read_ack', handleNotificationReadAck);
    };
  }, [socket]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};