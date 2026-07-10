// ============================================
// FILE: src/components/events/EventDetail.jsx
// MÔ TẢ: Chi tiết sự kiện
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiShare2,
  FiArrowLeft,
  FiMessageSquare,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data.event);
        setStats(response.data.event.stats || {});

        const attendee = response.data.event.attendees?.find(
          (a) => a.user._id === user?._id
        );
        setUserStatus(attendee?.status || null);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Không thể tải thông tin sự kiện');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, user]);

  const handleRSVP = async (status) => {
    try {
      await api.post(`/events/${eventId}/rsvp`, { status });
      setUserStatus(status);
      setStats((prev) => ({
        ...prev,
        attendees:
          status === 'going'
            ? prev.attendees + 1
            : userStatus === 'going'
            ? prev.attendees - 1
            : prev.attendees,
        interested:
          status === 'interested'
            ? prev.interested + 1
            : userStatus === 'interested'
            ? prev.interested - 1
            : prev.interested,
      }));
      toast.success('Đã cập nhật trạng thái tham gia');
    } catch (error) {
      console.error('Error RSVP:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

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
    return <Loading text="Đang tải thông tin sự kiện..." />;
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Không tìm thấy sự kiện</p>
      </div>
    );
  }

  const isOrganizer = event.organizer?.id?._id === user?._id;
  const isPast = new Date(event.endTime) < new Date();

  return (
    <>
      <Helmet>
        <title>{event.title} - VibeSpace</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <FiArrowLeft className="w-5 h-5" />
          Quay lại sự kiện
        </button>

        <div className="card p-0 overflow-hidden">
          <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
            <img
              src={
                event.image || 'https://via.placeholder.com/1200x400/1877F2/FFFFFF?text=Event'
              }
              alt={event.title}
              className="w-full h-full object-cover"
            />
            {event.isCancelled && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-3xl bg-red-500 px-6 py-3 rounded-xl">
                  ĐÃ HỦY
                </span>
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors">
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {event.title}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      event.isCancelled
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        : isPast
                        ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    }`}
                  >
                    {event.isCancelled ? 'Đã hủy' : isPast ? 'Đã kết thúc' : 'Sắp diễn ra'}
                  </span>
                </div>
              </div>

              {!isPast && !event.isCancelled && !isOrganizer && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRSVP('going')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      userStatus === 'going' ? 'bg-green-500 text-white' : 'btn-primary'
                    }`}
                  >
                    {userStatus === 'going' ? <FiUserCheck /> : <FiUserPlus />}
                    {userStatus === 'going' ? 'Đã đăng ký' : 'Tham gia'}
                  </button>
                  <button
                    onClick={() => handleRSVP('interested')}
                    className={`px-4 py-2 rounded-lg border ${
                      userStatus === 'interested'
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-600'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {userStatus === 'interested' ? 'Đã quan tâm' : 'Quan tâm'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FiCalendar className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Thời gian
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatDate(event.startTime)} - {formatDate(event.endTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Địa điểm
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {event.location?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiUsers className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Tham gia
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {stats.attendees || 0} người tham gia · {stats.interested || 0} quan tâm
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Người tổ chức
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={
                        event.organizer?.id?.avatar ||
                        'https://ui-avatars.com/api/?background=random&bold=true'
                      }
                      alt={event.organizer?.id?.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-gray-600 dark:text-gray-400">
                      {event.organizer?.id?.fullName}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Danh mục
                  </p>
                  <span className="text-gray-600 dark:text-gray-400">
                    {event.category || 'Chung'}
                  </span>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Mô tả
                </h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiUsers className="w-5 h-5" />
                  Người tham gia (
                  {event.attendees.filter((a) => a.status === 'going').length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.attendees
                    .filter((a) => a.status === 'going')
                    .slice(0, 20)
                    .map((attendee) => (
                      <div key={attendee.user._id} className="flex items-center gap-2">
                        <img
                          src={
                            attendee.user.avatar ||
                            'https://ui-avatars.com/api/?background=random&bold=true'
                          }
                          alt={attendee.user.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetail;