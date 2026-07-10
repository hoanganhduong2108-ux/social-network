// ============================================
// FILE: src/App.jsx
// MÔ TẢ: Component chính - SỬA LỖI ROUTE
// ============================================

import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
// COMPONENT BẢO VỆ ROUTE
// ============================================
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  console.log('🔒 PrivateRoute check:', { isAuthenticated, loading });

  if (loading) {
    return <Loading fullScreen text="Đang kiểm tra xác thực..." />;
  }

  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  console.log('🔒 Authenticated, rendering children...');
  return children;
}

// ============================================
// COMPONENT BẢO VỆ ROUTE ADMIN
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
// LAYOUT CHÍNH
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
// COMPONENT APP CHÍNH
// ============================================
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              {/* ===== Các route công khai ===== */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ===== Các route cần đăng nhập ===== */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Home />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/explore"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Explore />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/watch"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Watch />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile/:username?"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Messenger />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/messages/:userId"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Messenger />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/groups"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Groups />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/groups/:groupId"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Groups />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/pages"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Pages />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/pages/:pageId"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Pages />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/friends"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Friends />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Notifications />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/story/:id"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <StoryView />
                    </AppLayout>
                  </PrivateRoute>
                }
              />

              {/* ===== Các route Admin ===== */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AppLayout>
                      <AdminDashboard />
                    </AppLayout>
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AppLayout>
                      <AdminDashboard />
                    </AppLayout>
                  </AdminRoute>
                }
              />

              {/* ===== Route 404 ===== */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;