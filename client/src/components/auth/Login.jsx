// ============================================
// FILE: src/components/auth/Login.jsx
// MÔ TẢ: Trang đăng nhập - SỬA LOGO
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ============================================
  // CHUYỂN HƯỚNG KHI ĐÃ ĐĂNG NHẬP
  // ============================================
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('✅ User already authenticated, redirecting to home...');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.emailOrUsername || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login...');
      const result = await login(formData.emailOrUsername, formData.password);
      console.log('🔐 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, redirecting...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#18191A] px-4 py-12">
      <div className="max-w-md w-full">
        {/* ============================================ */}
        {/* LOGO - SỬA LẠI */}
        {/* ============================================ */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            {/* Icon mới - sử dụng chữ D cách điệu */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0866FF] to-[#1877F2] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-2xl tracking-tight">D</span>
            </div>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-[#0866FF] to-[#1877F2] bg-clip-text text-transparent">
              DRK
            </span>
          </div>
          <p className="text-gray-600 dark:text-[#B0B3B8] text-sm font-medium mt-1">
            Kết nối cộng đồng · Chia sẻ mọi khoảnh khắc
          </p>
          <p className="text-xs text-gray-400 dark:text-[#65676B] mt-1">
            Đăng nhập để trải nghiệm
          </p>
        </div>

        {/* Form đăng nhập */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-xl border border-gray-200 dark:border-[#3E4042] p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Chào mừng trở lại
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email / Username */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email hoặc Tên người dùng
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#B0B3B8] w-5 h-5" />
                <input
                  type="text"
                  name="emailOrUsername"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#18191A] border border-gray-200 dark:border-[#3E4042] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B0B3B8] transition-all"
                  placeholder="Email hoặc tên đăng nhập"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#0866FF] hover:text-[#1877F2] font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#B0B3B8] w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-[#18191A] border border-gray-200 dark:border-[#3E4042] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B0B3B8] transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-[#B0B3B8] dark:hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Hiển thị lỗi */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Nút đăng nhập */}
            <button
              type="submit"
              className="w-full bg-[#0866FF] hover:bg-[#1877F2] text-white font-semibold py-3.5 rounded-xl text-base transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>

            {/* Đăng ký */}
            <p className="text-center text-sm text-gray-600 dark:text-[#B0B3B8] mt-5">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-[#0866FF] hover:text-[#1877F2] font-semibold transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>

       

        {/* Footer */}
        <div className="mt-6 text-center text-[10px] text-gray-400 dark:text-[#65676B]">
          <p>© 2024 DRK Social Network. All rights reserved.</p>
          <p className="mt-0.5">v1.0.0 · Made with ❤️</p>
        </div>
      </div>
    </div>
  );
};

export default Login;