// ============================================
// FILE: client/src/components/common/Loading.jsx
// MÔ TẢ: Component hiển thị trạng thái đang tải
// ============================================

import React from 'react';

const Loading = ({ size = 'md', text = 'Đang tải...', fullScreen = false }) => {
  // ============================================
  // Định nghĩa kích thước spinner
  // ============================================
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  // ============================================
  // Container cho fullscreen
  // ============================================
  const Container = ({ children }) => {
    if (fullScreen) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
    <Container>
      <div className="flex flex-col items-center gap-3">
        {/* Spinner */}
        <div 
          className={`
            ${sizeClasses[size]} 
            animate-spin rounded-full border-4 border-primary-500 border-t-transparent
          `}
        />
        {/* Văn bản */}
        {text && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {text}
          </p>
        )}
      </div>
    </Container>
  );
};

export default Loading;