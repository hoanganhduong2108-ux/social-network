// ============================================
// FILE: client/src/components/messages/Messenger.jsx
// MÔ TẢ: Trang tin nhắn
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { api } from '../../services/api';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { FiMessageSquare } from 'react-icons/fi';

const Messenger = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const messagesEndRef = useRef(null);

  // Lấy danh sách cuộc trò chuyện
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/messages/conversations');
        setConversations(response.data.conversations || []);
        
        // Nếu có userId từ URL, chọn cuộc trò chuyện đó
        if (userId) {
          const conv = response.data.conversations.find(
            c => c.user._id === userId
          );
          if (conv) {
            setSelectedConversation(conv);
          }
        } else if (response.data.conversations.length > 0) {
          setSelectedConversation(response.data.conversations[0]);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [userId]);

  // Lấy tin nhắn khi chọn cuộc trò chuyện
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/messages/${selectedConversation.user._id}`);
        setMessages(response.data.messages || []);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  // Xử lý tin nhắn mới từ socket
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message) => {
      if (selectedConversation?.user._id === message.sender._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      // Cập nhật danh sách cuộc trò chuyện
      setConversations(prev => {
        const index = prev.findIndex(c => c.user._id === message.sender._id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: message,
          };
          return updated;
        }
        return prev;
      });
    });

    socket.on('message_sent', ({ messageId, conversationId }) => {
      // Cập nhật trạng thái tin nhắn
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, sent: true } : msg
        )
      );
    });

    socket.on('message_read', ({ conversationId, userId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.sender._id === userId ? { ...msg, read: true } : msg
        )
      );
    });

    socket.on('user_typing', ({ userId, username, conversationId }) => {
      if (selectedConversation?.user._id === userId) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    });

    socket.on('user_online', ({ userId, username }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: true }));
    });

    socket.on('user_offline', ({ userId, username }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: false }));
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_sent');
      socket.off('message_read');
      socket.off('user_typing');
      socket.off('user_online');
      socket.off('user_offline');
    };
  }, [socket, selectedConversation]);

  // Scroll xuống cuối
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Gửi tin nhắn
  const sendMessage = async (content, type = 'text', media = null) => {
    if (!selectedConversation) return;

    try {
      const response = await api.post('/messages', {
        receiverId: selectedConversation.user._id,
        content,
        type,
        media,
      });

      const newMessage = response.data.message;
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();

      // Cập nhật danh sách cuộc trò chuyện
      setConversations(prev => {
        const index = prev.findIndex(c => c.user._id === selectedConversation.user._id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: newMessage,
          };
          return updated;
        }
        return prev;
      });

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Đánh dấu đã đọc
  const markAsRead = (messageId) => {
    // TODO: Implement mark as read
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Tin nhắn - Social Network</title>
      </Helmet>

      <div className="h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="flex h-full">
          {/* Danh sách cuộc trò chuyện */}
          <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <ChatList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              onlineUsers={onlineUsers}
            />
          </div>

          {/* Cửa sổ chat */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                onSendMessage={sendMessage}
                typing={typing}
                onlineUsers={onlineUsers}
                messagesEndRef={messagesEndRef}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <FiMessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>Chọn một cuộc trò chuyện</p>
                  <p className="text-sm">hoặc tìm kiếm người dùng để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messenger;