// ============================================
// FILE: src/components/story/CreateStory.jsx
// MÔ TẢ: Component tạo Story - FIX LỖI
// ============================================

import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api, uploadFile } from '../../services/api';
import { FiX, FiType, FiImage, FiVideo, FiCamera, FiMusic, FiVolume2, FiVolumeX } from 'react-icons/fi';
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
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('choose');
  const [bgColor, setBgColor] = useState('#0866FF');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const colors = [
    '#0866FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ];

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
      // Upload file
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

  const removeAudio = () => {
    setAudio(null);
    setAudioFile(null);
  };

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

  const handleCreateTextStory = () => {
    setStep('create');
    setMediaType('text');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !media) {
      toast.error('Vui lòng nhập nội dung hoặc thêm ảnh/video');
      return;
    }

    setLoading(true);

    try {
      const storyData = {
        content: content.trim(),
        backgroundColor: bgColor,
        privacy: 'friends',
      };

      // Thêm media nếu có
      if (media) {
        storyData.media = [{
          type: mediaType,
          url: mediaUrl,
          publicId: mediaPublicId || '',
        }];
      }

      // Thêm audio nếu có
      if (audio) {
        storyData.audio = {
          url: audio.url,
          publicId: audio.publicId,
          settings: audioSettings,
          name: audio.name,
        };
      }

      const response = await api.post('/stories', storyData);
      
      toast.success('Đã đăng tin thành công!');
      if (onStoryCreated) {
        onStoryCreated(response.story);
      }
      onClose();
    } catch (error) {
      console.error('❌ Error creating story:', error);
      toast.error(error.response?.data?.message || 'Không thể đăng tin');
    } finally {
      setLoading(false);
    }
  };

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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Chọn loại tin
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

  // Tạo tin
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
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    bgColor === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
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

          {audio && (
            <div className="p-3 bg-[#18191A] rounded-lg border border-[#3E4042]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <FiMusic className="w-5 h-5 text-[#0866FF]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={toggleMute} className="text-[#B0B3B8] hover:text-white">
                        {audioSettings.muted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={audioSettings.volume}
                        onChange={handleVolumeChange}
                        className="flex-1 h-1 bg-[#3E4042] rounded-lg appearance-none cursor-pointer accent-[#0866FF]"
                      />
                      <span className="text-xs text-[#B0B3B8] min-w-[30px]">
                        {Math.round(audioSettings.volume * 100)}%
                      </span>
                    </div>
                    <audio
                      src={audio.url?.startsWith('http') ? audio.url : `http://localhost:5000${audio.url}`}
                      controls
                      className="w-full h-8 mt-1"
                      volume={audioSettings.muted ? 0 : audioSettings.volume}
                      loop={audioSettings.loop}
                    />
                  </div>
                  <button type="button" onClick={removeAudio} className="text-red-500 hover:text-red-600">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
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
            <button type="button" onClick={handleClose} className="flex-1 bg-[#3A3B3C] hover:bg-[#4E4F50] text-white font-medium rounded-lg px-4 py-2 transition-colors">
              Bỏ
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
                'Chia sẻ lên tin'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStory;