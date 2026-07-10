// ============================================
// FILE: src/components/feed/StoryCard.jsx
// MÔ TẢ: Hiển thị một story
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';

const StoryCard = ({ story, isCreate = false }) => {
  if (isCreate) {
    return (
      <div className="flex-shrink-0 w-24">
        <div className="relative w-24 h-36 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <FiPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 py-1 text-center text-xs">
            Tạo story
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={`/story/${story._id}`} className="flex-shrink-0 w-24 group cursor-pointer">
      <div className="relative w-24 h-36 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img
          src={story.image || story.user?.avatar}
          alt={story.user?.fullName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />

        <div className="absolute top-2 left-2">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 overflow-hidden">
            <img
              src={
                story.user?.avatar ||
                'https://ui-avatars.com/api/?background=random&bold=true'
              }
              alt={story.user?.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white text-xs font-medium truncate">{story.user?.fullName}</p>
        </div>
      </div>
    </Link>
  );
};

export default StoryCard;