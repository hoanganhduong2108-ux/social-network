// ============================================
// FILE: src/hooks/useTheme.js
// MÔ TẢ: Hook sử dụng ThemeContext
// ============================================

import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};