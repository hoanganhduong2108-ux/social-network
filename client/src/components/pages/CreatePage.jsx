// ============================================
// FILE: src/components/pages/CreatePage.jsx
// MÔ TẢ: Modal tạo trang mới
// ============================================

import React, { useState } from 'react';
import { api } from '../../services/api';
import { FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreatePage = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    description: '',
    category: 'business',
    contact: {
      email: '',
      phone: '',
      website: '',
    },
  });
  const [avatar, setAvatar] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên trang');
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = '';
      if (avatar) {
        const formDataFile = new FormData();
        formDataFile.append('file', avatar);
        const response = await api.post('/upload', formDataFile);
        avatarUrl = response.data.url;
      }

      let coverUrl = '';
      if (coverPhoto) {
        const formDataFile = new FormData();
        formDataFile.append('file', coverPhoto);
        const response = await api.post('/upload', formDataFile);
        coverUrl = response.data.url;
      }

      const pageData = {
        ...formData,
        avatar: avatarUrl || undefined,
        coverPhoto: coverUrl || undefined,
      };

      const response = await api.post('/pages', pageData);

      toast.success('Đã tạo trang thành công!');
      if (onCreated) onCreated(response.data.page);
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Không thể tạo trang');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Tạo trang mới
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên trang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Nhập tên trang"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên định danh
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input-field"
              placeholder="username"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              URL: vibespace.com/pages/{formData.username || 'ten-trang'}
            </p>
          </div>

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
              <option value="business">Kinh doanh</option>
              <option value="brand">Thương hiệu</option>
              <option value="entertainment">Giải trí</option>
              <option value="media">Truyền thông</option>
              <option value="nonprofit">Phi lợi nhuận</option>
              <option value="personal">Cá nhân</option>
              <option value="public-figure">Nhân vật công chúng</option>
              <option value="community">Cộng đồng</option>
              <option value="education">Giáo dục</option>
              <option value="sports">Thể thao</option>
              <option value="music">Âm nhạc</option>
              <option value="arts">Nghệ thuật</option>
              <option value="food">Ẩm thực</option>
              <option value="travel">Du lịch</option>
              <option value="technology">Công nghệ</option>
              <option value="fashion">Thời trang</option>
              <option value="health">Sức khỏe</option>
            </select>
          </div>

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
              placeholder="Mô tả về trang..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thông tin liên hệ
            </label>
            <div className="space-y-2">
              <input
                type="email"
                name="contact.email"
                value={formData.contact.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Email"
              />
              <input
                type="text"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="Số điện thoại"
              />
              <input
                type="url"
                name="contact.website"
                value={formData.contact.website}
                onChange={handleChange}
                className="input-field"
                placeholder="Website"
              />
            </div>
          </div>

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
              {loading ? 'Đang tạo...' : 'Tạo trang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;