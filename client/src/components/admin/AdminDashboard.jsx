// ============================================
// FILE: client/src/components/admin/AdminDashboard.jsx
// MÔ TẢ: Bảng điều khiển quản trị
// ============================================

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import AdminUsers from './AdminUsers';
import AdminPosts from './AdminPosts';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiFlag,
  FiSettings,
  FiBarChart2,
  FiActivity,
} from 'react-icons/fi';

const AdminDashboard = () => {
  // ============================================
  // Khởi tạo hooks và state
  // ============================================
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // Lấy thống kê
  // ============================================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ============================================
  // Menu admin
  // ============================================
  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Tổng quan' },
    { path: '/admin/users', icon: FiUsers, label: 'Người dùng' },
    { path: '/admin/posts', icon: FiFileText, label: 'Bài viết' },
    { path: '/admin/reports', icon: FiFlag, label: 'Báo cáo' },
    { path: '/admin/analytics', icon: FiBarChart2, label: 'Phân tích' },
    { path: '/admin/activity', icon: FiActivity, label: 'Hoạt động' },
    { path: '/admin/settings', icon: FiSettings, label: 'Cài đặt' },
  ];

  // ============================================
  // Render loading
  // ============================================
  if (loading) {
    return <Loading text="Đang tải dữ liệu..." fullScreen />;
  }

  // ============================================
  // Kiểm tra route hiện tại
  // ============================================
  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <Helmet>
        <title>Quản trị - Social Network</title>
      </Helmet>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar admin */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Quản trị
            </h2>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AdminOverview stats={stats} />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/posts" element={<AdminPosts />} />
            <Route path="/reports" element={<AdminReports />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

// ============================================
// Component tổng quan
// ============================================
const AdminOverview = ({ stats }) => {
  // ============================================
  // Card thống kê
  // ============================================
  const statCards = [
    { label: 'Tổng người dùng', value: stats?.totalUsers || 0, color: 'blue' },
    { label: 'Người dùng hoạt động', value: stats?.activeUsers || 0, color: 'green' },
    { label: 'Tổng bài viết', value: stats?.totalPosts || 0, color: 'purple' },
    { label: 'Báo cáo chưa xử lý', value: stats?.pendingReports || 0, color: 'red' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Tổng quan
      </h1>

      {/* Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl ${colorClasses[card.color]}`}
          >
            <p className="text-sm">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Hoạt động gần đây */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Hoạt động gần đây
        </h2>
        <div className="space-y-3">
          {stats?.recentActivities?.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div className="w-2 h-2 mt-2 rounded-full bg-primary-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
          {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Chưa có hoạt động nào
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;