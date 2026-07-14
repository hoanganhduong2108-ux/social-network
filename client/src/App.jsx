// ============================================
// FILE: src/App.jsx
// MÔ TẢ: Component chính - SỬA LỖI ROUTE ADMIN/USER
// ============================================

import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Import các trang
import Home from './pages/Home';
import Explore from './pages/Explore';
import Watch from './pages/Watch';
import StoryView from './pages/StoryView';

// Import các component
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/profile/Profile';
import Messenger from './components/messages/Messenger';
import Groups from './components/groups/Groups';
import Pages from './components/pages/Pages';
import Friends from './components/friends/Friends';
import Notifications from './components/notifications/Notifications';
import AdminDashboard from './components/admin/AdminDashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';

// ============================================
// COMPONENT BẢO VỆ ROUTE - CHỈ CHO PHÉP USER ĐÃ ĐĂNG NHẬP
// ============================================
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Đang kiểm tra xác thực..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ============================================
// COMPONENT BẢO VỆ ROUTE ADMIN - CHỈ CHO PHÉP ADMIN
// ============================================
function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Đang kiểm tra quyền..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ============================================
// LAYOUT CHÍNH CHO NGƯỜI DÙNG (CÓ SIDEBAR)
// ============================================
function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-white dark:bg-[#18191A] text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          } p-4`}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

// ============================================
// LAYOUT ADMIN (KHÔNG CÓ SIDEBAR)
// ============================================
function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#18191A] text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="pt-14">
        <main className="p-4">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT CHỨA TẤT CẢ ROUTE CỦA NGƯỜI DÙNG
// ============================================
function UserRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/profile/:username?" element={<Profile />} />
        <Route path="/messages" element={<Messenger />} />
        <Route path="/messages/:userId" element={<Messenger />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:groupId" element={<Groups />} />
        <Route path="/pages" element={<Pages />} />
        <Route path="/pages/:pageId" element={<Pages />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/story/:id" element={<StoryView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

// ============================================
// COMPONENT CHỨA TẤT CẢ ROUTE CỦA ADMIN
// ============================================
function AdminRoutes() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}

// ============================================
// COMPONENT HOME REDIRECT - CHUYỂN HƯỚNG DỰA TRÊN ROLE
// ============================================
function HomeRedirect() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen text="Đang kiểm tra..." />;
  }

  // Kiểm tra nếu user là admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Nếu đang ở route /user/* (admin đang xem giao diện user)
  if (location.pathname.startsWith('/user')) {
    if (isAdmin) {
      // Admin xem giao diện user -> render UserRoutes
      return <UserRoutes />;
    } else {
      // User thường không được vào /user/* -> chuyển về /
      return <Navigate to="/" replace />;
    }
  }

  // Nếu là admin và đang ở route gốc -> chuyển đến /admin
  if (isAdmin && location.pathname === '/') {
    return <Navigate to="/admin" replace />;
  }

  // User thường -> render UserRoutes
  if (!isAdmin) {
    return <UserRoutes />;
  }

  // Fallback: nếu là admin nhưng không khớp điều kiện nào -> render UserRoutes
  return <UserRoutes />;
}

// ============================================
// COMPONENT APP CHÍNH
// ============================================
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              {/* ============================================ */}
              {/* CÁC ROUTE CÔNG KHAI (KHÔNG CẦN ĐĂNG NHẬP) */}
              {/* ============================================ */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ============================================ */}
              {/* ROUTE GỐC - CHUYỂN HƯỚNG DỰA TRÊN ROLE */}
              {/* ============================================ */}
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <HomeRedirect />
                  </PrivateRoute>
                }
              />

              {/* ============================================ */}
              {/* ROUTE DÀNH RIÊNG CHO USER (KHI ADMIN MUỐN XEM GIAO DIỆN USER) */}
              {/* ============================================ */}
              <Route
                path="/user/*"
                element={
                  <PrivateRoute>
                    <HomeRedirect />
                  </PrivateRoute>
                }
              />

              {/* ============================================ */}
              {/* ROUTE ADMIN - CHỈ ADMIN MỚI TRUY CẬP ĐƯỢC */}
              {/* ============================================ */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminRoutes />
                  </AdminRoute>
                }
              />

              {/* ============================================ */}
              {/* ROUTE 404 - KHÔNG TÌM THẤY TRANG */}
              {/* ============================================ */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;