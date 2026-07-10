// ============================================
// FILE: src/components/friends/FindFriends.jsx
// MÔ TẢ: Tìm kiếm và kết bạn mới - SỬA LỖI
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import {
  FiSearch,
  FiUserPlus,
  FiUserCheck,
  FiUsers,
  FiFilter,
  FiMapPin,
  FiUser,
  FiX,
  FiMessageSquare, // Icon nhắn tin trong kết quả tìm kiếm
} from 'react-icons/fi';
import { debounce } from '../../utils/helpers';
import toast from 'react-hot-toast';

const FindFriends = () => {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [friendRequestsSent, setFriendRequestsSent] = useState([]);
  const [friendList, setFriendList] = useState([]);

  // Lấy danh sách bạn bè hiện tại
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // API interceptor đã trả về response.data trực tiếp
        const response = await api.get(`/users/${user?._id}/friends`);
        const friends = response.friends || [];
        // Lưu danh sách ID của bạn bè để kiểm tra trạng thái - chuyển sang chuỗi
        setFriendList(friends.map(f => f._id ? f._id.toString() : f.toString()));
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };
    if (user) {
      fetchFriends();
    }
  }, [user]);

  // ============================================
  // Debounce search
  // ============================================
  const debouncedSearch = useCallback(
    debounce(async (query, location, gender, pageNum) => {
      if (!query || query.trim().length < 2) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('q', query.trim());
        params.append('page', pageNum);
        params.append('limit', 20);
        if (location) params.append('location', location);
        if (gender && gender !== 'all') params.append('gender', gender);

        const response = await api.get(`/users/search?${params.toString()}`);
        const data = response || {};
        const users = data.users || [];
        
        if (pageNum === 1) {
          setSearchResults(users);
        } else {
          setSearchResults(prev => [...prev, ...users]);
        }
        
        setTotalPages(data.pagination?.pages || 1);
        setHasMore(data.pagination?.pages > pageNum);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Không thể tìm kiếm người dùng');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // ============================================
  // Effect: Trigger search when filters change
  // ============================================
  useEffect(() => {
    setPage(1);
    if (searchTerm.trim().length >= 2) {
      debouncedSearch(searchTerm, filterLocation, filterGender, 1);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, filterLocation, filterGender, debouncedSearch]);

  // ============================================
  // Load more
  // ============================================
  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      debouncedSearch(searchTerm, filterLocation, filterGender, nextPage);
    }
  };

  // ============================================
  // Xử lý gửi lời mời kết bạn
  // ============================================
  const handleSendFriendRequest = async (userId) => {
    try {
      await api.post(`/users/friends/request/${userId}`);
      setFriendRequestsSent(prev => [...prev, userId]);
      toast.success('Đã gửi lời mời kết bạn');
      // Cập nhật lại kết quả tìm kiếm
      setSearchResults(prev => 
        prev.map(u => 
          u._id === userId ? { ...u, requestSent: true } : u
        )
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi lời mời');
    }
  };

  // ============================================
  // Kiểm tra đã gửi lời mời chưa
  // ============================================
  const isRequestSent = (userId) => {
    return friendRequestsSent.includes(userId) || 
           user?.friendRequests?.sent?.map(id => id.toString())?.includes(userId.toString());
  };

  // ============================================
  // Kiểm tra đã là bạn bè chưa - so sánh chuỗi để tránh lỗi ObjectId vs string
  // ============================================
  const isFriend = (userId) => {
    const userIdStr = userId ? userId.toString() : '';
    // Kiểm tra trong friendList (đã lấy từ API)
    if (friendList.some(id => id && id.toString() === userIdStr)) return true;
    // Kiểm tra trong dữ liệu user hiện tại (có thể là mảng ObjectId)
    if (user?.friends?.some(id => id && id.toString() === userIdStr)) return true;
    // Kiểm tra theo field isFriend từ API search
    return false;
  };

  // ============================================
  // Xóa filter
  // ============================================
  const clearFilters = () => {
    setFilterLocation('');
    setFilterGender('all');
    setShowFilters(false);
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bằng tên, email hoặc username..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#3E4042] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866FF] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B0B3B8]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-colors ${
              showFilters
                ? 'bg-[#0866FF] text-white border-[#0866FF]'
                : 'bg-white dark:bg-[#242526] border-gray-200 dark:border-[#3E4042] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3A3B3C]'
            }`}
          >
            <FiFilter className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 p-4 bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#3E4042] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bộ lọc tìm kiếm</span>
              <button
                onClick={clearFilters}
                className="text-sm text-[#0866FF] hover:text-[#1877F2]"
              >
                Xóa tất cả
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-[#B0B3B8] mb-1">
                  <FiMapPin className="w-4 h-4 inline mr-1" />
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  placeholder="Nhập thành phố..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#18191A] border border-gray-200 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0866FF] text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-[#B0B3B8] mb-1">
                  <FiUser className="w-4 h-4 inline mr-1" />
                  Giới tính
                </label>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#18191A] border border-gray-200 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0866FF] text-gray-900 dark:text-white"
                >
                  <option value="all">Tất cả</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {searchTerm.trim().length < 2 ? (
        <div className="text-center py-12 bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#3E4042]">
          <FiUsers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Tìm kiếm bạn bè
          </h3>
          <p className="text-sm text-gray-500 dark:text-[#B0B3B8] mt-1">
            Nhập ít nhất 2 ký tự để tìm kiếm
          </p>
        </div>
      ) : loading && searchResults.length === 0 ? (
        <Loading text="Đang tìm kiếm..." />
      ) : searchResults.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#3E4042]">
          <FiSearch className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Không tìm thấy kết quả
          </h3>
          <p className="text-sm text-gray-500 dark:text-[#B0B3B8] mt-1">
            Không tìm thấy người dùng nào phù hợp với "{searchTerm}"
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 dark:text-[#B0B3B8]">
              Tìm thấy {searchResults.length} người dùng
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((result) => {
              // Ưu tiên dùng field isFriend từ API (đáng tin cậy nhất),
              // nếu không có thì dùng hàm kiểm tra local
              const isAlreadyFriend = result.isFriend === true || isFriend(result._id);
              const isRequested = result.requestSent === true || isRequestSent(result._id);
              const isCurrentUser = result._id === user?._id;

              return (
                <div
                  key={result._id}
                  className="bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#3E4042] p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <Link to={`/profile/${result.username}`}>
                      <img
                        src={result.avatar || `https://ui-avatars.com/api/?background=random&bold=true&name=${result.fullName}`}
                        alt={result.fullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#0866FF]"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${result.username}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-[#0866FF]"
                      >
                        {result.fullName}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-[#B0B3B8] truncate">
                        @{result.username}
                      </p>
                      {result.location?.city && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                          <FiMapPin className="w-3 h-3" />
                          {result.location.city}
                        </p>
                      )}
                      {result.bio && (
                        <p className="text-xs text-gray-500 dark:text-[#B0B3B8] mt-1 line-clamp-2">
                          {result.bio}
                        </p>
                      )}
                      {result.mutualCount > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {result.mutualCount} bạn chung
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#3E4042] flex gap-2">
                    {isCurrentUser ? (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#3A3B3C] text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium cursor-default flex items-center justify-center gap-2"
                      >
                        <FiUser className="w-4 h-4" />
                        Bạn
                      </button>
                    ) : isAlreadyFriend ? (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium cursor-default flex items-center justify-center gap-2"
                      >
                        <FiUserCheck className="w-4 h-4" />
                        Đã là bạn bè
                      </button>
                    ) : isRequested ? (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#3A3B3C] text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium cursor-default flex items-center justify-center gap-2"
                      >
                        <FiUserPlus className="w-4 h-4" />
                        Đã gửi yêu cầu
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendFriendRequest(result._id)}
                        className="flex-1 px-4 py-2 bg-[#0866FF] hover:bg-[#1877F2] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FiUserPlus className="w-4 h-4" />
                        Kết bạn
                      </button>
                    )}
                    <Link
                      to={`/profile/${result.username}`}
                      className="px-4 py-2 bg-gray-100 dark:bg-[#3A3B3C] hover:bg-gray-200 dark:hover:bg-[#4E4F50] text-gray-700 dark:text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Xem trang
                    </Link>
                    {!isCurrentUser && !isAlreadyFriend && (
                      <Link
                        to={`/messages/${result._id}`}
                        className="px-4 py-2 bg-[#0866FF] hover:bg-[#1877F2] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <FiMessageSquare className="w-4 h-4" />
                        Nhắn
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-gray-100 dark:bg-[#3A3B3C] hover:bg-gray-200 dark:hover:bg-[#4E4F50] text-gray-700 dark:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang tải...' : 'Xem thêm'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindFriends;