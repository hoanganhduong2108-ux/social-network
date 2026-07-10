// ============================================
// FILE: src/hooks/useAuth.js
// MÔ TẢ: Hook sử dụng AuthContext
// ============================================

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};