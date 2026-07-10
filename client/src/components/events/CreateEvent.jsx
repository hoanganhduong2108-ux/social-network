// ============================================
// FILE: src/components/events/CreateEvent.jsx
// MÔ TẢ: Modal tạo sự kiện mới
// ============================================

import React, { useState } from 'react';
import { api } from '../../services/api';
import { FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateEvent = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'in-person',
    location: { name: '', address: '' },
    category: 'meetup',
    privacy: 'public',
    capacity: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề sự kiện');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error('Vui lòng chọn thời gian');
      return;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';
      if (image) {
        const formDataFile = new FormData();
        formDataFile.append('file', image);
        const response = await api.post('/upload', formDataFile);
        imageUrl = response.data.url;
      }

      const response = await api.post('/events', {
        ...formData,
        image: imageUrl || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      });

      toast.success('Đã tạo sự kiện thành công!');
      if (onCreated) onCreated(response.data.event);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Không thể tạo sự kiện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Tạo sự kiện mới
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ảnh sự kiện
            </label>
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Event preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <FiUpload className="w-10 h-10 mb-2" />
                  <span className="text-sm">Tải ảnh lên</span>
                </div>
              )}
              <label className="absolute bottom-2 right-2 cursor-pointer btn-secondary text-sm">
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bắt đầu *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kết thúc *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Địa điểm *
            </label>
            <input
              type="text"
              name="location.name"
              value={formData.location.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Tên địa điểm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Địa chỉ chi tiết
            </label>
            <input
              type="text"
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              className="input-field"
              placeholder="Số nhà, đường, phường..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Loại sự kiện
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
            >
              <option value="in-person">Trực tiếp</option>
              <option value="online">Trực tuyến</option>
              <option value="hybrid">Kết hợp</option>
            </select>
          </div>

          {formData.type !== 'in-person' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link tham gia
              </label>
              <input
                type="url"
                name="location.link"
                value={formData.location.link}
                onChange={handleChange}
                className="input-field"
                placeholder="https://..."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Danh mục
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="conference">Hội thảo</option>
                <option value="workshop">Workshop</option>
                <option value="meetup">Gặp mặt</option>
                <option value="party">Tiệc tùng</option>
                <option value="sports">Thể thao</option>
                <option value="charity">Từ thiện</option>
                <option value="business">Kinh doanh</option>
                <option value="education">Giáo dục</option>
                <option value="entertainment">Giải trí</option>
              </select>
            </div>
            <div>
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
                <option value="friends">Bạn bè</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sức chứa
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="input-field"
              placeholder="Không giới hạn"
              min="1"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
              {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;