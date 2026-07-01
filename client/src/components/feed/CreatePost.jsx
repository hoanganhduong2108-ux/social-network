// ============================================
// FILE: client/src/components/feed/CreatePost.jsx
// MÔ TẢ: Component tạo bài viết mới
// ============================================

import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { 
  FiImage, 
  FiVideo, 
  FiSmile, 
  FiMapPin, 
  FiUser, 
  FiX,
  FiSend,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
  // ============================================
  // Khởi tạo hooks và state
  // ============================================
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [privacy, setPrivacy] = useState('public');
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // ============================================
  // Xử lý chọn file
  // ============================================
  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      type: type,
      preview: URL.createObjectURL(file),
      uploading: false,
    }));
    setMedia(prev => [...prev, ...newMedia]);
    e.target.value = '';
  };

  // ============================================
  // Xử lý xóa media
  // ============================================
  const removeMedia = (index) => {
    const newMedia = [...media];
    URL.revokeObjectURL(newMedia[index].preview);
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };

  // ============================================
  // Xử lý thêm emoji
  // ============================================
  const handleEmojiSelect = (emoji) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // ============================================
  // Xử lý submit bài viết
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && media.length === 0) {
      toast.error('Vui lòng nhập nội dung hoặc thêm ảnh/video');
      return;
    }

    setLoading(true);

    try {
      // Upload media lên server
      const uploadedMedia = [];
      for (const item of media) {
        const formData = new FormData();
        formData.append('media', item.file);
        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedMedia.push(response.data);
      }

      // Tạo bài viết
      const postData = {
        content: content.trim(),
        media: uploadedMedia,
        privacy,
      };

      const response = await api.post('/posts', postData);
      
      // Reset form
      setContent('');
      setMedia([]);
      setPrivacy('public');
      
      // Gọi callback
      if (onPostCreated) {
        onPostCreated(response.post);
      }
      
      toast.success('Đã đăng bài viết thành công!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Không thể đăng bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={user?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
          alt={user?.fullName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">
            {user?.fullName}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Trạng thái</span>
            <span>·</span>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="bg-transparent border-none outline-none text-primary-500"
            >
              <option value="public">Công khai</option>
              <option value="friends">Bạn bè</option>
              <option value="only-me">Chỉ mình tôi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nội dung */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bạn đang nghĩ gì?"
          className="w-full px-0 py-2 border-0 outline-none resize-none text-gray-900 dark:text-white bg-transparent min-h-[80px]"
          disabled={loading}
        />

        {/* Preview media */}
        {media.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {media.map((item, index) => (
              <div key={index} className="relative group">
                {item.type === 'image' ? (
                  <img
                    src={item.preview}
                    alt={`Media ${index}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={item.preview}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
                {item.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            {/* Nút thêm ảnh */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-green-500"
            >
              <FiImage className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e, 'image')}
              className="hidden"
            />

            {/* Nút thêm video */}
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-500"
            >
              <FiVideo className="w-5 h-5" />
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleFileSelect(e, 'video')}
              className="hidden"
            />

            {/* Nút thêm emoji */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-yellow-500"
            >
              <FiSmile className="w-5 h-5" />
            </button>

            {/* Nút thêm vị trí */}
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-500"
            >
              <FiMapPin className="w-5 h-5" />
            </button>

            {/* Nút gắn thẻ */}
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-purple-500"
            >
              <FiUser className="w-5 h-5" />
            </button>
          </div>

          {/* Nút đăng */}
          <button
            type="submit"
            disabled={(!content.trim() && media.length === 0) || loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Đang đăng...
              </>
            ) : (
              <>
                <FiSend className="w-4 h-4" />
                Đăng
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;