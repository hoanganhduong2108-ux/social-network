// ============================================
// FILE: src/components/auth/Register.jsx
// MÔ TẢ: Trang đăng ký tài khoản mới - SỬA LOGO
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Chuyển hướng nếu đã đăng nhập
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
    // Xóa thông báo thành công khi người dùng bắt đầu nhập lại
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Tên người dùng là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Tên người dùng không được quá 30 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Tên người dùng chỉ chứa chữ cái, số và dấu gạch dưới';
    }

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa cả chữ và số';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      if (result.success) {
        setSuccessMessage('Đăng ký thành công! Đang chuyển hướng...');
        // Đợi một chút để AuthContext cập nhật
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } else {
        setErrors({
          ...errors,
          submit: result.error || 'Đăng ký thất bại',
        });
      }
    } catch (err) {
      console.error('❌ Register error:', err);
      setErrors({
        ...errors,
        submit: err.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại',
      });
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra mật khẩu mạnh
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const levels = [
      { label: 'Rất yếu', color: 'text-red-500' },
      { label: 'Yếu', color: 'text-orange-500' },
      { label: 'Trung bình', color: 'text-yellow-500' },
      { label: 'Mạnh', color: 'text-green-400' },
      { label: 'Rất mạnh', color: 'text-green-500' },
      { label: 'Cực kỳ mạnh', color: 'text-emerald-500' },
    ];
    const index = Math.min(Math.floor(score / 1.5), levels.length - 1);
    return { score, ...levels[index] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#18191A] px-4 py-12">
      <div className="max-w-md w-full">
        {/* ============================================ */}
        {/* LOGO - SỬA LẠI GIỐNG LOGIN */}
        {/* ============================================ */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0866FF] to-[#1877F2] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-2xl tracking-tight">D</span>
            </div>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-[#0866FF] to-[#1877F2] bg-clip-text text-transparent">
              DRK
            </span>
          </div>
          <p className="text-gray-600 dark:text-[#B0B3B8] text-sm font-medium mt-1">
            Tạo tài khoản mới · Kết nối bạn bè
          </p>
          <p className="text-xs text-gray-400 dark:text-[#65676B] mt-1">
            Nhập thông tin để bắt đầu
          </p>
        </div>

        {/* Form đăng ký */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-xl border border-gray-200 dark:border-[#3E4042] p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Tạo tài khoản mới
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Họ và tên */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Họ và tên
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#B0B3B8] w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#18191A] border ${
                    errors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-[#3E4042]'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B0B3B8] transition-all`}
                  placeholder="Nguyễn Văn A"
                  disabled={loading}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1.5">{errors.fullName}</p>
              )}
            </div>

            {/* Tên người dùng */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tên người dùng
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#B0B3B8] w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#18191A] border ${
                    errors.username ? 'border-red-500' : 'border-gray-200 dark:border-[#3E4042]'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B0B3B8] transition-all`}
                  placeholder="username"
                  disabled={loading}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1.5">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#B0B3B8] w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#18191A] border ${
                    errors.email ? 'border-red-500' : 'border-gray-200 dark:border-[#3E4042]'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B0B3B8] transition-all`}
                  placeholder="example@email.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Mật khẩu */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#B0B3B8] w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-[#18191A] border ${
                    errors.password ? 'border-red-500' : 'border-gray-200 dark:border-[#3E4042]'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B0B3B8] transition-all`}
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
              
              {/* Độ mạnh mật khẩu */}
              {formData.password && (
                <div className="mt-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-[#3E4042] rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          passwordStrength.score >= 4 ? 'bg-green-500' :
                          passwordStrength.score >= 3 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-sm mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#B0B3B8] w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-[#18191A] border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-[#3E4042]'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B0B3B8] transition-all`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-[#B0B3B8] dark:hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password && formData.confirmPassword === formData.password && (
                <p className="text-green-500 text-xs mt-1.5 flex items-center gap-1">
                  <FiCheckCircle className="w-3 h-3" />
                  Mật khẩu khớp
                </p>
              )}
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1.5">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Lỗi submit */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Thành công */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-start gap-2">
                <FiCheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Nút đăng ký */}
            <button
              type="submit"
              className="w-full bg-[#0866FF] hover:bg-[#1877F2] text-white font-semibold py-3.5 rounded-xl text-base transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Đang đăng ký...
                </span>
              ) : (
                'Đăng ký'
              )}
            </button>

            {/* Đã có tài khoản */}
            <p className="text-center text-sm text-gray-600 dark:text-[#B0B3B8] mt-5">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-[#0866FF] hover:text-[#1877F2] font-semibold transition-colors">
                Đăng nhập ngay
              </Link>
            </p>

            {/* Điều khoản */}
            <p className="text-center text-[10px] text-gray-400 dark:text-[#65676B] mt-4">
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <Link to="/terms" className="text-[#0866FF] hover:underline">
                Điều khoản sử dụng
              </Link>
              {' '}và{' '}
              <Link to="/privacy" className="text-[#0866FF] hover:underline">
                Chính sách bảo mật
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

export default Register;