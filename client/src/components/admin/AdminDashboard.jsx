// ============================================
// FILE: src/components/admin/AdminDashboard.jsx
// MÔ TẢ: Bảng điều khiển quản trị - THÊM NÚT CHUYỂN USER
// ============================================

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
  FiUserCheck,
  FiLogOut,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.stats);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Tổng quan' },
    { path: '/admin/users', icon: FiUsers, label: 'Người dùng' },
    { path: '/admin/posts', icon: FiFileText, label: 'Bài viết' },
    { path: '/admin/reports', icon: FiFlag, label: 'Báo cáo' },
    { path: '/admin/settings', icon: FiSettings, label: 'Cài đặt' },
  ];

  // ============================================
  // CHUYỂN SANG GIAO DIỆN NGƯỜI DÙNG
  // ============================================
  const handleSwitchToUser = () => {
    navigate('/user');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <Loading text="Đang tải dữ liệu..." fullScreen />;
  }

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === path || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#18191A] p-4 md:p-6">
      <Helmet>
        <title>Quản trị - DRK</title>
      </Helmet>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* ===== SIDEBAR ===== */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sticky top-20">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiShield className="text-[#0866FF]" />
                Quản trị DRK
              </h2>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>

            {/* ============================================ */}
            {/* NÚT CHUYỂN SANG GIAO DIỆN NGƯỜI DÙNG */}
            {/* ============================================ */}
            <button
              onClick={handleSwitchToUser}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <FiUserCheck className="w-4 h-4" />
              Chuyển sang giao diện người dùng
            </button>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>

            <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
              <p>DRK v1.0.0 · Admin Mode</p>
              <p className="mt-0.5">Đang đăng nhập với: {user?.fullName}</p>
            </div>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
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
    </div>
  );
};

// Component AdminOverview
const AdminOverview = ({ stats }) => {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <div key={index} className={`p-4 rounded-xl ${colorClasses[card.color]}`}>
            <p className="text-sm">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

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
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
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