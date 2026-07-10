// ============================================
// FILE: src/context/ThemeContext.jsx
// MÔ TẢ: Context Theme - SỬA LỖI HMR
// ============================================

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';

// Tạo context
export const ThemeContext = createContext(null);

// Provider component
export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Kiểm tra localStorage và system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // ============================================
  // Toggle theme
  // ============================================
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // ============================================
  // Effect: Cập nhật class và localStorage
  // ============================================
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // ============================================
  // Memoize value
  // ============================================
  const value = useMemo(() => ({
    isDarkMode,
    toggleTheme,
  }), [isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook sử dụng ThemeContext
export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}