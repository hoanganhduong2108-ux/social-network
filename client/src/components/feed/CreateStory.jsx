// ============================================
// FILE: src/components/feed/CreateStory.jsx
// MÔ TẢ: Component tạo Story - SỬA LỖI TRẢ VỀ DỮ LIỆU
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api, uploadFile } from '../../services/api';
import { 
  FiX, 
  FiType, 
  FiImage, 
  FiVideo, 
  FiCamera, 
  FiMusic, 
  FiVolume2, 
  FiVolumeX,
  FiClock,
  FiScissors,
  FiPlay,
  FiPause,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateStory = ({ onClose, onStoryCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaPublicId, setMediaPublicId] = useState(null);
  const [audio, setAudio] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioSettings, setAudioSettings] = useState({
    volume: 1.0,
    muted: false,
    loop: false,
    startTime: 0,
    endTime: 0,
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('choose');
  const [bgColor, setBgColor] = useState('#0866FF');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [displayDuration, setDisplayDuration] = useState(5);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [showAudioTrim, setShowAudioTrim] = useState(false);
  const [tempStartTime, setTempStartTime] = useState(0);
  const [tempEndTime, setTempEndTime] = useState(0);
  
  // ============================================
  // STATE CHO DRAG HANDLES
  // ============================================
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const audioRef = useRef(null);
  const trimContainerRef = useRef(null);

  const colors = [
    '#0866FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ];

  // ============================================
  // LẤY URL MEDIA
  // ============================================
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  // ============================================
  // XỬ LÝ CHỌN FILE
  // ============================================
  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image' && !file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn file video');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      setMedia(file);
      setMediaType(type);
      setMediaPreview(URL.createObjectURL(file));
      setMediaUrl(response.url);
      setMediaPublicId(response.publicId);
      setStep('create');
      
      toast.success('Đã tải file lên thành công');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể upload file');
    } finally {
      setLoading(false);
    }
    e.target.value = '';
  };

  // ============================================
  // XỬ LÝ CHỌN ÂM THANH
  // ============================================
  const handleAudioSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      toast.error('Không thể upload âm thanh');
    } finally {
      setLoading(false);
    }
    e.target.value = '';
  };

  // ============================================
  // XÓA ÂM THANH
  // ============================================
  const removeAudio = () => {
    setAudio(null);
    setAudioFile(null);
    setShowAudioTrim(false);
  };

  // ============================================
  // XỬ LÝ ÂM LƯỢNG
  // ============================================
  const handleVolumeChange = (e) => {
    setAudioSettings({
      ...audioSettings,
      volume: parseFloat(e.target.value),
    });
  };

  const toggleMute = () => {
    setAudioSettings({
      ...audioSettings,
      muted: !audioSettings.muted,
    });
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
    setShowAudioTrim(false);
    toast.success('Đã cắt đoạn âm thanh');
  };

  // ============================================
  // XỬ LÝ TẠO TEXT STORY
  // ============================================
  const handleCreateTextStory = () => {
    setStep('create');
    setMediaType('text');
  };

  // ============================================
  // XỬ LÝ SUBMIT - SỬA LỖI TRẢ VỀ DỮ LIỆU
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !media) {
      toast.error('Vui lòng nhập nội dung hoặc thêm ảnh/video');
      return;
    }

    if (mediaType === 'image' && displayDuration > 60) {
      toast.error('Thời gian hiển thị không được vượt quá 60 giây');
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Creating story...');
      
      let uploadedAudio = null;
      if (audioFile) {
        const audioFormData = new FormData();
        audioFormData.append('media', audioFile);
        const audioResponse = await api.post('/upload', audioFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedAudio = {
          url: audioResponse.url,
          publicId: audioResponse.publicId,
          settings: {
            volume: audioSettings.volume,
            muted: audioSettings.muted,
            loop: audioSettings.loop,
            startTime: audioSettings.startTime || 0,
            endTime: audioSettings.endTime || audioDuration || 0,
          },
        };
      }

      let response;
      if (media) {
        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('backgroundColor', bgColor);
        formData.append('privacy', 'friends');
        formData.append('media', media);
        formData.append('displayDuration', displayDuration.toString());

        if (uploadedAudio) {
          formData.append('audio', JSON.stringify(uploadedAudio));
        }

        response = await api.post('/stories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('✅ Story with media created:', response);
      } else {
        const storyData = {
          content: content.trim(),
          backgroundColor: bgColor,
          privacy: 'friends',
          displayDuration: displayDuration,
          audio: uploadedAudio,
        };
        response = await api.post('/stories', storyData);
        console.log('✅ Story with text/audio created:', response);
      }

      toast.success('Đã đăng tin thành công!');
      
      // ============================================
      // LẤY STORY TỪ RESPONSE VÀ GỌI CALLBACK
      // ============================================
      const newStory = response.story || response;
      console.log('📝 New story data:', newStory);
      
      if (onStoryCreated) {
        onStoryCreated(newStory); // TRUYỀN DỮ LIỆU THỰC TẾ
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Error creating story:', error);
      toast.error(error.response?.data?.message || error.message || 'Không thể đăng tin');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RESET FORM
  // ============================================
  const resetForm = () => {
    setContent('');
    setMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    setMediaUrl(null);
    setMediaPublicId(null);
    setAudio(null);
    setAudioFile(null);
    setStep('choose');
    setBgColor('#0866FF');
    setUploadProgress(0);
    setDisplayDuration(5);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
      <div className="mt-3 pt-3 border-t border-[#3E4042]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#B0B3B8] flex items-center gap-2">
            <FiScissors className="w-3 h-3" />
            Cắt đoạn âm thanh
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#B0B3B8]">
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
              className="text-xs text-[#B0B3B8] hover:text-white"
            >
              <FiX className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* THANH THỜI GIAN VỚI 2 CHẤM TRÒN */}
        {/* ============================================ */}
        <div 
          ref={trimContainerRef}
          className="relative w-full h-10 bg-[#3E4042] rounded-lg overflow-hidden cursor-pointer"
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
          {/* Phần được chọn */}
          <div 
            className="absolute top-0 h-full bg-[#0866FF]/30"
            style={{
              left: `${startPercent}%`,
              width: `${trimWidth}%`,
            }}
          />

          {/* Khu vực đã cắt bỏ (bên trái) */}
          <div 
            className="absolute top-0 h-full bg-gray-600/40"
            style={{
              left: 0,
              width: `${startPercent}%`,
            }}
          />

          {/* Khu vực đã cắt bỏ (bên phải) */}
          <div 
            className="absolute top-0 h-full bg-gray-600/40"
            style={{
              left: `${endPercent}%`,
              width: `${100 - endPercent}%`,
            }}
          />

          {/* CHẤM TRÒN BẮT ĐẦU */}
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

          {/* CHẤM TRÒN KẾT THÚC */}
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

          {/* Vạch thời gian */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[8px] text-[#B0B3B8]">
            <span>0s</span>
            <span>{Math.floor(audioDuration / 2)}s</span>
            <span>{Math.floor(audioDuration)}s</span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER CHOOSE STEP
  // ============================================
  if (step === 'choose') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-[#242526] rounded-2xl max-w-md w-full p-6 border border-[#3E4042]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Tin của bạn</h3>
            <button onClick={handleClose} className="text-[#B0B3B8] hover:text-white transition-colors">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
              alt={user?.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#0866FF]"
            />
            <div>
              <p className="text-white font-semibold">{user?.fullName}</p>
              <p className="text-[#B0B3B8] text-sm">Chia sẻ khoảnh khắc của bạn</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#3A3B3C] hover:bg-[#4E4F50] rounded-xl p-6 text-center transition-colors border-2 border-transparent hover:border-[#0866FF] group"
            >
              <div className="w-16 h-16 bg-[#0866FF]/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#0866FF]/30">
                <FiImage className="w-8 h-8 text-[#0866FF]" />
              </div>
              <p className="text-white font-medium">Tạo tin có ảnh hoặc video</p>
              <p className="text-[#B0B3B8] text-sm mt-1">Chọn ảnh/video từ thiết bị</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'image')}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleFileSelect(e, 'video')}
              className="hidden"
            />

            <button
              onClick={handleCreateTextStory}
              className="bg-[#3A3B3C] hover:bg-[#4E4F50] rounded-xl p-6 text-center transition-colors border-2 border-transparent hover:border-[#0866FF] group"
            >
              <div className="w-16 h-16 bg-[#0866FF]/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#0866FF]/30">
                <FiType className="w-8 h-8 text-[#0866FF]" />
              </div>
              <p className="text-white font-medium">Tạo tin dạng văn bản</p>
              <p className="text-[#B0B3B8] text-sm mt-1">Chia sẻ suy nghĩ của bạn</p>
            </button>
          </div>

          <button
            onClick={() => videoInputRef.current?.click()}
            className="w-full mt-3 bg-[#3A3B3C] hover:bg-[#4E4F50] rounded-xl p-4 text-center transition-colors border-2 border-transparent hover:border-[#0866FF] group flex items-center justify-center gap-3"
          >
            <FiVideo className="w-6 h-6 text-[#0866FF]" />
            <span className="text-white font-medium">Tạo tin video</span>
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleFileSelect(e, 'video')}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER CREATE STEP
  // ============================================
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#242526] rounded-2xl max-w-md w-full overflow-hidden border border-[#3E4042]">
        <div className="flex justify-between items-center p-4 border-b border-[#3E4042]">
          <h3 className="text-lg font-bold text-white">Tạo tin mới</h3>
          <button onClick={handleClose} className="text-[#B0B3B8] hover:text-white transition-colors">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Preview */}
        <div 
          className="relative h-96 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: media ? 'transparent' : bgColor }}
        >
          {mediaPreview ? (
            mediaType === 'image' ? (
              <img src={mediaPreview} alt="Story preview" className="w-full h-full object-cover" />
            ) : mediaType === 'video' ? (
              <video src={mediaPreview} className="w-full h-full object-cover" controls />
            ) : null
          ) : (
            <div className="text-center text-white p-4">
              <p className="text-xl font-bold">Bạn đang nghĩ gì?</p>
              <p className="text-sm opacity-70 mt-2">Nhập nội dung bên dưới</p>
            </div>
          )}

          {content && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-lg font-bold text-center">{content}</p>
            </div>
          )}

          <div className="absolute top-4 left-4 flex items-center gap-3">
            <img
              src={user?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
              alt={user?.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            <span className="text-white font-semibold">{user?.fullName}</span>
          </div>

          {!media && (
            <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setBgColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${(
                    bgColor === color ? 'border-white scale-110' : 'border-transparent'
                  )}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-[#242526] p-4 rounded-lg text-center">
                <div className="w-32 h-1 bg-[#3E4042] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0866FF] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-white text-sm mt-2">{uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Thời gian hiển thị - cho ảnh */}
          {mediaType === 'image' && (
            <div className="flex items-center gap-3 bg-[#18191A] rounded-lg p-3 border border-[#3E4042]">
              <FiClock className="w-5 h-5 text-[#0866FF]" />
              <div className="flex-1">
                <label className="text-xs text-[#B0B3B8] block">Thời gian hiển thị (giây)</label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={displayDuration}
                  onChange={(e) => setDisplayDuration(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#3E4042] rounded-lg appearance-none cursor-pointer accent-[#0866FF]"
                />
              </div>
              <span className="text-white font-bold min-w-[40px] text-right">{displayDuration}s</span>
            </div>
          )}

          {/* Media buttons */}
          <div className="flex flex-wrap gap-2">
            {!media && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-[#3A3B3C] hover:bg-[#4E4F50] text-white font-medium rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2"
                >
                  <FiCamera className="w-4 h-4" />
                  Thêm ảnh
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'image')}
                  className="hidden"
                />
              </>
            )}
            {!media && (
              <>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex-1 bg-[#3A3B3C] hover:bg-[#4E4F50] text-white font-medium rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2"
                >
                  <FiVideo className="w-4 h-4" />
                  Thêm video
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileSelect(e, 'video')}
                  className="hidden"
                />
              </>
            )}
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="flex-1 bg-[#3A3B3C] hover:bg-[#4E4F50] text-white font-medium rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2"
            >
              <FiMusic className="w-4 h-4" />
              Thêm nhạc
            </button>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioSelect}
              className="hidden"
            />
          </div>

          {/* Audio preview với trim */}
          {audio && (
            <div className="p-3 bg-[#18191A] rounded-lg border border-[#3E4042]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <FiMusic className="w-4 h-4 text-[#0866FF]" />
                  {audio.name || 'Âm thanh'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAudioTrim(!showAudioTrim)}
                    className="text-xs text-[#0866FF] hover:text-[#1877F2]"
                  >
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
                  className="text-white hover:text-[#0866FF] transition-colors"
                >
                  {isAudioPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
                </button>
                
                <div className="flex-1">
                  <div className="relative h-1 bg-[#3E4042] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0866FF] transition-all duration-100"
                      style={{ width: `${(audioCurrentTime / (audioDuration || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-[#B0B3B8] hover:text-white"
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
                    className="w-16 h-1 bg-[#3E4042] rounded-lg appearance-none cursor-pointer accent-[#0866FF]"
                  />
                  <span className="text-xs text-[#B0B3B8] min-w-[30px]">
                    {Math.round(audioSettings.volume * 100)}%
                  </span>
                </div>
              </div>

              {/* Audio Trim UI */}
              {renderAudioTrim()}

              <audio
                ref={audioRef}
                src={getMediaUrl(audio.url)}
                onTimeUpdate={handleAudioTimeUpdate}
                onLoadedMetadata={handleAudioLoadedMetadata}
                onEnded={() => setIsAudioPlaying(false)}
                volume={audioSettings.muted ? 0 : audioSettings.volume}
                loop={audioSettings.loop}
              />
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung tin..."
            className="w-full px-4 py-3 bg-[#18191A] border border-[#3E4042] rounded-lg text-white placeholder-[#B0B3B8] focus:outline-none focus:ring-2 focus:ring-[#0866FF] resize-none min-h-[80px]"
            maxLength={500}
          />

          <div className="flex items-center justify-between text-[#B0B3B8] text-sm">
            <span>{content.length}/500</span>
            <div className="flex items-center gap-2">
              <span className="text-[#0866FF]">●</span>
              <span>Bạn bè</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-[#3A3B3C] hover:bg-[#4E4F50] text-white font-medium rounded-lg px-4 py-2 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || (!content.trim() && !media)}
              className="flex-1 bg-[#0866FF] hover:bg-[#1877F2] text-white font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Đang đăng...
                </>
              ) : (
                'Đăng'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStory;