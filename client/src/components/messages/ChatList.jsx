// ============================================
// FILE: client/src/components/messages/ChatList.jsx
// MÔ TẢ: Danh sách cuộc trò chuyện
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

const ChatList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onlineUsers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc cuộc trò chuyện
  const filteredConversations = conversations.filter(conv =>
    conv.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Tin nhắn
        </h2>
        <div className="relative mt-2">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Danh sách */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.user._id}
              onClick={() => onSelectConversation(conv)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedConversation?.user._id === conv.user._id
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={conv.user.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                  alt={conv.user.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {onlineUsers[conv.user._id] && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {conv.user.fullName}
                </p>
                {conv.lastMessage && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {conv.lastMessage.sender._id === conv.user._id ? '' : 'Bạn: '}
                    {conv.lastMessage.content || 'Đã gửi một tin nhắn'}
                  </p>
                )}
              </div>
              {conv.unreadCount > 0 && (
                <span className="flex-shrink-0 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
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