// ============================================
// FILE: src/components/common/Navbar.jsx
// MÔ TẢ: Thanh điều hướng chính - DRK (Hỗ trợ Sáng/Tối)
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import {
  FiSearch,
  FiUser,        // ← Đã thêm FiUser vào import
  FiUsers,
  FiMessageSquare,
  FiBell,
  FiMenu,
  FiLogOut,
  FiMoon,
  FiSun,
  FiSettings,
  FiPlus,
  FiHelpCircle,
  FiHome,
} from 'react-icons/fi';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const createMenuRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  // Xử lý tạo tin nhanh
  const handleCreateStory = () => {
    const createStoryBtn = document.querySelector('[data-create-story]');
    if (createStoryBtn) {
      createStoryBtn.click();
    } else {
      navigate('/');
      setTimeout(() => {
        const btn = document.querySelector('[data-create-story]');
        if (btn) btn.click();
      }, 500);
    }
    setShowCreateMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(e.target)) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-[#242526] shadow-sm z-50 h-14 border-b border-gray-200 dark:border-[#3E4042] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* ===== PHẦN BÊN TRÁI ===== */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] lg:hidden transition-colors"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="w-6 h-6 text-gray-700 dark:text-white" />
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0866FF] font-black text-white text-2xl transition-transform group-hover:scale-105">
              M
            </div>
            <span className="hidden sm:inline-block font-extrabold text-[22px] text-[#0866FF] tracking-tight">
              DRK
            </span>
          </Link>

          {/* Nút Trang chủ (mobile) */}
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors lg:hidden"
            aria-label="Trang chủ"
          >
            <FiHome className="w-5 h-5 text-gray-700 dark:text-white" />
          </Link>
        </div>

        {/* ===== PHẦN GIỮA - Ô TÌM KIẾM ===== */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#B0B3B8] w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm trên DRK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#3A3B3C] text-gray-900 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all duration-200 placeholder-gray-500 dark:placeholder-[#B0B3B8]"
              />
            </div>
          </form>
        </div>

        {/* ===== PHẦN BÊN PHẢI - CÁC ICON ===== */}
        <div className="flex items-center gap-1">
          {/* Nút tạo bài viết mới / Tin nhanh */}
          <div className="relative" ref={createMenuRef}>
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
              aria-label="Tạo mới"
            >
              <FiPlus className="w-6 h-6 text-gray-700 dark:text-white" />
            </button>

            {showCreateMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#242526] rounded-xl shadow-lg border border-gray-200 dark:border-[#3E4042] py-2 z-50">
                <button
                  onClick={handleCreateStory}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-gray-700 dark:text-white transition-colors"
                >
                  <FiPlus className="w-5 h-5 text-[#0866FF]" />
                  <span>Tạo tin (Story)</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/');
                    setShowCreateMenu(false);
                    setTimeout(() => {
                      const composer = document.querySelector('[data-create-post]');
                      if (composer) composer.focus();
                    }, 300);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-gray-700 dark:text-white transition-colors"
                >
                  <FiPlus className="w-5 h-5" />
                  <span>Tạo bài viết</span>
                </button>
                <div className="border-t border-gray-200 dark:border-[#3E4042] my-1"></div>
                <button
                  onClick={() => {
                    navigate('/groups/create');
                    setShowCreateMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-gray-700 dark:text-white transition-colors"
                >
                  <FiUsers className="w-5 h-5" />
                  <span>Tạo nhóm</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/events/create');
                    setShowCreateMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-gray-700 dark:text-white transition-colors"
                >
                  <FiPlus className="w-5 h-5" />
                  <span>Tạo sự kiện</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/pages/create');
                    setShowCreateMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-gray-700 dark:text-white transition-colors"
                >
                  <FiPlus className="w-5 h-5" />
                  <span>Tạo trang</span>
                </button>
              </div>
            )}
          </div>

          {/* Nút chuyển đổi theme */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
            title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            aria-label="Chuyển đổi theme"
          >
            {isDarkMode ? (
              <FiSun className="w-6 h-6 text-yellow-500" />
            ) : (
              <FiMoon className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Nút tin nhắn */}
          <Link
            to="/messages"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors relative"
            aria-label="Tin nhắn"
          >
            <FiMessageSquare className="w-6 h-6 text-gray-700 dark:text-white" />
          </Link>

          {/* Nút thông báo */}
          <Link
            to="/notifications"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors relative"
            aria-label="Thông báo"
          >
            <FiBell className="w-6 h-6 text-gray-700 dark:text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Avatar và menu profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
              aria-label="Profile menu"
            >
              <img
                src={
                  user?.avatar ||
                  'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=User'
                }
                alt={user?.fullName || 'User'}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#0866FF]"
              />
              <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-white max-w-[80px] truncate">
                {user?.fullName?.split(' ')[0] || 'User'}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#242526] rounded-xl shadow-lg border border-gray-200 dark:border-[#3E4042] py-2 z-50">
                {/* Thông tin user */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-[#3E4042]">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        user?.avatar ||
                        'https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=User'
                      }
                      alt={user?.fullName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#0866FF]"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
                      <p className="text-sm text-gray-500 dark:text-[#B0B3B8]">@{user?.username}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <Link
                  to={`/profile/${user?.username}`}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-gray-700 dark:text-white transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FiUser className="w-5 h-5" />
                  <span>Trang cá nhân</span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-gray-700 dark:text-white transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FiSettings className="w-5 h-5" />
                  <span>Cài đặt</span>
                </Link>

                {/* Admin link */}
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-[#0866FF] transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FiSettings className="w-5 h-5" />
                    <span>Quản trị hệ thống</span>
                  </Link>
                )}

                <Link
                  to="/help"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-gray-700 dark:text-white transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FiHelpCircle className="w-5 h-5" />
                  <span>Trợ giúp</span>
                </Link>

                {/* Đăng xuất */}
                <div className="border-t border-gray-200 dark:border-[#3E4042] mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 w-full hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 dark:text-red-400 transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-200 dark:border-[#3E4042] mt-2">
                  <p className="text-xs text-gray-500 dark:text-[#B0B3B8] text-center">
                    DRK v1.0.0
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;