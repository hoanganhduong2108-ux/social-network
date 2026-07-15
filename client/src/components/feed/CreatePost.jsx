// ============================================
// FILE: src/components/feed/CreatePost.jsx
// MÔ TẢ: Component tạo bài viết - SỬA LỖI UPLOAD
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
  FiMusic,
  FiVolume2,
  FiVolumeX,
  FiEdit2,
  FiScissors,
  FiPlay,
  FiPause,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated, editingPost = null, onCancelEdit = null, groupId = null }) => {
  const { user } = useAuth();
  const [content, setContent] = useState(editingPost?.content || '');
  const [media, setMedia] = useState(editingPost?.media || []);
  const [audio, setAudio] = useState(editingPost?.audio || null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioSettings, setAudioSettings] = useState({
    volume: editingPost?.audio?.settings?.volume || 1.0,
    muted: editingPost?.audio?.settings?.muted || false,
    loop: editingPost?.audio?.settings?.loop || false,
    startTime: editingPost?.audio?.settings?.startTime || 0,
    endTime: editingPost?.audio?.settings?.endTime || 0,
  });
  const [loading, setLoading] = useState(false);
  const [privacy, setPrivacy] = useState(editingPost?.privacy || 'friends');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showAudioTrim, setShowAudioTrim] = useState(false);
  const [tempStartTime, setTempStartTime] = useState(0);
  const [tempEndTime, setTempEndTime] = useState(0);
  
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const audioRef = useRef(null);
  const trimContainerRef = useRef(null);

  // ============================================
  // GIỚI HẠN KÍCH THƯỚC FILE
  // ============================================
  const MAX_FILE_SIZE = {
    image: 100 * 1024 * 1024,   // 100MB
    video: 10000 * 1024 * 1024,  // 10000MB
    audio: 100 * 1024 * 1024,   // 100MB
  };

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  // ============================================
  // HÀM NÉN ẢNH TRƯỚC KHI UPLOAD
  // ============================================
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.85);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // ============================================
  // XỬ LÝ CHỌN FILE - CÓ NÉN ẢNH
  // ============================================
  const handleFileSelect = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        
        // ============================================
        // KIỂM TRA LOẠI FILE
        // ============================================
        if (type === 'image' && !file.type.startsWith('image/')) {
          toast.error(`"${file.name}" không phải là ảnh`);
          continue;
        }
        if (type === 'video' && !file.type.startsWith('video/')) {
          toast.error(`"${file.name}" không phải là video`);
          continue;
        }

        // ============================================
        // KIỂM TRA KÍCH THƯỚC FILE
        // ============================================
        let maxSize = type === 'image' ? MAX_FILE_SIZE.image : 
                      type === 'video' ? MAX_FILE_SIZE.video : MAX_FILE_SIZE.audio;
        
        if (file.size > maxSize) {
          const sizeInMB = (maxSize / (1024 * 1024)).toFixed(0);
          toast.error(`"${file.name}" quá lớn (tối đa ${sizeInMB}MB)`);
          continue;
        }

        // ============================================
        // NÉN ẢNH TRƯỚC KHI UPLOAD
        // ============================================
        let fileToUpload = file;
        if (type === 'image' && file.size > 5 * 1024 * 1024) { // Nén nếu > 5MB
          try {
            fileToUpload = await compressImage(file);
            console.log(`🔄 Compressed: ${(file.size / (1024 * 1024)).toFixed(2)}MB → ${(fileToUpload.size / (1024 * 1024)).toFixed(2)}MB`);
          } catch (err) {
            console.warn('Không thể nén ảnh, sử dụng file gốc:', err);
          }
        }

        // ============================================
        // UPLOAD FILE
        // ============================================
        const response = await uploadFile(fileToUpload, (progress) => {
          const totalProgress = Math.round(((i + progress / 100) / files.length) * 100);
          setUploadProgress(totalProgress);
        });

        const newMedia = {
          type: type,
          url: response.url,
          publicId: response.publicId,
          filename: file.name,
          duration: response.duration || 0,
          size: response.size || fileToUpload.size,
        };
        setMedia(prev => [...prev, newMedia]);
      }
      
      toast.success(`Đã thêm ${files.length} file`);
    } catch (error) {
      console.error('Upload error:', error);
      
      // ============================================
      // XỬ LÝ LỖI TIMEOUT
      // ============================================
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Upload quá lâu, vui lòng thử lại với file nhỏ hơn');
      } else {
        toast.error(error.response?.data?.message || 'Không thể upload file');
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
    e.target.value = '';
  };

  // ============================================
  // XỬ LÝ CHỌN ÂM THANH
  // ============================================
  const handleAudioSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Vui lòng chọn file âm thanh');
      e.target.value = '';
      return;
    }

    // Kiểm tra kích thước audio
    if (file.size > MAX_FILE_SIZE.audio) {
      toast.error(`File âm thanh quá lớn (tối đa ${MAX_FILE_SIZE.audio / (1024 * 1024)}MB)`);
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
      setAudioDuration(response.duration || 0);
      setTempEndTime(response.duration || 0);
      toast.success('Đã thêm âm thanh');
      setShowAudioTrim(true);
    } catch (error) {
      console.error('Audio upload error:', error);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Upload âm thanh quá lâu, vui lòng thử lại');
      } else {
        toast.error('Không thể upload âm thanh');
      }
    } finally {
      setLoading(false);
    }
    e.target.value = '';
  };

  // ============================================
  // XÓA MEDIA
  // ============================================
  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================
  // XÓA ÂM THANH
  // ============================================
  const removeAudio = () => {
    setAudio(null);
    setAudioFile(null);
    setShowAudioTrim(false);
    setAudioCurrentTime(0);
  };

  // ============================================
  // XỬ LÝ ÂM LƯỢNG
  // ============================================
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

  // ============================================
  // XỬ LÝ AUDIO PLAYBACK
  // ============================================
  const handleAudioPlay = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.currentTime = tempStartTime || 0;
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      if (tempEndTime > 0 && audioRef.current.currentTime >= tempEndTime) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      setAudioDuration(duration);
      setTempEndTime(duration);
      setAudioSettings(prev => ({ ...prev, endTime: duration }));
    }
  };

  // ============================================
  // AUDIO TRIM - DRAGGABLE HANDLES
  // ============================================
  const handleTrimStart = (clientX) => {
    if (!trimContainerRef.current) return;
    const rect = trimContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * audioDuration;
    if (newTime < tempEndTime - 0.5) {
      setTempStartTime(newTime);
      setAudioSettings(prev => ({ ...prev, startTime: newTime }));
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  const handleTrimEnd = (clientX) => {
    if (!trimContainerRef.current) return;
    const rect = trimContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * audioDuration;
    if (newTime > tempStartTime + 0.5) {
      setTempEndTime(newTime);
      setAudioSettings(prev => ({ ...prev, endTime: newTime }));
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingStart) {
      handleTrimStart(e.clientX);
    }
    if (isDraggingEnd) {
      handleTrimEnd(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const startDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingStart(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startDragEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingEnd(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const applyAudioTrim = () => {
    if (tempStartTime >= tempEndTime) {
      toast.error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
      return;
    }
    setAudioSettings(prev => ({
      ...prev,
      startTime: tempStartTime,
      endTime: tempEndTime,
    }));
    if (audio) {
      setAudio({
        ...audio,
        settings: {
          ...audioSettings,
          startTime: tempStartTime,
          endTime: tempEndTime,
        }
      });
    }
    setShowAudioTrim(false);
    toast.success('Đã cắt đoạn âm thanh');
  };

  // ============================================
  // XỬ LÝ SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && media.length === 0) {
      toast.error('Vui lòng nhập nội dung hoặc thêm ảnh/video');
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Submitting post...');
      console.log('📝 groupId:', groupId);

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
          settings: {
            volume: audioSettings.volume,
            muted: audioSettings.muted,
            loop: audioSettings.loop,
            startTime: audioSettings.startTime || 0,
            endTime: audioSettings.endTime || audio.duration || 0,
          },
          name: audio.name,
          duration: audio.duration || 0,
        } : null,
        groupId: groupId || null,
      };

      let response;
      if (editingPost) {
        response = await api.put(`/posts/${editingPost._id}`, postData);
        toast.success('Đã cập nhật bài viết!');
        const updatedPost = response.post || response;
        if (onPostCreated) {
          onPostCreated(updatedPost);
        }
      } else {
        response = await api.post('/posts', postData);
        toast.success('Đã đăng bài viết thành công!');
        const newPost = response.post || response;
        
        setContent('');
        setMedia([]);
        setAudio(null);
        setAudioFile(null);
        setPrivacy('friends');
        setAudioSettings({ volume: 1.0, muted: false, loop: false, startTime: 0, endTime: 0 });
        setShowAudioTrim(false);

        if (onPostCreated) {
          onPostCreated(newPost);
        }
      }
      
      if (onCancelEdit) onCancelEdit();
    } catch (error) {
      console.error('❌ Error creating post:', error);
      toast.error(error.response?.data?.message || 'Không thể đăng bài viết');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER AUDIO TRIM UI
  // ============================================
  const renderAudioTrim = () => {
    if (!audio || !showAudioTrim) return null;

    const startPercent = (tempStartTime / audioDuration) * 100;
    const endPercent = (tempEndTime / audioDuration) * 100;
    const trimWidth = endPercent - startPercent;

    return (
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#3E4042]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 dark:text-[#B0B3B8] flex items-center gap-2">
            <FiScissors className="w-3 h-3" />
            Cắt đoạn âm thanh
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-[#B0B3B8]">
              {Math.floor(tempStartTime)}s - {Math.floor(tempEndTime)}s
            </span>
            <button
              type="button"
              onClick={applyAudioTrim}
              className="text-xs bg-[#0866FF] text-white px-2 py-1 rounded-lg hover:bg-[#1877F2] transition-colors"
            >
              Áp dụng
            </button>
            <button
              type="button"
              onClick={() => setShowAudioTrim(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-[#B0B3B8] dark:hover:text-white"
            >
              <FiX className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div 
          ref={trimContainerRef}
          className="relative w-full h-10 bg-gray-200 dark:bg-[#3E4042] rounded-lg overflow-hidden cursor-pointer"
          onMouseDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            const newTime = percentage * audioDuration;
            
            const distStart = Math.abs(newTime - tempStartTime);
            const distEnd = Math.abs(newTime - tempEndTime);
            
            if (distStart < distEnd && newTime < tempEndTime - 0.5) {
              setTempStartTime(newTime);
              setAudioSettings(prev => ({ ...prev, startTime: newTime }));
              if (audioRef.current) {
                audioRef.current.currentTime = newTime;
              }
            } else if (newTime > tempStartTime + 0.5) {
              setTempEndTime(newTime);
              setAudioSettings(prev => ({ ...prev, endTime: newTime }));
            }
          }}
        >
          <div 
            className="absolute top-0 h-full bg-[#0866FF]/30"
            style={{
              left: `${startPercent}%`,
              width: `${trimWidth}%`,
            }}
          />
          <div 
            className="absolute top-0 h-full bg-gray-400/40 dark:bg-gray-600/40"
            style={{
              left: 0,
              width: `${startPercent}%`,
            }}
          />
          <div 
            className="absolute top-0 h-full bg-gray-400/40 dark:bg-gray-600/40"
            style={{
              left: `${endPercent}%`,
              width: `${100 - endPercent}%`,
            }}
          />

          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0866FF] border-2 border-white shadow-lg cursor-ew-resize z-10 hover:scale-110 transition-transform"
            style={{
              left: `calc(${startPercent}% - 10px)`,
              cursor: 'ew-resize',
            }}
            onMouseDown={startDragStart}
            title="Kéo để điều chỉnh điểm bắt đầu"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-white bg-black/70 px-1 rounded whitespace-nowrap">
              {Math.floor(tempStartTime)}s
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#0866FF]" />
          </div>

          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0866FF] border-2 border-white shadow-lg cursor-ew-resize z-10 hover:scale-110 transition-transform"
            style={{
              left: `calc(${endPercent}% - 10px)`,
              cursor: 'ew-resize',
            }}
            onMouseDown={startDragEnd}
            title="Kéo để điều chỉnh điểm kết thúc"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-white bg-black/70 px-1 rounded whitespace-nowrap">
              {Math.floor(tempEndTime)}s
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#0866FF]" />
          </div>

          <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[8px] text-gray-500 dark:text-[#B0B3B8]">
            <span>0s</span>
            <span>{Math.floor(audioDuration / 2)}s</span>
            <span>{Math.floor(audioDuration)}s</span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER CHÍNH
  // ============================================
  return (
    <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#3E4042] transition-colors duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
            alt={user?.fullName}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#0866FF]"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#B0B3B8]">
              <span>📌</span>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="bg-transparent border-none outline-none text-[#0866FF] font-medium cursor-pointer"
              >
                <option value="public">Công khai</option>
                <option value="friends">Bạn bè</option>
                <option value="only-me">Chỉ mình tôi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Content */}
        <div className="px-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`${user?.fullName} ơi, bạn đang nghĩ gì thế?`}
            className="w-full px-0 py-3 border-0 outline-none resize-none text-gray-900 dark:text-white bg-transparent min-h-[80px] placeholder-gray-400 dark:placeholder-[#B0B3B8] text-lg"
            disabled={loading}
          />
        </div>

        {/* Media preview */}
        {media.length > 0 && (
          <div className="px-4 pb-2">
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

        {/* Audio */}
        {audio && (
          <div className="px-4 pb-2">
            <div className="p-3 bg-gray-100 dark:bg-[#18191A] rounded-lg border border-gray-200 dark:border-[#3E4042]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FiMusic className="w-4 h-4 text-[#0866FF]" />
                  {audio.name || 'Âm thanh'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAudioTrim(!showAudioTrim)}
                    className="text-xs text-[#0866FF] hover:text-[#1877F2] flex items-center gap-1"
                  >
                    <FiScissors className="w-3 h-3" />
                    {showAudioTrim ? 'Đóng' : 'Cắt'}
                  </button>
                  <button
                    type="button"
                    onClick={removeAudio}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAudioPlay}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0866FF] transition-colors"
                >
                  {isAudioPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
                </button>
                
                <div className="flex-1">
                  <div className="relative h-1.5 bg-gray-300 dark:bg-[#3E4042] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0866FF] transition-all duration-100"
                      style={{ width: `${(audioCurrentTime / (audioDuration || 1)) * 100}%` }}
                    />
                    {tempStartTime > 0 && (
                      <div
                        className="absolute top-0 w-0.5 h-full bg-green-500"
                        style={{ left: `${(tempStartTime / (audioDuration || 1)) * 100}%` }}
                      />
                    )}
                    {tempEndTime > 0 && tempEndTime < audioDuration && (
                      <div
                        className="absolute top-0 w-0.5 h-full bg-red-500"
                        style={{ left: `${(tempEndTime / (audioDuration || 1)) * 100}%` }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-[#B0B3B8] mt-0.5">
                    <span>{Math.floor(audioCurrentTime)}s</span>
                    <span>{Math.floor(audioDuration)}s</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-gray-500 hover:text-gray-700 dark:text-[#B0B3B8] dark:hover:text-white"
                  >
                    {audioSettings.muted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={audioSettings.volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-gray-300 dark:bg-[#3E4042] rounded-lg appearance-none cursor-pointer accent-[#0866FF]"
                  />
                  <span className="text-xs text-gray-500 dark:text-[#B0B3B8] min-w-[30px]">
                    {Math.round(audioSettings.volume * 100)}%
                  </span>
                </div>
              </div>

              {renderAudioTrim()}

              <audio
                ref={audioRef}
                src={getMediaUrl(audio.url)}
                onTimeUpdate={handleAudioTimeUpdate}
                onLoadedMetadata={handleAudioLoadedMetadata}
                onEnded={() => {
                  setIsAudioPlaying(false);
                  if (audioSettings.loop) {
                    audioRef.current.currentTime = tempStartTime || 0;
                    audioRef.current.play();
                  }
                }}
                volume={audioSettings.muted ? 0 : audioSettings.volume}
                loop={audioSettings.loop}
              />
            </div>
          </div>
        )}

        {/* Upload progress */}
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="px-4 pb-2">
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
        <div className="px-4 pb-2 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />

              <button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors text-yellow-500 dark:text-yellow-400"
                title="Thêm emoji"
              >
                <FiSmile className="w-5 h-5" />
              </button>

              <button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors text-blue-500 dark:text-blue-400"
                title="Thêm vị trí"
              >
                <FiMapPin className="w-5 h-5" />
              </button>

              <button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors text-purple-500 dark:text-purple-400"
                title="Gắn thẻ bạn bè"
              >
                <FiUser className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowEditor(!showEditor)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors text-blue-500 dark:text-blue-400"
                title="Chỉnh sửa"
              >
                <FiEdit2 className="w-5 h-5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && media.length === 0) || loading}
              className="bg-[#0866FF] hover:bg-[#1877F2] text-white font-semibold rounded-lg px-6 py-1.5 text-sm disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Đang đăng...
                </span>
              ) : (
                'Đăng'
              )}
            </button>
          </div>
        </div>

        {/* Editor */}
        {showEditor && (
          <div className="p-4 border-t border-gray-200 dark:border-[#3E4042] bg-gray-50 dark:bg-[#18191A]">
            <div className="flex items-center gap-3 mb-3">
              <FiEdit2 className="w-5 h-5 text-[#0866FF]" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chỉnh sửa bài viết</span>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="ml-auto text-gray-500 hover:text-gray-700 dark:text-[#B0B3B8] dark:hover:text-white"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors text-sm text-gray-700 dark:text-gray-300"
                onClick={() => {
                  toast.info('Tính năng thu ngắn video đang phát triển');
                  setShowEditor(false);
                }}
              >
                <FiEdit2 className="w-4 h-4 text-[#0866FF]" />
                Thu ngắn video
              </button>
              <button 
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors text-sm text-gray-700 dark:text-gray-300"
                onClick={() => {
                  toast.info('Tính năng phụ đề đang phát triển');
                  setShowEditor(false);
                }}
              >
                <FiEdit2 className="w-4 h-4 text-[#0866FF]" />
                Phụ đề
              </button>
              <button 
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors text-sm text-gray-700 dark:text-gray-300"
                onClick={() => {
                  toast.info('Tính năng mô tả bằng âm thanh đang phát triển');
                  setShowEditor(false);
                }}
              >
                <FiEdit2 className="w-4 h-4 text-[#0866FF]" />
                Mô tả bằng âm thanh
              </button>
              <button 
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors text-sm text-gray-700 dark:text-gray-300"
                onClick={() => {
                  toast.info('Tính năng bản chép lời đang phát triển');
                  setShowEditor(false);
                }}
              >
                <FiEdit2 className="w-4 h-4 text-[#0866FF]" />
                Bản chép lời
              </button>
            </div>
            
            <button 
              className="mt-3 w-full bg-[#0866FF] hover:bg-[#1877F2] text-white font-semibold rounded-lg py-2 text-sm transition-colors"
              onClick={() => setShowEditor(false)}
            >
              Xong
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;