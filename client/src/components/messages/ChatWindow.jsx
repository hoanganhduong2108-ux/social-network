// ============================================
// FILE: client/src/components/messages/ChatWindow.jsx
// MÔ TẢ: Cửa sổ chat
// ============================================

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/helpers';
import { 
  FiSend, 
  FiImage, 
  FiSmile, 
  FiPaperclip,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiInfo,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ChatWindow = ({
  conversation,
  messages,
  onSendMessage,
  typing,
  onlineUsers,
  messagesEndRef,
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await onSendMessage(message);
      setMessage('');
    } catch (error) {
      toast.error('Không thể gửi tin nhắn');
    }
  };

  // Xử lý phím Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Xử lý typing
  const handleTyping = () => {
    setIsTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  // Xử lý chọn file
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Upload file and send message
      toast.info('Tính năng đang phát triển');
    }
    e.target.value = '';
  };

  const isOnline = onlineUsers[conversation.user._id];

  return (
    <>
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <Link
          to={`/profile/${conversation.user.username}`}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <img
              src={conversation.user.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
              alt={conversation.user.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {conversation.user.fullName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <FiPhone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <FiVideo className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <FiMoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const isOwn = msg.sender._id === user._id;
          const showAvatar = !isOwn && (
            index === 0 || messages[index - 1]?.sender._id !== msg.sender._id
          );

          return (
            <div
              key={msg._id || index}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                {showAvatar && (
                  <img
                    src={msg.sender.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                    alt={msg.sender.fullName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {!isOwn && showAvatar && (
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {msg.sender.fullName}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-400'}`}>
                    {timeAgo(msg.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex items-start gap-2">
            <img
              src={conversation.user.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
              alt={conversation.user.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {/* Nút đính kèm */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Nút emoji */}
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500">
            <FiSmile className="w-5 h-5" />
          </button>

          {/* Text input */}
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {/* Nút gửi */}
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50 text-white"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;