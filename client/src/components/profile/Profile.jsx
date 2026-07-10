// ============================================
// FILE: src/components/profile/Profile.jsx
// MÔ TẢ: Trang cá nhân người dùng - ĐỒNG BỘ BÀI VIẾT
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import EditProfileModal from './EditProfileModal';
import PostCard from '../feed/PostCard';
import {
  FiUser,
  FiUsers,
  FiMessageSquare,
  FiSettings,
  FiMapPin,
  FiBriefcase,
  FiBookOpen,
  FiLink,
  FiCalendar,
  FiGrid,
  FiList,
  FiCamera,
  FiEdit2,
  FiUserPlus,
  FiUserMinus,
  FiRefreshCw,
  FiPlay,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestReceived, setFriendRequestReceived] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');
  const [viewMode, setViewMode] = useState('list');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const isOwnProfile = currentUser?._id === profileUser?._id;

  // ============================================
  // LẤY THÔNG TIN NGƯỜI DÙNG
  // ============================================
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      let url;
      if (username) {
        url = `/users/username/${username}`;
      } else if (currentUser?.username) {
        url = `/users/username/${currentUser.username}`;
      } else {
        url = '/users/me';
      }

      const response = await api.get(url);
      const userData = response.user || response.data?.user;
      
      if (!userData) {
        toast.error('Không tìm thấy người dùng');
        setLoading(false);
        return;
      }

      setProfileUser(userData);

      // Kiểm tra quan hệ bạn bè
      if (currentUser && currentUser._id !== userData._id) {
        setIsFriend(userData.friends?.includes(currentUser._id) || false);
        setFriendRequestSent(
          userData.friendRequests?.sent?.includes(currentUser._id) || false
        );
        setFriendRequestReceived(
          userData.friendRequests?.received?.includes(currentUser._id) || false
        );
        setIsFollowing(
          userData.followers?.some((f) => f._id === currentUser._id) || false
        );
      }

      // Lấy bài viết của user
      await fetchUserPosts(userData._id, 1, true);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Không thể tải thông tin người dùng');
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  }, [username, currentUser]);

  // ============================================
  // LẤY BÀI VIẾT CỦA NGƯỜI DÙNG
  // ============================================
  const fetchUserPosts = useCallback(async (userId, page = 1, reset = false) => {
    try {
      setPostsLoading(true);
      console.log(`📖 Fetching posts for user: ${userId}, page: ${page}`);
      
      const response = await api.get(`/posts/user/${userId}`, {
        params: { page, limit: 10 },
      });
      
      console.log('📖 Posts response:', response);
      
      // Xử lý response đúng cách
      const newPosts = response.posts || [];
      
      if (reset) {
        setPosts(newPosts);
        setPostPage(1);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMorePosts(newPosts.length === 10);
      setPostPage(page);
    } catch (error) {
      console.error('❌ Error fetching user posts:', error);
      // Không hiển thị toast để tránh spam
    } finally {
      setPostsLoading(false);
    }
  }, []);

  // ============================================
  // LOAD MORE POSTS
  // ============================================
  const loadMorePosts = () => {
    if (!postsLoading && hasMorePosts && profileUser) {
      fetchUserPosts(profileUser._id, postPage + 1, false);
    }
  };

  // ============================================
  // REFRESH PROFILE
  // ============================================
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUser();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // ============================================
  // CẬP NHẬT/XÓA BÀI VIẾT
  // ============================================
  const handleUpdatePost = (updatedPost) => {
    setPosts(prev =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter((post) => post._id !== postId));
  };

  // ============================================
  // EFFECT: TẢI DỮ LIỆU KHI USER HOẶC USERNAME THAY ĐỔI
  // ============================================
  useEffect(() => {
    if (currentUser) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser, currentUser]);

  // ============================================
  // XỬ LÝ KẾT BẠN
  // ============================================
  const handleSendFriendRequest = async () => {
    if (!profileUser) return;
    try {
      await api.post(`/users/friends/request/${profileUser._id}`);
      setFriendRequestSent(true);
      toast.success('Đã gửi lời mời kết bạn');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Không thể gửi lời mời');
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!profileUser) return;
    try {
      await api.post(`/users/friends/accept/${profileUser._id}`);
      setIsFriend(true);
      setFriendRequestReceived(false);
      toast.success('Đã chấp nhận kết bạn');
      fetchUser();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Không thể chấp nhận lời mời');
    }
  };

  const handleUnfriend = async () => {
    if (!profileUser) return;
    if (!confirm('Bạn có chắc muốn hủy kết bạn?')) return;
    try {
      await api.delete(`/users/friends/${profileUser._id}`);
      setIsFriend(false);
      toast.success('Đã hủy kết bạn');
      fetchUser();
    } catch (error) {
      console.error('Error unfriending:', error);
      toast.error('Không thể hủy kết bạn');
    }
  };

  const handleFollow = async () => {
    if (!profileUser) return;
    try {
      if (isFollowing) {
        await api.delete(`/users/follow/${profileUser._id}`);
        setIsFollowing(false);
        toast.success('Đã bỏ theo dõi');
      } else {
        await api.post(`/users/follow/${profileUser._id}`);
        setIsFollowing(true);
        toast.success('Đã theo dõi');
      }
      fetchUser();
    } catch (error) {
      console.error('Error following:', error);
      toast.error('Không thể thực hiện hành động');
    }
  };

  // Lấy URL media đúng
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return <Loading text="Đang tải thông tin..." />;
  }

  if (!profileUser) {
    return (
      <div className="bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#3E4042] p-8 text-center transition-colors duration-300">
        <FiUser className="w-16 h-16 text-gray-400 dark:text-[#B0B3B8] mx-auto mb-4" />
        <p className="text-gray-600 dark:text-[#B0B3B8]">Không tìm thấy người dùng</p>
        <Link to="/" className="mt-4 inline-block text-[#0866FF] hover:underline">
          Quay lại bảng tin
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profileUser.fullName || 'Profile'} - DRK</title>
      </Helmet>

      <div className="max-w-5xl mx-auto">
        {/* Cover và Avatar */}
        <div className="bg-white dark:bg-[#242526] rounded-xl overflow-hidden border border-gray-200 dark:border-[#3E4042] transition-colors duration-300">
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-[#0866FF] to-[#1877F2]">
            {profileUser.coverPhoto && (
              <img
                src={profileUser.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            {isOwnProfile && (
              <button
                onClick={() => setShowEditProfile(true)}
                className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <FiEdit2 className="w-4 h-4" />
                <span className="hidden sm:inline">Chỉnh sửa trang cá nhân</span>
              </button>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                <div className="relative">
                  <img
                    src={
                      profileUser.avatar ||
                      `https://ui-avatars.com/api/?background=0866FF&color=fff&bold=true&name=${profileUser.fullName || 'User'}`
                    }
                    alt={profileUser.fullName}
                    className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-[#0866FF] object-cover"
                  />
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="absolute bottom-0 right-0 bg-[#0866FF] p-1.5 rounded-full border-2 border-white dark:border-[#242526] hover:bg-[#1877F2] transition-colors"
                    >
                      <FiCamera className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                <div className="flex-1 text-white">
                  <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    {profileUser.fullName}
                    {profileUser.isVerified && (
                      <span className="bg-[#0866FF] text-white text-xs px-2 py-0.5 rounded-full">✓</span>
                    )}
                  </h1>
                  <p className="text-sm opacity-90">@{profileUser.username}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm opacity-80">
                    <span className="flex items-center gap-1">
                      <FiUsers className="w-4 h-4" />
                      {profileUser.friends?.length || 0} bạn bè
                    </span>
                    {profileUser.location?.city && (
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-4 h-4" />
                        {profileUser.location.city}
                      </span>
                    )}
                  </div>
                  {profileUser.bio && (
                    <p className="text-sm mt-1 opacity-80">{profileUser.bio}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isOwnProfile && (
                    <>
                      {!isFriend && !friendRequestSent && !friendRequestReceived && (
                        <button
                          onClick={handleSendFriendRequest}
                          className="bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-sm rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
                        >
                          <FiUserPlus className="w-4 h-4" />
                          Kết bạn
                        </button>
                      )}
                      {friendRequestSent && (
                        <button className="bg-gray-500 dark:bg-[#3A3B3C] text-white font-bold text-sm rounded-lg px-4 py-2 cursor-default flex items-center gap-2">
                          Đã gửi yêu cầu
                        </button>
                      )}
                      {friendRequestReceived && (
                        <button
                          onClick={handleAcceptFriendRequest}
                          className="bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-sm rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
                        >
                          Chấp nhận
                        </button>
                      )}
                      {isFriend && (
                        <button
                          onClick={handleUnfriend}
                          className="bg-gray-200 dark:bg-[#3A3B3C] hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-gray-700 dark:text-white font-bold text-sm rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
                        >
                          <FiUserMinus className="w-4 h-4" />
                          Hủy kết bạn
                        </button>
                      )}
                      <button
                        onClick={handleFollow}
                        className={`font-bold text-sm rounded-lg px-4 py-2 transition-colors flex items-center gap-2 ${
                          isFollowing
                            ? 'bg-gray-200 dark:bg-[#3A3B3C] hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-gray-700 dark:text-white'
                            : 'bg-[#0866FF] hover:bg-[#1877F2] text-white'
                        }`}
                      >
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                      </button>
                      <Link
                        to={`/messages/${profileUser._id}`}
                        className="bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-sm rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
                      >
                        <FiMessageSquare className="w-4 h-4" />
                        Nhắn tin
                      </Link>
                    </>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="bg-gray-200 dark:bg-[#3A3B3C] hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-gray-700 dark:text-white font-bold text-sm rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
                    >
                      <FiSettings className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  )}
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bg-gray-200 dark:bg-[#3A3B3C] hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-gray-700 dark:text-white font-bold text-sm rounded-lg px-4 py-2 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Làm mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mt-4 border-b border-gray-200 dark:border-[#3E4042] transition-colors duration-300">
          <div className="flex gap-1 overflow-x-auto">
            {['timeline', 'about', 'friends', 'photos'].map((tab) => {
              const labels = {
                timeline: 'Bài viết',
                about: 'Giới thiệu',
                friends: `Bạn bè (${profileUser.friends?.length || 0})`,
                photos: 'Ảnh',
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 border-b-2 transition-colors text-sm whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-[#0866FF] text-[#0866FF] font-semibold'
                      : 'border-transparent text-gray-500 dark:text-[#B0B3B8] hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  {labels[tab] || tab}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-[#18191A] rounded-lg p-1 transition-colors duration-300">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#3A3B3C] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-[#B0B3B8] hover:text-gray-700 dark:hover:text-white'
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#3A3B3C] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-[#B0B3B8] hover:text-gray-700 dark:hover:text-white'
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nội dung */}
        <div className="mt-4">
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#3E4042] p-8 text-center transition-colors duration-300">
                  <p className="text-gray-500 dark:text-[#B0B3B8]">
                    {isOwnProfile ? 'Bạn chưa có bài viết nào' : `${profileUser.fullName} chưa có bài viết nào`}
                  </p>
                </div>
              ) : (
                <>
                  <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
                    {posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        currentUser={currentUser}
                        onUpdate={handleUpdatePost}
                        onDelete={handleDeletePost}
                      />
                    ))}
                  </div>
                  {hasMorePosts && (
                    <button
                      onClick={loadMorePosts}
                      disabled={postsLoading}
                      className="w-full py-3 text-[#0866FF] hover:text-[#1877F2] font-medium disabled:opacity-50 transition-colors"
                    >
                      {postsLoading ? 'Đang tải...' : 'Xem thêm bài viết'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#3E4042] p-4 transition-colors duration-300">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Thông tin cá nhân</h3>
              <div className="space-y-3">
                {profileUser.location?.city && (
                  <div className="flex items-center gap-3">
                    <FiMapPin className="w-5 h-5 text-gray-400 dark:text-[#B0B3B8]" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-[#B0B3B8]">Sống tại</p>
                      <p className="text-gray-900 dark:text-white">{profileUser.location.city}</p>
                    </div>
                  </div>
                )}
                {profileUser.birthday && (
                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-5 h-5 text-gray-400 dark:text-[#B0B3B8]" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-[#B0B3B8]">Sinh nhật</p>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(profileUser.birthday).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                )}
                {profileUser.socialLinks?.website && (
                  <div className="flex items-center gap-3">
                    <FiLink className="w-5 h-5 text-gray-400 dark:text-[#B0B3B8]" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-[#B0B3B8]">Website</p>
                      <a
                        href={profileUser.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0866FF] hover:underline"
                      >
                        {profileUser.socialLinks.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#3E4042] p-4 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Bạn bè</h3>
                <Link to="/friends" className="text-sm text-[#0866FF] hover:text-[#1877F2]">
                  Xem tất cả
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {profileUser.friends?.slice(0, 8).map((friend) => (
                  <Link
                    key={friend._id}
                    to={`/profile/${friend.username}`}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition-colors"
                  >
                    <img
                      src={friend.avatar || `https://ui-avatars.com/api/?background=random&bold=true&name=${friend.fullName}`}
                      alt={friend.fullName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#0866FF]"
                    />
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-2 text-center truncate w-full">
                      {friend.fullName}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#3E4042] p-4 transition-colors duration-300">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Ảnh</h3>
              {posts.filter(p => p.media && p.media.length > 0).length === 0 ? (
                <p className="text-gray-500 dark:text-[#B0B3B8] text-center py-8">
                  Chưa có ảnh nào
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {posts
                    .filter(p => p.media && p.media.length > 0)
                    .slice(0, 9)
                    .map((post, index) => {
                      const mediaItem = post.media[0];
                      const isVideo = mediaItem?.type === 'video';
                      const imageUrl = getMediaUrl(mediaItem?.url);
                      
                      return (
                        <div
                          key={index}
                          className="aspect-square bg-gray-200 dark:bg-[#3A3B3C] rounded-lg overflow-hidden relative group cursor-pointer"
                        >
                          <img
                            src={isVideo ? mediaItem?.thumbnail || imageUrl : imageUrl}
                            alt="Photo"
                            className="w-full h-full object-cover"
                          />
                          {isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <FiPlay className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal chỉnh sửa profile */}
      {showEditProfile && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setShowEditProfile(false)}
          onSave={() => {
            setShowEditProfile(false);
            fetchUser();
          }}
        />
      )}
    </>
  );
};

export default Profile;