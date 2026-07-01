// ============================================
// FILE: client/src/components/profile/ProfileSettings.jsx
// MÔ TẢ: Cài đặt trang cá nhân
// ============================================

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    gender: user?.gender || 'prefer-not-to-say',
    birthday: user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
    location: {
      city: user?.location?.city || '',
      country: user?.location?.country || '',
    },
    work: user?.work || [],
    education: user?.education || [],
    socialLinks: {
      facebook: user?.socialLinks?.facebook || '',
      twitter: user?.socialLinks?.twitter || '',
      instagram: user?.socialLinks?.instagram || '',
      linkedin: user?.socialLinks?.linkedin || '',
      website: user?.socialLinks?.website || '',
    },
    privacy: user?.privacy || {
      profileVisibility: 'public',
      emailVisibility: 'private',
      phoneVisibility: 'private',
      locationVisibility: 'friends',
      allowTagging: true,
      allowMessages: 'friends',
      showOnlineStatus: true,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/users/profile', formData);
      updateUser(response.data.user);
      toast.success('Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Cài đặt trang cá nhân
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tiểu sử
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="input-field"
            rows="3"
            placeholder="Giới thiệu về bản thân..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Giới tính
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input-field"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
              <option value="prefer-not-to-say">Không muốn tiết lộ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ngày sinh
            </label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Địa chỉ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thành phố
            </label>
            <input
              type="text"
              name="location.city"
              value={formData.location.city}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quốc gia
            </label>
            <input
              type="text"
              name="location.country"
              value={formData.location.country}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Mạng xã hội */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Liên kết mạng xã hội
          </label>
          <div className="space-y-2">
            <input
              type="url"
              name="socialLinks.facebook"
              value={formData.socialLinks.facebook}
              onChange={handleChange}
              className="input-field"
              placeholder="Facebook URL"
            />
            <input
              type="url"
              name="socialLinks.twitter"
              value={formData.socialLinks.twitter}
              onChange={handleChange}
              className="input-field"
              placeholder="Twitter URL"
            />
            <input
              type="url"
              name="socialLinks.instagram"
              value={formData.socialLinks.instagram}
              onChange={handleChange}
              className="input-field"
              placeholder="Instagram URL"
            />
            <input
              type="url"
              name="socialLinks.website"
              value={formData.socialLinks.website}
              onChange={handleChange}
              className="input-field"
              placeholder="Website URL"
            />
          </div>
        </div>

        {/* Quyền riêng tư */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Quyền riêng tư
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">
                Ai có thể xem trang cá nhân của bạn?
              </label>
              <select
                name="privacy.profileVisibility"
                value={formData.privacy.profileVisibility}
                onChange={handleChange}
                className="input-field mt-1"
              >
                <option value="public">Mọi người</option>
                <option value="friends">Bạn bè</option>
                <option value="private">Chỉ mình tôi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">
                Ai có thể nhắn tin cho bạn?
              </label>
              <select
                name="privacy.allowMessages"
                value={formData.privacy.allowMessages}
                onChange={handleChange}
                className="input-field mt-1"
              >
                <option value="everyone">Mọi người</option>
                <option value="friends">Bạn bè</option>
                <option value="mutual">Bạn chung</option>
                <option value="nobody">Không ai</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="privacy.allowTagging"
                checked={formData.privacy.allowTagging}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, allowTagging: e.target.checked }
                }))}
                className="w-4 h-4 text-primary-500"
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Cho phép gắn thẻ bạn trong bài viết
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="privacy.showOnlineStatus"
                checked={formData.privacy.showOnlineStatus}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, showOnlineStatus: e.target.checked }
                }))}
                className="w-4 h-4 text-primary-500"
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Hiển thị trạng thái hoạt động
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;