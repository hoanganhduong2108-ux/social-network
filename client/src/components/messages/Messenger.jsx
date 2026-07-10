// ============================================
// FILE: src/components/messages/Messenger.jsx
// MÔ TẢ: Trang tin nhắn - SỬA LỖI HIỂN THỊ CHAT
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { api } from '../../services/api';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { FiMessageSquare, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Messenger = () => {
  const { userId: routeUserId } = useParams();
  const location = useLocation();
  // Ưu tiên userId từ route path parameter, nếu không có thì lấy từ query parameter (?user=...)
  const userId = routeUserId || new URLSearchParams(location.search).get('user');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [friendList, setFriendList] = useState([]);
  const messagesEndRef = useRef(null);

  // Lấy danh sách bạn bè - chạy riêng để tránh dependency loop
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // API interceptor trả về response.data trực tiếp nên không cần .data
        const response = await api.get(`/users/${user?._id}/friends`);
        setFriendList(response.friends || []);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };
    if (user) {
      fetchFriends();
    }
  }, [user]);

  // Lấy danh sách cuộc trò chuyện
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        // API interceptor trả về response.data trực tiếp
        const response = await api.get('/messages/conversations');
        const convs = response.conversations || [];
        setConversations(convs);

        // Nếu có userId trong params, tìm cuộc trò chuyện với user đó
        if (userId) {
          const conv = convs.find(
            (c) => c.user && c.user._id?.toString() === userId.toString()
          );
          if (conv) {
            // Đã có cuộc trò chuyện, chọn nó
            setSelectedConversation(conv);
          } else {
            // Chưa có cuộc trò chuyện - cố gắng lấy thông tin user từ API
            try {
              const userRes = await api.get(`/users/${userId}`);
              const targetUser = userRes.user;
              if (targetUser) {
                // Tạo conversation tạm thời để mở cửa sổ chat
                const newConv = {
                  user: targetUser,
                  lastMessage: null,
                  unreadCount: 0,
                };
                setSelectedConversation(newConv);
                // Thêm vào danh sách conversations nếu chưa có cuộc trò chuyện với người này (tránh bị trùng 2 đoạn chat)
                setConversations(prev => {
                  const exists = prev.some(c => c.user && c.user._id?.toString() === targetUser._id?.toString());
                  if (exists) return prev;
                  return [newConv, ...prev];
                });
              }
            } catch (userErr) {
              console.error('Error fetching user:', userErr);
              toast.error('Không tìm thấy người dùng');
              navigate('/messages');
            }
          }
        } else if (convs.length > 0) {
          // Không có userId trong URL, chọn cuộc trò chuyện đầu tiên
          setSelectedConversation(convs[0]);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Không thể tải danh sách tin nhắn');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchConversations();
    }
    // Chỉ phụ thuộc vào user và userId, không phụ thuộc friendList để tránh vòng lặp vô hạn
  }, [user, userId, navigate]);

  // Lấy tin nhắn khi chọn cuộc trò chuyện
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const response = await api.get(
          `/messages/${selectedConversation.user._id}`
        );
        setMessages(response.messages || []);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Không thể tải tin nhắn');
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message) => {
      const senderId = message.sender?._id || message.sender;
      if (selectedConversation?.user?._id?.toString() === senderId?.toString()) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
      // Cập nhật conversation
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.user && c.user._id?.toString() === senderId?.toString());
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
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, sent: true } : msg
        )
      );
    });

    socket.on('message_read', ({ conversationId, userId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          (msg.sender?._id || msg.sender)?.toString() === userId?.toString() ? { ...msg, read: true } : msg
        )
      );
    });

    socket.on('user_typing', ({ userId, username, conversationId }) => {
      if (selectedConversation?.user?._id?.toString() === userId?.toString()) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    });

    socket.on('user_online', ({ userId, username }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: true }));
    });

    socket.on('user_offline', ({ userId, username }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: false }));
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

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (content, type = 'text', media = null) => {
    if (!selectedConversation) return;

    try {
      const response = await api.post('/messages', {
        receiverId: selectedConversation.user._id,
        content,
        type,
        media,
      });

      const newMessage = response.message;
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();

      setConversations((prev) => {
        const index = prev.findIndex(
          (c) => c.user && c.user._id?.toString() === selectedConversation.user._id?.toString()
        );
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
      toast.error('Không thể gửi tin nhắn');
      throw error;
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setMessages([]);
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Tin nhắn - VibeSpace</title>
      </Helmet>

      <div className="h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="flex h-full">
          {/* Chat List - truyền friendIds để phân loại bạn bè / người khác */}
          <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <ChatList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onlineUsers={onlineUsers}
              friendIds={[
                ...(user?.friends || []).map(f => (f._id || f).toString()),
                ...friendList.map(f => (f._id || f).toString())
              ]}
            />
          </div>

          {/* Chat Window */}
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
                  <button
                    onClick={() => navigate('/friends')}
                    className="mt-4 btn-primary flex items-center gap-2 mx-auto"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    Tìm bạn bè
                  </button>
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