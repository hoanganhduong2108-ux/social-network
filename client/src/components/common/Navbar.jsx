// ============================================
// FILE: client/src/components/common/Navbar.jsx
// MÔ TẢ: Thanh điều hướng chính của ứng dụng
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { 
  FiSearch, 
  FiHome, 
  FiUsers, 
  FiMessageSquare, 
  FiBell, 
  FiUser,
  FiMenu,
  FiLogOut,
  FiMoon,
  FiSun,
  FiSettings,
  FiPlus,
  FiHelpCircle,
} from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';

const Navbar = ({ onToggleSidebar }) => {
  // ============================================
  // Khởi tạo các hooks và state
  // ============================================
  const { user, logout } = useAuth(); // Hook xác thực
  const { isDarkMode, toggleTheme } = useTheme(); // Hook theme
  const { unreadCount } = useNotifications(); // Hook thông báo
  const navigate = useNavigate();
  
  // State quản lý
  const [searchQuery, setSearchQuery] = useState(''); // Từ khóa tìm kiếm
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Hiển thị menu profile
  const [showCreateMenu, setShowCreateMenu] = useState(false); // Hiển thị menu tạo mới
  const profileMenuRef = useRef(null); // Ref cho menu profile
  const createMenuRef = useRef(null); // Ref cho menu tạo mới

  // ============================================
  // Xử lý tìm kiếm
  // ============================================
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // ============================================
  // Xử lý đăng xuất
  // ============================================
  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  // ============================================
  // Xử lý click ra ngoài để đóng menu
  // ============================================
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
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* ===== PHẦN BÊN TRÁI ===== */}
        <div className="flex items-center gap-2">
          {/* Nút toggle sidebar (hiện trên mobile) */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <FiMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* Logo Facebook */}
          <Link to="/" className="flex items-center gap-2">
            <FaFacebook className="w-8 h-8 text-primary-500" />
            <span className="hidden sm:inline text-xl font-bold text-primary-500">
              Social
            </span>
          </Link>
        </div>

        {/* ===== PHẦN GIỮA - Ô TÌM KIẾM ===== */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bạn bè, bài viết, nhóm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
            </div>
          </form>
        </div>

        {/* ===== PHẦN BÊN PHẢI - CÁC ICON ===== */}
        <div className="flex items-center gap-1">
          {/* Nút tạo bài viết mới */}
          <div className="relative" ref={createMenuRef}>
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiPlus className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            
            {/* Menu tạo mới */}
            {showCreateMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
                  <FiPlus className="w-5 h-5" />
                  <span>Tạo bài viết</span>
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
                  <FiUsers className="w-5 h-5" />
                  <span>Tạo nhóm</span>
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
                  <FiPlus className="w-5 h-5" />
                  <span>Tạo sự kiện</span>
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
                  <FiPlus className="w-5 h-5" />
                  <span>Tạo trang</span>
                </button>
              </div>
            )}
          </div>

          {/* Nút chuyển đổi theme */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <FiSun className="w-6 h-6 text-yellow-500" />
            ) : (
              <FiMoon className="w-6 h-6 text-gray-600" />
            )}
          </button>

          {/* Nút tin nhắn */}
          <Link
            to="/messages"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
          >
            <FiMessageSquare className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </Link>

          {/* Nút thông báo */}
          <Link
            to="/notifications"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
          >
            <FiBell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Avatar và menu profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <img
                src={user?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                alt={user?.fullName || 'User'}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>

            {/* Dropdown menu profile */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                {/* Thông tin user */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                      alt={user?.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user?.fullName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user?.username}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Các menu items */}
                <Link
                  to={`/profile/${user?.username}`}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FiUser className="w-5 h-5" />
                  <span>Trang cá nhân</span>
                </Link>
                
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FiSettings className="w-5 h-5" />
                  <span>Cài đặt</span>
                </Link>

                {/* Hiển thị link admin nếu có quyền */}
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-500"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FiSettings className="w-5 h-5" />
                    <span>Quản trị hệ thống</span>
                  </Link>
                )}

                <Link
                  to="/help"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FiHelpCircle className="w-5 h-5" />
                  <span>Trợ giúp</span>
                </Link>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 w-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                  </button>
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