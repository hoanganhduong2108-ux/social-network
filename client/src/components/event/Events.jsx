// ============================================
// FILE: client/src/components/events/Events.jsx
// MÔ TẢ: Trang quản lý và hiển thị sự kiện
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import CreateEvent from './CreateEvent';
import EventDetail from './EventDetail';
import { 
  FiCalendar, 
  FiPlus, 
  FiSearch,
  FiMapPin,
  FiClock,
  FiUsers,
} from 'react-icons/fi';

const Events = () => {
  const { eventId } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('upcoming');

  // Nếu có eventId, hiển thị chi tiết sự kiện
  if (eventId) {
    return <EventDetail eventId={eventId} />;
  }

  // Lấy danh sách sự kiện
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events', {
          params: { type: filter },
        });
        setEvents(response.data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [filter]);

  // Lọc sự kiện theo tìm kiếm
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Định dạng thời gian
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading text="Đang tải sự kiện..." />;
  }

  return (
    <>
      <Helmet>
        <title>Sự kiện - Social Network</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sự kiện
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Khám phá và tham gia các sự kiện
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Tạo sự kiện mới
          </button>
        </div>

        {/* Search và Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sự kiện..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="past">Đã kết thúc</option>
            </select>
          </div>
        </div>

        {/* Danh sách sự kiện */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <FiCalendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Không tìm thấy sự kiện' : 'Chưa có sự kiện nào'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="card hover:shadow-lg transition-all duration-200 group"
              >
                {/* Ảnh sự kiện */}
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                  <img
                    src={event.image || 'https://via.placeholder.com/400x225/1877F2/FFFFFF?text=Event'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {event.isCancelled && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg bg-red-500 px-4 py-2 rounded-lg">
                        Đã hủy
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                    {event.type === 'online' ? 'Trực tuyến' : 'Trực tiếp'}
                  </div>
                </div>

                {/* Thông tin */}
                <div className="mt-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                    {event.description || 'Không có mô tả'}
                  </p>

                  <div className="mt-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <p className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 flex-shrink-0" />
                      <span>{formatDate(event.startTime)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{event.location?.name || 'Chưa xác định'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <FiUsers className="w-4 h-4 flex-shrink-0" />
                      <span>{event.stats?.attendees || 0} người tham gia</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <img
                        src={event.organizer?.id?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                        alt={event.organizer?.id?.fullName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        {event.organizer?.id?.fullName || 'Người tổ chức'}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.isCancelled ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                      new Date(event.startTime) > new Date() ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {event.isCancelled ? 'Đã hủy' :
                       new Date(event.startTime) > new Date() ? 'Sắp diễn ra' :
                       'Đã kết thúc'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Modal tạo sự kiện */}
        {showCreate && (
          <CreateEvent
            onClose={() => setShowCreate(false)}
            onCreated={(newEvent) => {
              setEvents([newEvent, ...events]);
              setShowCreate(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default Events;