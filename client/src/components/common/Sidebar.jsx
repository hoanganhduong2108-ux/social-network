// ============================================
// FILE: client/src/components/common/Sidebar.jsx
// MÔ TẢ: Thanh sidebar bên trái của ứng dụng
// ============================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FiHome, 
  FiCompass, 
  FiUsers, 
  FiMessageSquare, 
  FiBell, 
  FiUser,
  FiVideo,
  FiCalendar,
  FiShoppingBag,
  FiFlag,
  FiSettings,
  FiHelpCircle,
} from 'react-icons/fi';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();

  // ============================================
  // Danh sách các mục trong sidebar
  // ============================================
  const menuItems = [
    { icon: FiHome, label: 'Bảng tin', path: '/' },
    { icon: FiCompass, label: 'Khám phá', path: '/explore' },
    { icon: FiVideo, label: 'Video', path: '/watch' },
    { icon: FiUsers, label: 'Nhóm', path: '/groups' },
    { icon: FiMessageSquare, label: 'Tin nhắn', path: '/messages' },
    { icon: FiBell, label: 'Thông báo', path: '/notifications' },
    { icon: FiCalendar, label: 'Sự kiện', path: '/events' },
    { icon: FiShoppingBag, label: 'Chợ', path: '/marketplace' },
    { icon: FiFlag, label: 'Trang', path: '/pages' },
  ];

  // ============================================
  // Các mục cài đặt ở cuối sidebar
  // ============================================
  const bottomItems = [
    { icon: FiSettings, label: 'Cài đặt', path: '/settings' },
    { icon: FiHelpCircle, label: 'Trợ giúp', path: '/help' },
  ];

  return (
    <>
      {/* Overlay cho mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {/* Đóng sidebar */}}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 z-40
          transition-all duration-300 overflow-y-auto
          ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
        `}
      >
        <div className="p-4">
          {/* ===== PHẦN TRÊN - Trang cá nhân ===== */}
          <NavLink
            to={`/profile/${user?.username}`}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
              ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
            `}
          >
            <img
              src={user?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
              alt={user?.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
            {isOpen && (
              <span className="font-medium truncate">{user?.fullName}</span>
            )}
          </NavLink>

          {/* ===== DANH SÁCH MENU CHÍNH ===== */}
          <div className="mt-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>

          {/* ===== CÁC MỤC CUỐI ===== */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-1">
            {bottomItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;