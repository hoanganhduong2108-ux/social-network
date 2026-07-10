// ============================================
// FILE: src/components/messages/ChatList.jsx
// MÔ TẢ: Danh sách cuộc trò chuyện - SỬA LỖI NULL CHECK + PHÂN LOẠI BẠN BÈ
// ============================================

import React, { useState } from 'react';
import { FiSearch, FiUsers, FiUserPlus } from 'react-icons/fi';

const ChatList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onlineUsers,
  friendIds = [], // Danh sách ID bạn bè để phân loại
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Tab hiện tại: 'friends' (đã kết bạn) hoặc 'others' (chưa kết bạn)
  const [activeTab, setActiveTab] = useState('friends');

  // Tự động chuyển tab khi thay đổi cuộc hội thoại được chọn
  React.useEffect(() => {
    if (selectedConversation?.user?._id) {
      const selectedId = selectedConversation.user._id.toString();
      const isFriend = friendIds.some(id => id && id.toString() === selectedId);
      if (isFriend) {
        setActiveTab('friends');
      } else {
        setActiveTab('others');
      }
    }
  }, [selectedConversation, friendIds]);

  // Lọc conversations có user hợp lệ (null check)
  const validConversations = conversations.filter(
    (conv) => conv && conv.user && conv.user._id
  );

  // Tìm kiếm trong danh sách conversations
  const searchedConversations = validConversations.filter(
    (conv) =>
      conv.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Phân loại: đoạn chat với bạn bè và đoạn chat với người chưa kết bạn
  const friendConversations = searchedConversations.filter((conv) =>
    friendIds.some(id => id && id.toString() === conv.user._id.toString())
  );
  const otherConversations = searchedConversations.filter((conv) =>
    !friendIds.some(id => id && id.toString() === conv.user._id.toString())
  );

  // Danh sách hiển thị theo tab hiện tại
  const displayedConversations = activeTab === 'friends' ? friendConversations : otherConversations;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tin nhắn</h2>
        <div className="relative mt-2">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* Tab phân loại: Bạn bè / Người khác */}
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${
              activeTab === 'friends'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FiUsers className="w-3 h-3" />
            Bạn bè
            {friendConversations.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'friends' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
              }`}>
                {friendConversations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('others')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${
              activeTab === 'others'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FiUserPlus className="w-3 h-3" />
            Người khác
            {otherConversations.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'others' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
              }`}>
                {otherConversations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Danh sách cuộc trò chuyện */}
      <div className="flex-1 overflow-y-auto">
        {displayedConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchTerm
              ? 'Không tìm thấy cuộc trò chuyện'
              : activeTab === 'friends'
              ? 'Chưa có tin nhắn với bạn bè'
              : 'Không có tin nhắn với người khác'}
          </div>
        ) : (
          displayedConversations.map((conv) => (
            <button
              key={conv.user._id}
              onClick={() => onSelectConversation(conv)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedConversation?.user._id === conv.user._id
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={
                    conv.user.avatar ||
                    `https://ui-avatars.com/api/?background=random&bold=true&name=${conv.user.fullName}`
                  }
                  alt={conv.user.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {/* Hiển thị chấm xanh nếu user đang online */}
                {(onlineUsers[conv.user._id] || conv.user.isOnline) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {conv.user.fullName}
                </p>
                {conv.lastMessage ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {/* Phân biệt tin nhắn của mình và người kia */}
                    {conv.lastMessage.sender?._id === conv.user._id ? '' : 'Bạn: '}
                    {conv.lastMessage.content || 'Đã gửi một tin nhắn'}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    Chưa có tin nhắn
                  </p>
                )}
              </div>
              {/* Hiển thị số tin nhắn chưa đọc */}
              {conv.unreadCount > 0 && (
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {conv.unreadCount}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;