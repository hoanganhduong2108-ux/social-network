// ============================================
// FILE: src/components/groups/EditGroupModal.jsx
// MÔ TẢ: Modal chỉnh sửa thông tin nhóm - HOÀN CHỈNH
// ============================================

import React, { useState } from 'react';
import { api } from '../../services/api';
import { FiX, FiUpload, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EditGroupModal = ({ group, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    privacy: group?.privacy || 'public',
    category: group?.category || 'general',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ============================================
  // LẤY URL ẢNH ĐÚNG
  // ============================================
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return `http://localhost:5000${url}`;
  };

  // ============================================
  // XỬ LÝ THAY ĐỔI INPUT
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // ============================================
  // XỬ LÝ CHỌN ẢNH ĐẠI DIỆN
  // ============================================
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // ============================================
  // XỬ LÝ CHỌN ẢNH BÌA
  // ============================================
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước ảnh bìa không được vượt quá 10MB');
        return;
      }
      setCoverPhoto(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // ============================================
  // VALIDATE FORM
  // ============================================
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhóm là bắt buộc';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // XỬ LÝ SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description?.trim() || '');
      formDataToSend.append('privacy', formData.privacy);
      formDataToSend.append('category', formData.category);
      
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }
      if (coverPhoto) {
        formDataToSend.append('coverPhoto', coverPhoto);
      }

      console.log('📝 Sending form data:', {
        name: formData.name,
        description: formData.description,
        privacy: formData.privacy,
        category: formData.category,
        hasAvatar: !!avatar,
        hasCover: !!coverPhoto,
      });

      const response = await api.put(`/groups/${group._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Đã cập nhật thông tin nhóm!');
      if (onSave) onSave(response.group || response);
      onClose();
    } catch (error) {
      console.error('❌ Error updating group:', error);
      console.error('❌ Error details:', error.response?.data);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể cập nhật nhóm');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#242526] rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-[#3E4042]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3E4042]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Chỉnh sửa nhóm
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Ảnh bìa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ảnh bìa
            </label>
            <div className="relative w-full h-32 bg-gray-200 dark:bg-[#3A3B3C] rounded-lg overflow-hidden">
              {(coverPreview || group?.coverPhoto) ? (
                <img
                  src={coverPreview || getImageUrl(group?.coverPhoto)}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <FiImage className="w-8 h-8 mb-1" />
                  <span className="text-sm">Tải ảnh bìa lên</span>
                </div>
              )}
              <label className="absolute bottom-2 right-2 cursor-pointer bg-black/50 hover:bg-black/70 text-white text-sm px-3 py-1 rounded-lg transition-colors">
                <FiUpload className="w-4 h-4 inline mr-1" />
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </label>
              {coverPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverPhoto(null);
                    setCoverPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Ảnh đại diện */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ảnh đại diện
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-[#3A3B3C] overflow-hidden flex-shrink-0 border-2 border-gray-300 dark:border-[#3E4042]">
                <img
                  src={avatarPreview || getImageUrl(group?.avatar) || 'https://ui-avatars.com/api/?background=random&bold=true'}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <label className="cursor-pointer btn-secondary text-sm">
                  <FiUpload className="w-4 h-4 inline mr-1" />
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatar(null);
                      setAvatarPreview(null);
                    }}
                    className="ml-2 text-sm text-red-500 hover:text-red-600"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tên nhóm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-white dark:bg-[#18191A] border ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-[#3E4042]'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0866FF]`}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white dark:bg-[#18191A] border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0866FF] resize-none"
              rows="3"
              disabled={loading}
            />
          </div>

          {/* Quyền riêng tư */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quyền riêng tư
            </label>
            <select
              name="privacy"
              value={formData.privacy}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white dark:bg-[#18191A] border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
              disabled={loading}
            >
              <option value="public">🌍 Công khai</option>
              <option value="private">🔒 Riêng tư</option>
              <option value="secret">🔐 Bí mật</option>
            </select>
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Danh mục
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white dark:bg-[#18191A] border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
              disabled={loading}
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

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[#3E4042]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;