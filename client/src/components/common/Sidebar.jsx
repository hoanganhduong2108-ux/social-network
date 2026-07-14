// ============================================
// FILE: src/components/common/Sidebar.jsx
// MÔ TẢ: Thanh sidebar - CHỈ CÓ BẠN BÈ
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
  FiFlag,
  FiSettings,
  FiHelpCircle,
  FiPlusCircle, // Thêm icon cho Nhóm
} from 'react-icons/fi';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();

  const menuItems = [
    { icon: FiHome, label: 'Bảng tin', path: '/' },
    { icon: FiCompass, label: 'Khám phá', path: '/explore' },
    { icon: FiVideo, label: 'Video', path: '/watch' },
    { icon: FiUsers, label: 'Bạn bè', path: '/friends' },
    { icon: FiMessageSquare, label: 'Tin nhắn', path: '/messages' },
    { icon: FiBell, label: 'Thông báo', path: '/notifications' },
    // ============================================
    // ĐỔI "Trang" THÀNH "Nhóm"
    // ============================================
    { icon: FiPlusCircle, label: 'Nhóm', path: '/groups' }, // Đã sửa
  ];

  const bottomItems = [
    { icon: FiSettings, label: 'Cài đặt', path: '/settings' },
    { icon: FiHelpCircle, label: 'Trợ giúp', path: '/help' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {}}
        />
      )}

      <aside
        className={`
          fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white dark:bg-[#18191A]
          border-r border-gray-200 dark:border-[#3E4042] z-40
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
              ${
                isActive
                  ? 'bg-gray-100 dark:bg-[#3A3B3C] text-[#0866FF]'
                  : 'hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-gray-700 dark:text-white'
              }
            `}
          >
            <img
              src={
                user?.avatar ||
                'https://ui-avatars.com/api/?background=random&bold=true'
              }
              alt={user?.fullName}
              className="w-8 h-8 rounded-full object-cover border-2 border-[#0866FF]"
            />
            {isOpen && <span className="font-medium truncate">{user?.fullName}</span>}
          </NavLink>

          {/* ===== DANH SÁCH MENU CHÍNH ===== */}
          <div className="mt-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-gray-100 dark:bg-[#3A3B3C] text-[#0866FF]'
                      : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#3A3B3C]'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>

          {/* ===== CÁC MỤC CUỐI ===== */}
          <div className="border-t border-gray-200 dark:border-[#3E4042] mt-4 pt-4 space-y-1">
            {bottomItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-gray-100 dark:bg-[#3A3B3C] text-[#0866FF]'
                      : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#3A3B3C]'
                  }
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