import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Watch from './pages/Watch';

// Components
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

// Hooks
import { useAuth } from './hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <PrivateRoute>
                  <AppLayout>
                    <Home />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              <Route path="/explore" element={
                <PrivateRoute>
                  <AppLayout>
                    <Explore />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              <Route path="/watch" element={
                <PrivateRoute>
                  <AppLayout>
                    <Watch />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              <Route path="/profile/:username?" element={
                <PrivateRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </PrivateRoute>
              } />
              
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
              
              <Route path="/notifications" element={
                <PrivateRoute>
                  <AppLayout>
                    <Notifications />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              <Route path="/marketplace" element={
                <PrivateRoute>
                  <AppLayout>
                    <Marketplace />
                  </AppLayout>
                </PrivateRoute>
              } />
              
              {/* Admin Routes */}
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
              
              {/* 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;