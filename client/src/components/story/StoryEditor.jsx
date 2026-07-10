// ============================================
// FILE: src/components/story/StoryEditor.jsx
// MÔ TẢ: Chỉnh sửa story
// ============================================

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { FiX, FiSave, FiMusic, FiVolume2, FiVolumeX, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StoryEditor = ({ story, onClose, onSave }) => {
  const { user } = useAuth();
  const [content, setContent] = useState(story?.content || '');
  const [backgroundColor, setBackgroundColor] = useState(story?.backgroundColor || '#0866FF');
  const [audio, setAudio] = useState(story?.audio || null);
  const [audioSettings, setAudioSettings] = useState({
    volume: story?.audio?.settings?.volume || 1.0,
    muted: story?.audio?.settings?.muted || false,
    loop: story?.audio?.settings?.loop || false,
  });
  const [loading, setLoading] = useState(false);

  const colors = [
    '#0866FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ];

  const removeAudio = () => {
    setAudio(null);
  };

  const toggleMute = () => {
    setAudioSettings({
      ...audioSettings,
      muted: !audioSettings.muted,
    });
  };

  const handleVolumeChange = (e) => {
    setAudioSettings({
      ...audioSettings,
      volume: parseFloat(e.target.value),
    });
  };

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        content: content.trim(),
        backgroundColor: backgroundColor,
        audio: audio ? {
          ...audio,
          settings: audioSettings,
        } : null,
      };

      const response = await api.put(`/stories/${story._id}`, updateData);
      toast.success('Đã cập nhật story!');
      if (onSave) onSave(response.story || response);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error updating story:', error);
      toast.error('Không thể cập nhật story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#242526] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-[#3E4042]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3E4042]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chỉnh sửa story</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-[#B0B3B8] hover:text-gray-700 dark:hover:text-white">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
              alt={user?.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#0866FF]"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-[#B0B3B8]">Đang chỉnh sửa story</p>
            </div>
          </div>

          {/* Preview */}
          <div 
            className="relative h-64 rounded-lg overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: backgroundColor }}
          >
            <p className="text-white text-2xl font-bold text-center p-4">
              {content || 'Nhập nội dung...'}
            </p>
          </div>

          {/* Color picker */}
          <div className="flex gap-2 overflow-x-auto py-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setBackgroundColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  backgroundColor === color ? 'border-[#0866FF] scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung story..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#18191A] border border-gray-200 dark:border-[#3E4042] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B0B3B8] focus:outline-none focus:ring-2 focus:ring-[#0866FF] resize-none min-h-[80px]"
          />

          {/* Audio controls */}
          {audio && (
            <div className="bg-gray-50 dark:bg-[#18191A] rounded-lg border border-gray-200 dark:border-[#3E4042] p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FiMusic className="w-4 h-4 text-[#0866FF]" />
                  Âm thanh
                </h3>
                <button
                  type="button"
                  onClick={removeAudio}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Xóa
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-gray-500 hover:text-gray-700 dark:text-[#B0B3B8] dark:hover:text-white"
                >
                  {audioSettings.muted ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={audioSettings.volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-2 bg-gray-300 dark:bg-[#3E4042] rounded-lg appearance-none cursor-pointer accent-[#0866FF]"
                />
                <span className="text-xs text-gray-500 dark:text-[#B0B3B8] min-w-[40px]">
                  {Math.round(audioSettings.volume * 100)}%
                </span>
              </div>
              
              <div className="mt-2">
                <audio
                  src={getMediaUrl(audio.url)}
                  controls
                  className="w-full h-10"
                  volume={audioSettings.muted ? 0 : audioSettings.volume}
                  loop={audioSettings.loop}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[#3E4042]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Xong
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryEditor;