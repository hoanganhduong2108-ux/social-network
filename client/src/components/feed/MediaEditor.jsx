// ============================================
// FILE: src/components/feed/MediaEditor.jsx
// MÔ TẢ: Chỉnh sửa ảnh/video - THÊM CHỌN FILE ÂM THANH
// ============================================

import React, { useState, useRef } from 'react';
import {
  FiX,
  FiRotateCw,
  FiCrop,
  FiUser,
  FiType,
  FiMusic,
  FiVolume2,
  FiVolumeX,
  FiScissors,
  FiFilm,
  FiUpload,
} from 'react-icons/fi';
import { uploadFile } from '../../services/api';
import toast from 'react-hot-toast';

const MediaEditor = ({ media, onClose, onSave }) => {
  const [isVideo, setIsVideo] = useState(media?.type === 'video');
  const [audioVolume, setAudioVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const videoRef = useRef(null);
  const audioInputRef = useRef(null);

  const mediaUrl = media?.url?.startsWith('http') ? media.url : `http://localhost:5000${media.url}`;

  const imageTools = [
    { icon: FiRotateCw, label: 'Xoay', action: 'rotate' },
    { icon: FiCrop, label: 'Cắt', action: 'crop' },
    { icon: FiUser, label: 'Gắn thẻ', action: 'tag' },
    { icon: FiType, label: 'Chèn văn bản', action: 'text' },
    { icon: FiMusic, label: 'Chèn âm thanh', action: 'audio' },
  ];

  const videoTools = [
    { icon: FiScissors, label: 'Thu ngắn video', action: 'trim' },
    { icon: FiFilm, label: 'Phụ đề', action: 'subtitle' },
    { icon: FiMusic, label: 'Chèn âm thanh', action: 'audio' },
  ];

  const tools = isVideo ? videoTools : imageTools;

  const handleToolAction = (action) => {
    if (action === 'audio') {
      setShowAudioControls(!showAudioControls);
      return;
    }
    const messages = {
      rotate: '🔄 Đang xoay ảnh...',
      crop: '✂️ Đang mở công cụ cắt...',
      tag: '🏷️ Đang mở công cụ gắn thẻ...',
      text: '✏️ Đang mở công cụ chèn văn bản...',
      trim: '✂️ Đang mở công cụ thu ngắn video...',
      subtitle: '📝 Đang mở công cụ thêm phụ đề...',
    };
    toast.info(messages[action] || 'Tính năng đang phát triển');
  };

  const handleAudioFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Vui lòng chọn file âm thanh');
      return;
    }

    setUploadingAudio(true);
    try {
      const response = await uploadFile(file);
      setAudioUrl(response.url);
      setAudioFile(file);
      toast.success('Đã thêm âm thanh');
      setShowAudioControls(true);
    } catch (error) {
      console.error('Audio upload error:', error);
      toast.error('Không thể upload âm thanh');
    } finally {
      setUploadingAudio(false);
    }
    e.target.value = '';
  };

  const handleSave = () => {
    const updatedMedia = {
      ...media,
      settings: {
        volume: audioVolume,
        muted: isMuted,
      },
      audio: audioUrl ? {
        url: audioUrl,
        name: audioFile?.name || 'Âm thanh',
      } : null,
    };
    if (onSave) onSave(updatedMedia);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#242526] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#3E4042]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3E4042]">
          <h2 className="text-lg font-bold text-white">
            {isVideo ? 'Chỉnh sửa video' : 'Chỉnh sửa ảnh'}
          </h2>
          <button onClick={onClose} className="text-[#B0B3B8] hover:text-white transition-colors">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center max-h-96">
            {isVideo ? (
              <video
                ref={videoRef}
                src={mediaUrl}
                className="max-h-96 w-full object-contain"
                controls
                volume={isMuted ? 0 : audioVolume}
              />
            ) : (
              <img src={mediaUrl} alt="Media preview" className="max-h-96 w-full object-contain" />
            )}
          </div>

          {/* Audio Controls */}
          {showAudioControls && (
            <div className="bg-[#18191A] rounded-lg p-3 border border-[#3E4042]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  <FiMusic className="w-4 h-4 text-[#0866FF]" />
                  Âm thanh
                </span>
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="text-xs bg-[#0866FF] hover:bg-[#1877F2] text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                  disabled={uploadingAudio}
                >
                  <FiUpload className="w-3 h-3" />
                  {uploadingAudio ? 'Đang tải...' : 'Chọn file âm thanh'}
                </button>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioFileSelect}
                />
              </div>
              
              {audioUrl && (
                <div className="mt-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-[#B0B3B8] hover:text-white"
                    >
                      {isMuted ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={audioVolume}
                      onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-[#3E4042] rounded-lg appearance-none cursor-pointer accent-[#0866FF]"
                    />
                    <span className="text-xs text-[#B0B3B8] min-w-[40px]">
                      {Math.round(audioVolume * 100)}%
                    </span>
                    <span className="text-xs text-[#B0B3B8] truncate max-w-[100px]">
                      {audioFile?.name || 'Âm thanh'}
                    </span>
                  </div>
                  <audio
                    src={audioUrl.startsWith('http') ? audioUrl : `http://localhost:5000${audioUrl}`}
                    controls
                    className="w-full h-8 mt-1"
                    volume={isMuted ? 0 : audioVolume}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tools */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tools.map((tool, index) => (
              <button
                key={index}
                onClick={() => handleToolAction(tool.action)}
                className={`flex items-center gap-2 p-3 rounded-lg transition-colors text-white text-sm ${
                  tool.action === 'audio' && showAudioControls
                    ? 'bg-[#0866FF] hover:bg-[#1877F2]'
                    : 'bg-[#3A3B3C] hover:bg-[#4E4F50]'
                }`}
              >
                <tool.icon className="w-5 h-5 text-[#0866FF]" />
                <span>{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#3E4042]">
            <button onClick={onClose} className="flex-1 bg-[#3A3B3C] hover:bg-[#4E4F50] text-white font-medium rounded-lg px-4 py-2 transition-colors">
              Hủy
            </button>
            <button onClick={handleSave} className="flex-1 bg-[#0866FF] hover:bg-[#1877F2] text-white font-medium rounded-lg px-4 py-2 transition-colors">
              Xong
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaEditor;