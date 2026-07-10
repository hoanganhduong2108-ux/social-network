// ============================================
// FILE: src/context/SocketContext.jsx
// MÔ TẢ: Context Socket.io - SỬA LỖI HMR
// ============================================

import React, { createContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Tạo context
export const SocketContext = createContext(null);

// Provider component
export function SocketProvider({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  // ============================================
  // Kết nối Socket
  // ============================================
  const connectSocket = useCallback(() => {
    if (!isAuthenticated || !user) {
      console.log('⏳ Waiting for authentication...');
      return null;
    }

    if (socketRef.current?.connected) {
      console.log('✅ Socket already connected');
      return socketRef.current;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found');
      return null;
    }

    console.log('🔌 Connecting to socket...');
    
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    return newSocket;
  }, [isAuthenticated, user, SOCKET_URL]);

  // ============================================
  // Ngắt kết nối Socket
  // ============================================
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting socket...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  // ============================================
  // Effect: Tự động kết nối khi auth
  // ============================================
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const timeout = setTimeout(() => {
        connectSocket();
      }, 500);
      return () => clearTimeout(timeout);
    } else if (!isAuthenticated && socketRef.current) {
      disconnectSocket();
    }
  }, [loading, isAuthenticated, user, connectSocket, disconnectSocket]);

  // ============================================
  // Cleanup khi unmount
  // ============================================
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // ============================================
  // Memoize value
  // ============================================
  const value = useMemo(() => ({
    socket,
    isConnected,
    connectionError,
    connectSocket,
    disconnectSocket,
  }), [socket, isConnected, connectionError, connectSocket, disconnectSocket]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

// Hook sử dụng SocketContext
export function useSocket() {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}