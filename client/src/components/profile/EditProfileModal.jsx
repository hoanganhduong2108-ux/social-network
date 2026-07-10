// ============================================
// FILE: src/components/profile/EditProfileModal.jsx
// MÔ TẢ: Modal chỉnh sửa profile
// ============================================

import React, { useState } from 'react';
import { api } from '../../services/api';
import { FiX, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    location: {
      city: user?.location?.city || '',
      country: user?.location?.country || '',
    },
    gender: user?.gender || 'prefer-not-to-say',
    birthday: user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
    phone: user?.phone || '',
    socialLinks: {
      facebook: user?.socialLinks?.facebook || '',
      twitter: user?.socialLinks?.twitter || '',
      instagram: user?.socialLinks?.instagram || '',
      website: user?.socialLinks?.website || '',
    },
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'avatar') {
        setAvatarFile(file);
      } else {
        setCoverFile(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = user?.avatar;
      if (avatarFile) {
        const formDataFile = new FormData();
        formDataFile.append('file', avatarFile);
        const response = await api.post('/upload', formDataFile);
        avatarUrl = response.data.url;
      }

      let coverUrl = user?.coverPhoto;
      if (coverFile) {
        const formDataFile = new FormData();
        formDataFile.append('file', coverFile);
        const response = await api.post('/upload', formDataFile);
        coverUrl = response.data.url;
      }

      await api.put('/users/profile', {
        ...formData,
        avatar: avatarUrl,
        coverPhoto: coverUrl,
      });

      toast.success('Cập nhật thành công!');
      if (onSave) onSave();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#242526] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-[#3E4042]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3E4042]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chỉnh sửa trang cá nhân</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-[#B0B3B8] hover:text-gray-700 dark:hover:text-white">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Ảnh đại diện */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ảnh đại diện</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#0866FF]"
                />
                <label className="absolute bottom-0 right-0 bg-[#0866FF] p-1.5 rounded-full cursor-pointer hover:bg-[#1877F2] transition-colors">
                  <FiCamera className="w-3 h-3 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setAvatarFile(null)}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Xóa
              </button>
            </div>
          </div>

          {/* Ảnh bìa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ảnh bìa</label>
            <div className="relative">
              <img
                src={coverFile ? URL.createObjectURL(coverFile) : user?.coverPhoto || 'https://via.placeholder.com/1200x400/0866FF/FFFFFF?text=Cover'}
                alt="Cover"
                className="w-full h-32 object-cover rounded-lg"
              />
              <label className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-lg text-sm cursor-pointer transition-colors">
                <FiCamera className="w-4 h-4 inline mr-1" />
                Đổi ảnh bìa
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'cover')}
                />
              </label>
            </div>
          </div>

          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Tiểu sử */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiểu sử</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="input-field"
              rows="3"
              placeholder="Giới thiệu về bản thân..."
            />
          </div>

          {/* Địa chỉ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thành phố</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quốc gia</label>
              <input
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Giới tính và ngày sinh */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giới tính</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày sinh</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Mạng xã hội */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Liên kết mạng xã hội</label>
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

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[#3E4042]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;