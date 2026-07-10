// ============================================
// FILE: src/components/feed/PostEditor.jsx
// MÔ TẢ: Component chỉnh sửa bài viết - SỬA LỖI UPLOAD
// ============================================

import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api, uploadFile } from '../../services/api';
import {
  FiImage,
  FiVideo,
  FiSmile,
  FiMapPin,
  FiUser,
  FiX,
  FiSend,
  FiMusic,
  FiVolume2,
  FiVolumeX,
  FiEdit2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PostEditor = ({ post, onClose, onSave }) => {
  const { user } = useAuth();
  const [content, setContent] = useState(post?.content || '');
  const [media, setMedia] = useState(post?.media || []);
  const [audio, setAudio] = useState(post?.audio || null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioSettings, setAudioSettings] = useState({
    volume: post?.audio?.settings?.volume || 1.0,
    muted: post?.audio?.settings?.muted || false,
    loop: post?.audio?.settings?.loop || false,
  });
  const [loading, setLoading] = useState(false);
  const [privacy, setPrivacy] = useState(post?.privacy || 'friends');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Lấy URL media đúng
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  // Xử lý chọn file
  const handleFileSelect = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (type === 'image' && !file.type.startsWith('image/')) {
          toast.error(`"${file.name}" không phải là ảnh`);
          continue;
        }
        if (type === 'video' && !file.type.startsWith('video/')) {
          toast.error(`"${file.name}" không phải là video`);
          continue;
        }

        const response = await uploadFile(file, (progress) => {
          const totalProgress = Math.round(((i + progress / 100) / files.length) * 100);
          setUploadProgress(totalProgress);
        });

        const newMedia = {
          type: type,
          url: response.url,
          publicId: response.publicId,
          filename: file.name,
          duration: response.duration || 0,
          size: response.size || file.size,
        };
        setMedia(prev => [...prev, newMedia]);
      }
      
      toast.success(`Đã thêm ${files.length} file`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Không thể upload file');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
    e.target.value = '';
  };

  // Xử lý chọn âm thanh
  const handleAudioSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Vui lòng chọn file âm thanh');
      e.target.value = '';
      return;
    }

    setLoading(true);
    try {
      const response = await uploadFile(file);
      setAudio({
        url: response.url,
        publicId: response.publicId,
        settings: audioSettings,
        name: file.name,
        duration: response.duration || 0,
      });
      setAudioFile(file);
      toast.success('Đã thêm âm thanh');
    } catch (error) {
      console.error('Audio upload error:', error);
      toast.error('Không thể upload âm thanh');
    } finally {
      setLoading(false);
    }
    e.target.value = '';
  };

  // Xóa media
  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Xóa âm thanh
  const removeAudio = () => {
    setAudio(null);
    setAudioFile(null);
  };

  // Xử lý âm lượng
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setAudioSettings({
      ...audioSettings,
      volume: newVolume,
    });
    if (audio) {
      setAudio({ ...audio, settings: { ...audioSettings, volume: newVolume } });
    }
  };

  const toggleMute = () => {
    const newMuted = !audioSettings.muted;
    setAudioSettings({
      ...audioSettings,
      muted: newMuted,
    });
    if (audio) {
      setAudio({ ...audio, settings: { ...audioSettings, muted: newMuted } });
    }
  };

  // Xử lý submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && media.length === 0) {
      toast.error('Vui lòng nhập nội dung hoặc thêm ảnh/video');
      return;
    }

    setLoading(true);

    try {
      const postData = {
        content: content.trim(),
        media: media.map(m => ({
          type: m.type,
          url: m.url,
          publicId: m.publicId,
          duration: m.duration || 0,
        })),
        privacy,
        audio: audio ? {
          url: audio.url,
          publicId: audio.publicId,
          settings: audioSettings,
          name: audio.name,
          duration: audio.duration || 0,
        } : null,
      };

      const response = await api.put(`/posts/${post._id}`, postData);
      toast.success('Đã cập nhật bài viết!');

      if (onSave) {
        onSave(response.post || response);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#242526] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3E4042]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Chỉnh sửa bài viết
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nội dung
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết nội dung bài viết..."
              className="input-field"
              rows="4"
            />
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quyền riêng tư
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="input-field"
            >
              <option value="public">Công khai</option>
              <option value="friends">Bạn bè</option>
              <option value="only-me">Chỉ mình tôi</option>
            </select>
          </div>

          {/* Media preview */}
          {media.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ảnh/Video
              </label>
              <div className="grid grid-cols-2 gap-2">
                {media.map((item, index) => (
                  <div key={index} className="relative group">
                    {item.type === 'image' ? (
                      <img
                        src={getMediaUrl(item.url)}
                        alt={`Media ${index}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={getMediaUrl(item.url)}
                        className="w-full h-40 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white hover:bg-black/90 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                    {item.duration > 0 && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                        {Math.floor(item.duration)}s
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio preview */}
          {audio && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Âm thanh
              </label>
              <div className="p-3 bg-gray-100 dark:bg-[#18191A] rounded-lg border border-gray-200 dark:border-[#3E4042]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FiMusic className="w-5 h-5 text-[#0866FF]" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleMute}
                          className="text-gray-500 hover:text-gray-700 dark:text-[#B0B3B8] dark:hover:text-white"
                        >
                          {audioSettings.muted ? (
                            <FiVolumeX className="w-4 h-4" />
                          ) : (
                            <FiVolume2 className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={audioSettings.volume}
                          onChange={handleVolumeChange}
                          className="flex-1 h-1 bg-gray-300 dark:bg-[#3E4042] rounded-lg appearance-none cursor-pointer accent-[#0866FF]"
                        />
                        <span className="text-xs text-gray-500 dark:text-[#B0B3B8] min-w-[30px]">
                          {Math.round(audioSettings.volume * 100)}%
                        </span>
                      </div>
                      <audio
                        src={getMediaUrl(audio.url)}
                        controls
                        className="w-full h-8 mt-1"
                        volume={audioSettings.muted ? 0 : audioSettings.volume}
                        loop={audioSettings.loop}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeAudio}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload progress */}
          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div>
              <div className="p-2 bg-gray-100 dark:bg-[#18191A] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-[#B0B3B8]">Đang tải...</span>
                  <div className="flex-1 h-1 bg-gray-300 dark:bg-[#3E4042] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0866FF] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-[#B0B3B8]">{uploadProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors text-green-500 dark:text-green-400"
                title="Thêm ảnh"
                disabled={loading}
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

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors text-red-500 dark:text-red-400"
                title="Thêm video"
                disabled={loading}
              >
                <FiVideo className="w-5 h-5" />
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleFileSelect(e, 'video')}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors text-purple-500 dark:text-purple-400"
                title="Thêm âm thanh"
                disabled={loading}
              >
                <FiMusic className="w-5 h-5" />
              </button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Submit */}
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
              disabled={(!content.trim() && media.length === 0) || loading}
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

export default PostEditor;