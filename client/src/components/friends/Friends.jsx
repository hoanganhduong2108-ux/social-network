// ============================================
// FILE: src/components/friends/Friends.jsx
// MÔ TẢ: Trang bạn bè - HOÀN CHỈNH
// NGƯỜI PHỤ TRÁCH: Nkn
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import FindFriends from './FindFriends';
import {
  FiSearch,
  FiUserPlus,
  FiUserCheck,
  FiUsers,
  FiFilter,
  FiMapPin,
  FiCalendar,
  FiRefreshCw,
  FiX,
  FiCheck,
  FiUser,
  FiClock,
  FiMessageSquare,
  FiMessageCircle, // Icon nhắn tin cho danh sách bạn bè
  FiMoreHorizontal,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Friends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterBirthday, setFilterBirthday] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, recent, mutual

  // ============================================
  // LẤY DỮ LIỆU BẠN BÈ
  // ============================================
  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách bạn bè
      // API interceptor đã trả về response.data trực tiếp
      const friendsRes = await api.get(`/users/${user?._id}/friends`);
      setFriends(friendsRes.friends || []);

      // Lấy lời mời kết bạn
      const requestsRes = await api.get('/users/friend-requests');
      setFriendRequests(requestsRes.requests || []);

      // Lấy gợi ý kết bạn
      const suggestionsRes = await api.get('/users/suggestions/friends');
      setSuggestions(suggestionsRes.suggestions || []);
    } catch (error) {
      console.error('Error fetching friends data:', error);
      toast.error('Không thể tải dữ liệu bạn bè');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // ============================================
  // LỌC BẠN BÈ
  // ============================================
  const filteredFriends = friends
    .filter((f) => {
      if (!f) return false;
      const matchName = f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        f.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchLocation = filterLocation ? 
        f.location?.city?.toLowerCase().includes(filterLocation.toLowerCase()) : true;
      const matchBirthday = filterBirthday ? 
        f.birthday?.includes(filterBirthday) : true;
      return matchName && matchLocation && matchBirthday;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.fullName?.localeCompare(b.fullName);
      } else if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'mutual') {
        // Sắp xếp theo số bạn chung (giả định)
        return (b.mutualFriends || 0) - (a.mutualFriends || 0);
      }
      return 0;
    });

  // ============================================
  // CHẤP NHẬN LỜI MỜI KẾT BẠN
  // ============================================
  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post(`/users/friends/accept/${requestId}`);
      toast.success('Đã chấp nhận kết bạn');
      await fetchData();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(error.response?.data?.message || 'Không thể chấp nhận lời mời');
    }
  };

  // ============================================
  // TỪ CHỐI LỜI MỜI KẾT BẠN
  // ============================================
  const handleRejectRequest = async (requestId) => {
    try {
      await api.post(`/users/friends/reject/${requestId}`);
      toast.success('Đã từ chối lời mời');
      await fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Không thể từ chối lời mời');
    }
  };

  // ============================================
  // GỬI LỜI MỜI KẾT BẠN TỪ GỢI Ý
  // ============================================
  const handleSendRequest = async (userId) => {
    try {
      await api.post(`/users/friends/request/${userId}`);
      toast.success('Đã gửi lời mời kết bạn');
      await fetchData();
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi lời mời');
    }
  };

  // ============================================
  // HUỶ KẾT BẠN
  // ============================================
  const handleUnfriend = async (friendId) => {
    if (!confirm('Bạn có chắc muốn huỷ kết bạn với người này?')) return;
    
    try {
      await api.delete(`/users/friends/${friendId}`);
      toast.success('Đã huỷ kết bạn');
      await fetchData();
    } catch (error) {
      console.error('Error unfriending:', error);
      toast.error(error.response?.data?.message || 'Không thể huỷ kết bạn');
    }
  };

  // ============================================
  // REFRESH
  // ============================================
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ============================================
  // RENDER DANH SÁCH BẠN BÈ
  // ============================================
  const renderFriendItem = (friend) => {
    if (!friend) return null;
    
    return (
      <div
        key={friend._id}
        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition-colors"
      >
        <Link to={`/profile/${friend._id}`} className="flex items-center flex-1 min-w-0">
          <img
            src={friend.avatar || friend.profile?.avatar || `https://ui-avatars.com/api/?background=random&bold=true&name=${friend.fullName}`}
            alt={friend.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="ml-3 flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {friend.fullName}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#B0B3B8]">
              <span>@{friend.username}</span>
              {friend.mutualFriends > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                  <span>{friend.mutualFriends} bạn chung</span>
                </>
              )}
            </div>
          </div>
        </Link>
        
        <div className="flex items-center gap-2 ml-2">
          <Link
            to={`/messages/${friend._id}`}
            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 hover:text-blue-600 transition-colors"
            title="Nhắn tin"
          >
            <FiMessageCircle className="w-5 h-5" />
          </Link>
          <button
            onClick={() => handleUnfriend(friend._id)}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 transition-colors"
            title="Huỷ kết bạn"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER LỜI MỜI KẾT BẠN
  // ============================================
  const renderRequestItem = (request) => {
    if (!request) return null;
    
    return (
      <div
        key={request._id}
        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition-colors"
      >
        <div className="flex items-center flex-1 min-w-0">
          <img
            src={request.sender?.avatar || request.sender?.profile?.avatar || `https://ui-avatars.com/api/?background=random&bold=true&name=${request.sender?.fullName}`}
            alt={request.sender?.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="ml-3 flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {request.sender?.fullName}
            </p>
            <p className="text-sm text-gray-500 dark:text-[#B0B3B8]">
              @{request.sender?.username}
            </p>
            <p className="text-xs text-gray-400 dark:text-[#8A8D91] flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              Gửi {new Date(request.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={() => handleAcceptRequest(request._id)}
            className="p-2 bg-[#0866FF] hover:bg-[#0854D6] text-white rounded-lg transition-colors"
            title="Chấp nhận"
          >
            <FiCheck className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleRejectRequest(request._id)}
            className="p-2 bg-gray-200 dark:bg-[#3A3B3C] hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-gray-600 dark:text-[#B0B3B8] rounded-lg transition-colors"
            title="Từ chối"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER GỢI Ý KẾT BẠN
  // ============================================
  const renderSuggestionItem = (suggestion) => {
    if (!suggestion) return null;
    
    return (
      <div
        key={suggestion._id}
        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition-colors"
      >
        <Link to={`/profile/${suggestion._id}`} className="flex items-center flex-1 min-w-0">
          <img
            src={suggestion.avatar || suggestion.profile?.avatar || `https://ui-avatars.com/api/?background=random&bold=true&name=${suggestion.fullName}`}
            alt={suggestion.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="ml-3 flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {suggestion.fullName}
            </p>
            <p className="text-sm text-gray-500 dark:text-[#B0B3B8]">
              @{suggestion.username}
            </p>
            {suggestion.mutualFriends > 0 && (
              <p className="text-xs text-gray-400 dark:text-[#8A8D91]">
                {suggestion.mutualFriends} bạn chung
              </p>
            )}
          </div>
        </Link>
        
        <button
          onClick={() => handleSendRequest(suggestion._id)}
          className="ml-2 px-4 py-2 bg-[#0866FF] hover:bg-[#0854D6] text-white rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          <FiUserPlus className="w-4 h-4 inline mr-1" />
          Kết bạn
        </button>
      </div>
    );
  };

  // ============================================
  // RENDER NỘI DUNG TAB
  // ============================================
  const renderContent = () => {
    switch (activeTab) {
      case 'all':
        return (
          <>
            {/* Sort options */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-500 dark:text-[#B0B3B8]">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 bg-gray-100 dark:bg-[#3A3B3C] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] text-gray-900 dark:text-white"
              >
                <option value="name">Tên</option>
                <option value="recent">Mới nhất</option>
                <option value="mutual">Bạn chung</option>
              </select>
            </div>

            {/* Friend list */}
            {filteredFriends.length === 0 ? (
              <div className="text-center py-12">
                <FiUsers className="w-16 h-16 mx-auto text-gray-300 dark:text-[#3E4042] mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-[#E4E6EB]">
                  {searchTerm ? 'Không tìm thấy bạn bè' : 'Chưa có bạn bè'}
                </h3>
                <p className="text-gray-500 dark:text-[#B0B3B8] mt-1">
                  {searchTerm 
                    ? 'Thử tìm kiếm với từ khóa khác' 
                    : 'Kết bạn để bắt đầu kết nối'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFriends.map(renderFriendItem)}
              </div>
            )}
          </>
        );

      case 'requests':
        return (
          <div className="space-y-1">
            {friendRequests.length === 0 ? (
              <div className="text-center py-12">
                <FiUserPlus className="w-16 h-16 mx-auto text-gray-300 dark:text-[#3E4042] mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-[#E4E6EB]">
                  Không có lời mời kết bạn
                </h3>
                <p className="text-gray-500 dark:text-[#B0B3B8] mt-1">
                  Bạn đã xem hết tất cả lời mời
                </p>
              </div>
            ) : (
              friendRequests.map(renderRequestItem)
            )}
          </div>
        );

      case 'suggestions':
        return (
          <div className="space-y-1">
            {suggestions.length === 0 ? (
              <div className="text-center py-12">
                <FiUserCheck className="w-16 h-16 mx-auto text-gray-300 dark:text-[#3E4042] mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-[#E4E6EB]">
                  Không có gợi ý nào
                </h3>
                <p className="text-gray-500 dark:text-[#B0B3B8] mt-1">
                  Bạn đã kết bạn với tất cả gợi ý
                </p>
              </div>
            ) : (
              suggestions.map(renderSuggestionItem)
            )}
          </div>
        );

      case 'find':
        return <FindFriends onFriendAdded={fetchData} />;

      default:
        return null;
    }
  };

  // ============================================
  // RENDER COMPONENT CHÍNH
  // ============================================
  if (loading) {
    return <Loading text="Đang tải bạn bè..." />;
  }

  return (
    <>
      <Helmet>
        <title>Bạn bè - Social Network</title>
        <meta name="description" content="Quản lý bạn bè trên mạng xã hội" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiUsers className="w-6 h-6 text-[#0866FF]" />
              Bạn bè
            </h1>
            <p className="text-sm text-gray-500 dark:text-[#B0B3B8] mt-1">
              {friends.length} bạn bè
              {friendRequests.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {friendRequests.length} lời mời
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors text-gray-600 dark:text-[#B0B3B8] disabled:opacity-50"
              title="Làm mới"
            >
              <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors text-gray-600 dark:text-[#B0B3B8] ${
                (filterLocation || filterBirthday) ? 'text-[#0866FF]' : ''
              }`}
              title="Bộ lọc"
            >
              <FiFilter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-[#3E4042] overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-[#0866FF] text-[#0866FF] font-semibold'
                : 'border-transparent text-gray-500 dark:text-[#B0B3B8] hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Tất cả ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'requests'
                ? 'border-[#0866FF] text-[#0866FF] font-semibold'
                : 'border-transparent text-gray-500 dark:text-[#B0B3B8] hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Lời mời
            {friendRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'suggestions'
                ? 'border-[#0866FF] text-[#0866FF] font-semibold'
                : 'border-transparent text-gray-500 dark:text-[#B0B3B8] hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Gợi ý
          </button>
          <button
            onClick={() => setActiveTab('find')}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'find'
                ? 'border-[#0866FF] text-[#0866FF] font-semibold'
                : 'border-transparent text-gray-500 dark:text-[#B0B3B8] hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Tìm bạn
          </button>
        </div>

        {/* Search và Filters */}
        {activeTab !== 'find' && (
          <div className="mb-4 space-y-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm bạn bè..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#3A3B3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0866FF] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#B0B3B8]"
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-[#242526] rounded-lg border border-gray-200 dark:border-[#3E4042]">
                {/* Filter: Location */}
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    placeholder="Lọc theo địa điểm..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#3A3B3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0866FF] text-gray-900 dark:text-white"
                  />
                </div>

                {/* Filter: Birthday */}
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filterBirthday}
                    onChange={(e) => setFilterBirthday(e.target.value)}
                    placeholder="Lọc theo ngày sinh (DD/MM)..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#3A3B3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0866FF] text-gray-900 dark:text-white"
                  />
                </div>

                {/* Clear filters */}
                {(filterLocation || filterBirthday) && (
                  <button
                    onClick={() => {
                      setFilterLocation('');
                      setFilterBirthday('');
                    }}
                    className="md:col-span-2 text-sm text-[#0866FF] hover:text-[#0854D6] font-medium"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-[#242526] rounded-lg shadow-sm border border-gray-200 dark:border-[#3E4042] overflow-hidden">
          <div className="p-4">
            {renderContent()}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-[#B0B3B8]">
          {activeTab === 'all' && (
            <p>
              Hiển thị {filteredFriends.length} / {friends.length} bạn bè
              {searchTerm && ` - Tìm kiếm: "${searchTerm}"`}
            </p>
          )}
          {activeTab === 'requests' && (
            <p>
              {friendRequests.length} lời mời kết bạn đang chờ
            </p>
          )}
          {activeTab === 'suggestions' && (
            <p>
              {suggestions.length} gợi ý kết bạn
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Friends;