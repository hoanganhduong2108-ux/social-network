// ============================================
// FILE: src/components/common/StoryMenu.jsx
// MÔ TẢ: Menu cho story - HIỂN THỊ KHI XEM STORY
// ============================================

import React, { useState } from 'react';
import { FiMoreHorizontal, FiCopy, FiBellOff, FiUserMinus, FiFlag, FiAlertCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StoryMenu = ({ story, currentUser, onDelete, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = story?.author?._id === currentUser?._id;

  if (!story) return null;

  const handleCopyLink = () => {
    const link = `${window.location.origin}/story/${story._id}`;
    navigator.clipboard.writeText(link);
    toast.success('Đã sao chép liên kết');
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xóa story này?')) {
      onDelete && onDelete(story._id);
      setShowMenu(false);
    }
  };

  const handleEdit = () => {
    onEdit && onEdit(story);
    setShowMenu(false);
  };

  // Menu cho chủ sở hữu
  const ownerMenu = [
    { icon: FiEdit2, label: 'Chỉnh sửa', action: handleEdit },
    { icon: FiTrash2, label: 'Xóa story', action: handleDelete, danger: true },
    { icon: FiCopy, label: 'Sao chép liên kết để chia sẻ tin này', action: handleCopyLink },
  ];

  // Menu cho người xem
  const viewerMenu = [
    { icon: FiCopy, label: 'Sao chép liên kết để chia sẻ tin này', action: handleCopyLink },
    { 
      icon: FiBellOff, 
      label: `Tắt tin của ${story.author?.fullName || 'người dùng'}`, 
      action: () => { toast.info('Đã tắt tin'); setShowMenu(false); } 
    },
    { 
      icon: FiUserMinus, 
      label: `Bỏ theo dõi ${story.author?.fullName || 'người dùng'}`, 
      action: () => { toast.info('Đã bỏ theo dõi'); setShowMenu(false); } 
    },
    { 
      icon: FiFlag, 
      label: 'Báo cáo tin', 
      action: () => { toast.info('Đã báo cáo tin'); setShowMenu(false); } 
    },
    { 
      icon: FiAlertCircle, 
      label: 'Đã xảy ra lỗi', 
      action: () => { toast.info('Đã gửi báo cáo lỗi'); setShowMenu(false); } 
    },
  ];

  const menuItems = isOwner ? ownerMenu : viewerMenu;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
      >
        <FiMoreHorizontal className="w-6 h-6" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-[#242526] rounded-xl shadow-lg border border-[#3E4042] py-1 z-50">
            {/* Thông báo thời gian */}
            <div className="px-3 py-2 text-xs text-[#B0B3B8] border-b border-[#3E4042]">
              <p>Tin sẽ hiển thị với đối tượng của {story.author?.fullName || 'người dùng'} trong 24 giờ.</p>
            </div>
            
            {/* Menu items */}
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-[#3A3B3C] transition-colors text-sm ${
                  item.danger ? 'text-red-500 hover:bg-red-500/10' : 'text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StoryMenu;