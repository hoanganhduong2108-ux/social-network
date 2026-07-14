// ============================================
// FILE: src/context/AuthContext.jsx
// MÔ TẢ: Context xác thực - SỬA LỖI LOGIN
// ============================================

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

// Tạo context
export const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ============================================
  // KIỂM TRA TOKEN VÀ LẤY USER
  // ============================================
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Checking auth, token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('❌ No token found');
      setLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      console.log('🔍 Fetching user data...');
      const response = await api.get('/auth/me');
      console.log('🔍 User data response:', response);
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('✅ User authenticated:', response.user.username);
      } else {
        console.log('❌ User data invalid, clearing token');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      // Nếu token hết hạn hoặc không hợp lệ, xóa token
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // ĐĂNG NHẬP
  // ============================================
  const login = useCallback(async (emailOrUsername, password) => {
    try {
      setLoading(true);
      console.log('🔐 Login attempt:', emailOrUsername);
      
      const response = await api.post('/auth/login', { emailOrUsername, password });
      console.log('🔐 Login response:', response);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        toast.success(`Chào mừng ${response.user.fullName}!`);
        console.log('✅ Login successful');
        return { success: true, user: response.user };
      } else {
        console.log('❌ Login failed:', response.message);
        toast.error(response.message || 'Đăng nhập thất bại');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // ĐĂNG KÝ
  // ============================================
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      console.log('📝 Register attempt:', userData.username);
      
      const response = await api.post('/auth/register', userData);
      console.log('📝 Register response:', response);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        toast.success('Đăng ký thành công!');
        return { success: true };
      } else {
        toast.error(response.message || 'Đăng ký thất bại');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Register error:', error);
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // ĐĂNG XUẤT
  // ============================================
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Đã đăng xuất');
    }
  }, []);

  // ============================================
  // CẬP NHẬT USER
  // ============================================
  const updateUser = useCallback((updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  }, []);

  // ============================================
  // EFFECT KIỂM TRA AUTH
  // ============================================
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ============================================
  // MEMOIZE VALUE
  // ============================================
  const value = useMemo(() => ({
    user,
    setUser,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  }), [user, loading, isAuthenticated, login, register, logout, updateUser, checkAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook sử dụng AuthContext
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
