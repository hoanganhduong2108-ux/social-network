// ============================================
// FILE: client/src/components/groups/CreateGroup.jsx
// MÔ TẢ: Modal tạo nhóm mới
// ============================================

import React, { useState } from 'react';
import { api } from '../../services/api';
import { FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateGroup = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public',
    category: 'general',
  });
  const [avatar, setAvatar] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên nhóm');
      return;
    }

    setLoading(true);

    try {
      // Upload avatar
      let avatarUrl = '';
      if (avatar) {
        const formDataFile = new FormData();
        formDataFile.append('file', avatar);
        const response = await api.post('/upload', formDataFile);
        avatarUrl = response.data.url;
      }

      // Upload cover photo
      let coverUrl = '';
      if (coverPhoto) {
        const formDataFile = new FormData();
        formDataFile.append('file', coverPhoto);
        const response = await api.post('/upload', formDataFile);
        coverUrl = response.data.url;
      }

      // Tạo nhóm
      const groupData = {
        ...formData,
        avatar: avatarUrl || undefined,
        coverPhoto: coverUrl || undefined,
      };

      const response = await api.post('/groups', groupData);
      
      toast.success('Đã tạo nhóm thành công!');
      if (onCreated) onCreated(response.data.group);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Không thể tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Tạo nhóm mới
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Avatar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ảnh đại diện
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {avatar ? (
                  <img
                    src={URL.createObjectURL(avatar)}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiUpload className="w-6 h-6" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer btn-secondary">
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatar(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          {/* Tên nhóm */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Nhập tên nhóm"
              required
            />
          </div>

          {/* Mô tả */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="3"
              placeholder="Mô tả về nhóm..."
            />
          </div>

          {/* Quyền riêng tư */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quyền riêng tư
            </label>
            <select
              name="privacy"
              value={formData.privacy}
              onChange={handleChange}
              className="input-field"
            >
              <option value="public">Công khai</option>
              <option value="private">Riêng tư</option>
              <option value="secret">Bí mật</option>
            </select>
          </div>

          {/* Danh mục */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Danh mục
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
            >
              <option value="general">Chung</option>
              <option value="sports">Thể thao</option>
              <option value="music">Âm nhạc</option>
              <option value="art">Nghệ thuật</option>
              <option value="technology">Công nghệ</option>
              <option value="education">Giáo dục</option>
              <option value="business">Kinh doanh</option>
              <option value="health">Sức khỏe</option>
              <option value="travel">Du lịch</option>
              <option value="food">Ẩm thực</option>
              <option value="fashion">Thời trang</option>
              <option value="gaming">Game</option>
            </select>
          </div>

          {/* Nút submit */}
          <div className="flex gap-3">
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
              {loading ? 'Đang tạo...' : 'Tạo nhóm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;