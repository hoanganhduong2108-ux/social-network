// ============================================
// FILE: client/src/components/auth/Login.jsx
// MÔ TẢ: Trang đăng nhập
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaFacebook } from 'react-icons/fa';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  // ============================================
  // Khởi tạo hooks và state
  // ============================================
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ============================================
  // Xử lý thay đổi input
  // ============================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (error) setError('');
  };

  // ============================================
  // Xử lý submit form
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dữ liệu
    if (!formData.emailOrUsername || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(formData.emailOrUsername, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaFacebook className="w-10 h-10 text-primary-500" />
            <span className="text-3xl font-bold text-primary-500">Social</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Đăng nhập để kết nối với bạn bè
          </p>
        </div>

        {/* Form đăng nhập */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            {/* Email / Username */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email hoặc Tên người dùng
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="emailOrUsername"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="example@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Hiển thị lỗi */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Quên mật khẩu */}
            <div className="text-right mb-4">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              className="w-full btn-primary py-3 text-lg"
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
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Demo: demo@example.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;