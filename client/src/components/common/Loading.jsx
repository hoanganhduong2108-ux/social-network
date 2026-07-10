// ============================================
// FILE: src/components/common/Loading.jsx
// MÔ TẢ: Component hiển thị trạng thái đang tải (Hỗ trợ Sáng/Tối)
// ============================================

import React from 'react';

const Loading = ({ size = 'md', text = 'Đang tải...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const Container = ({ children }) => {
    if (fullScreen) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#18191A] transition-colors duration-300">
          {children}
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
    <Container>
      <div className="flex flex-col items-center gap-3">
        <div
          className={`
            ${sizeClasses[size]}
            animate-spin rounded-full border-4 border-[#0866FF] border-t-transparent
          `}
        />
        {text && (
          <p className="text-gray-600 dark:text-[#B0B3B8] text-sm transition-colors duration-300">
            {text}
          </p>
        )}
      </div>
    </Container>
  );
};

export default Loading;