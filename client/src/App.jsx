// ============================================
// FILE: client/src/App.jsx
// MÔ TẢ: Component chính, định nghĩa routing và layout
// ============================================

import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Import các trang
import Home from './pages/Home';
import Explore from './pages/Explore';
import Watch from './pages/Watch';

// Import các component
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/profile/Profile';
import Messenger from './components/messages/Messenger';
import Groups from './components/groups/Groups';
import Pages from './components/pages/Pages';
import Events from './components/events/Events';
import Notifications from './components/notifications/Notifications';
import Marketplace from './components/marketplace/Marketplace';
import AdminDashboard from './components/admin/AdminDashboard';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import hooks
import { useAuth } from './hooks/useAuth';

// ============================================
// Component bảo vệ route - Yêu cầu đăng nhập
// ============================================
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Hiển thị loading khi đang kiểm tra xác thực
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Chuyển hướng đến trang đăng nhập nếu chưa xác thực
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// ============================================
// Component bảo vệ route Admin - Yêu cầu quyền admin
// ============================================
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Hiển thị loading khi đang kiểm tra
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Chuyển hướng đến đăng nhập nếu chưa xác thực
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Chuyển hướng về trang chủ nếu không có quyền admin
  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

// ============================================
// Layout chính của ứng dụng (có Navbar và Sidebar)
// ============================================
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Thanh điều hướng */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Phần nội dung chính với sidebar */}
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-4`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// ============================================
// Component App chính
// ============================================
function App() {
  return (
    {/* ErrorBoundary bắt lỗi toàn cục */}
    <ErrorBoundary>
      {/* Provider cho theme (dark/light mode) */}
      <ThemeProvider>
        {/* Provider cho xác thực */}
        <AuthProvider>
          {/* Provider cho WebSocket */}
          <SocketProvider>
            {/* Định nghĩa các route */}
            <Routes>
              {/* ===== Các route công khai (không cần đăng nhập) ===== */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* ===== Các route cần đăng nhập ===== */}
              {/* Trang chủ */}
              <Route path="/" element={
                <PrivateRoute>
                  <AppLayout>
                    <Home />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* Trang khám phá */}
              <Route path="/explore" element={
                <PrivateRoute>
                  <AppLayout>
                    <Explore />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* Trang xem video */}
              <Route path="/watch" element={
                <PrivateRoute>
                  <AppLayout>
                    <Watch />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* Trang cá nhân */}
              <Route path="/profile/:username?" element={
                <PrivateRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* Trang tin nhắn */}
              <Route path="/messages" element={
                <PrivateRoute>
                  <AppLayout>
                    <Messenger />
                  </AppLayout>
                </PrivateRoute>
              } />
              <Route path="/messages/:userId" element={
                <PrivateRoute>
                  <AppLayout>
                    <Messenger />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* Trang nhóm */}
              <Route path="/groups" element={
                <PrivateRoute>
                  <AppLayout>
                    <Groups />
                  </AppLayout>
                </PrivateRoute>
              } />
              <Route path="/groups/:groupId" element={
                <PrivateRoute>
                  <AppLayout>
                    <Groups />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* Trang fanpage */}
              <Route path="/pages" element={
                <PrivateRoute>
                  <AppLayout>
                    <Pages />
                  </AppLayout>
                </PrivateRoute>
              } />
              <Route path="/pages/:pageId" element={
                <PrivateRoute>
                  <AppLayout>
                    <Pages />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* Trang sự kiện */}
              <Route path="/events" element={
                <PrivateRoute>
                  <AppLayout>
                    <Events />
                  </AppLayout>
                </PrivateRoute>
              } />
              <Route path="/events/:eventId" element={
                <PrivateRoute>
                  <AppLayout>
                    <Events />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* Trang thông báo */}
              <Route path="/notifications" element={
                <PrivateRoute>
                  <AppLayout>
                    <Notifications />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* Trang chợ */}
              <Route path="/marketplace" element={
                <PrivateRoute>
                  <AppLayout>
                    <Marketplace />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* ===== Các route Admin ===== */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AppLayout>
                    <AdminDashboard />
                  </AppLayout>
                </AdminRoute>
              } />
              <Route path="/admin/*" element={
                <AdminRoute>
                  <AppLayout>
                    <AdminDashboard />
                  </AppLayout>
                </AdminRoute>
              } />
              
              {/* ===== Route 404 - Chuyển hướng về trang chủ ===== */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;