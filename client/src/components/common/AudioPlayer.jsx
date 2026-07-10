// ============================================
// FILE: src/components/common/AudioPlayer.jsx
// MÔ TẢ: Component phát âm thanh
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { FiMusic, FiVolume2, FiVolumeX, FiPlay, FiPause } from 'react-icons/fi';

const AudioPlayer = ({ audio, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(audio?.settings?.volume || 1);
  const [isMuted, setIsMuted] = useState(audio?.settings?.muted || false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  if (!audio || !audio.url) return null;

  return (
    <div className={`bg-gray-100 dark:bg-[#18191A] rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-3">
        <FiMusic className="w-5 h-5 text-[#0866FF] flex-shrink-0" />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={togglePlay}
              className="text-gray-700 dark:text-gray-300 hover:text-[#0866FF] transition-colors"
            >
              {isPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
            </button>
            
            <div className="flex-1 h-1 bg-gray-300 dark:bg-[#3E4042] rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-[#0866FF] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <span className="text-xs text-gray-500 dark:text-[#B0B3B8] min-w-[40px]">
              {audio.duration ? `${Math.floor(audio.duration)}s` : '--'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-gray-500 hover:text-gray-700 dark:text-[#B0B3B8] dark:hover:text-white transition-colors"
            >
              {isMuted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-gray-300 dark:bg-[#3E4042] rounded-lg appearance-none cursor-pointer accent-[#0866FF]"
            />
            <span className="text-xs text-gray-500 dark:text-[#B0B3B8] min-w-[30px]">
              {Math.round(volume * 100)}%
            </span>
            <span className="text-xs text-gray-500 dark:text-[#B0B3B8] truncate flex-1 text-right">
              {audio.name || 'Nhạc nền'}
            </span>
          </div>
        </div>
        
        <audio
          ref={audioRef}
          src={audio.url.startsWith('http') ? audio.url : `http://localhost:5000${audio.url}`}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          loop={audio.settings?.loop || false}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;