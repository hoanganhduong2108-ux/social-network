// ============================================
// FILE: src/components/admin/AdminSettings.jsx
// MÔ TẢ: Cài đặt hệ thống cho admin
// ============================================

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Social Network',
    siteDescription: 'Mạng xã hội kết nối mọi người',
    maintenance: false,
    registrationEnabled: true,
    maxPostLength: 50000,
    maxImageSize: 10,
    maxVideoSize: 100,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/admin/settings');
        setSettings(response.data.settings || settings);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Không thể tải cài đặt');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileTypeChange = (e) => {
    const value = e.target.value;
    setSettings((prev) => ({
      ...prev,
      allowedFileTypes: value.split(',').map((s) => s.trim()).filter(Boolean),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/admin/settings', settings);
      toast.success('Đã lưu cài đặt hệ thống');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Đang tải cài đặt..." />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Cài đặt hệ thống
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Thông tin cơ bản
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên trang web
              </label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mô tả trang web
              </label>
              <textarea
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                className="input-field"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Cài đặt chung
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="maintenance"
                checked={settings.maintenance}
                onChange={handleChange}
                className="w-4 h-4 text-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Bảo trì hệ thống (chỉ admin mới truy cập được)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="registrationEnabled"
                checked={settings.registrationEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Cho phép đăng ký tài khoản mới
              </label>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Giới hạn nội dung
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Độ dài tối đa bài viết (ký tự)
              </label>
              <input
                type="number"
                name="maxPostLength"
                value={settings.maxPostLength}
                onChange={handleChange}
                className="input-field"
                min="100"
                max="100000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kích thước ảnh tối đa (MB)
              </label>
              <input
                type="number"
                name="maxImageSize"
                value={settings.maxImageSize}
                onChange={handleChange}
                className="input-field"
                min="1"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kích thước video tối đa (MB)
              </label>
              <input
                type="number"
                name="maxVideoSize"
                value={settings.maxVideoSize}
                onChange={handleChange}
                className="input-field"
                min="10"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Định dạng file cho phép
              </label>
              <input
                type="text"
                value={settings.allowedFileTypes.join(', ')}
                onChange={handleFileTypeChange}
                className="input-field"
                placeholder="jpg, png, mp4, ..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Các định dạng cách nhau bởi dấu phẩy
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;