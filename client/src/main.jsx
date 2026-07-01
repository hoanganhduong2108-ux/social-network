// ============================================
// FILE: client/src/main.jsx
// MÔ TẢ: Điểm khởi đầu của ứng dụng React
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/index.css';

// ============================================
// Cấu hình React Query - Quản lý state và caching
// ============================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không tự động fetch khi chuyển tab
      retry: 1, // Chỉ thử lại 1 lần khi lỗi
      staleTime: 5 * 60 * 1000, // Dữ liệu được coi là cũ sau 5 phút
    },
  },
});

// ============================================
// Render ứng dụng chính
// ============================================
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Provider cho SEO và Meta tags */}
    <HelmetProvider>
      {/* Provider cho React Query */}
      <QueryClientProvider client={queryClient}>
        {/* Provider cho React Router */}
        <BrowserRouter>
          {/* Component chính của ứng dụng */}
          <App />
          {/* Component hiển thị thông báo toast */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000, // Thời gian hiển thị 4 giây
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);