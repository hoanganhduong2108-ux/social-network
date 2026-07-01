// ============================================
// FILE: client/src/components/profile/Profile.jsx
// MÔ TẢ: Trang cá nhân người dùng
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import Timeline from './Timeline';
import ProfileSettings from './ProfileSettings';
import {
  FiUser,
  FiUsers,
  FiMessageSquare,
  FiUserPlus,
  FiUserMinus,
  FiSettings,
  FiMapPin,
  FiBriefcase,
  FiBookOpen,
  FiLink,
  FiCalendar,
  FiEdit2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestReceived, setFriendRequestReceived] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');

  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const url = username ? `/users/username/${username}` : '/users/me';
        const response = await api.get(url);
        const userData = response.data.user;
        setProfileUser(userData);
        
        // Kiểm tra quan hệ
        if (currentUser && currentUser._id !== userData._id) {
          setIsFriend(userData.friends?.includes(currentUser._id));
          setFriendRequestSent(userData.friendRequests?.sent?.includes(currentUser._id));
          setFriendRequestReceived(userData.friendRequests?.received?.includes(currentUser._id));
          setIsFollowing(userData.followers?.some(f => f._id === currentUser._id));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username, currentUser]);

  // Xử lý gửi lời mời kết bạn
  const handleSendFriendRequest = async () => {
    try {
      await api.post(`/users/friends/request/${profileUser._id}`);
      setFriendRequestSent(true);
      toast.success('Đã gửi lời mời kết bạn');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Không thể gửi lời mời');
    }
  };

  // Xử lý chấp nhận lời mời kết bạn
  const handleAcceptFriendRequest = async () => {
    try {
      await api.post(`/users/friends/accept/${profileUser._id}`);
      setIsFriend(true);
      setFriendRequestReceived(false);
      toast.success('Đã chấp nhận kết bạn');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Không thể chấp nhận lời mời');
    }
  };

  // Xử lý hủy kết bạn
  const handleUnfriend = async () => {
    if (!confirm('Bạn có chắc muốn hủy kết bạn?')) return;
    try {
      await api.delete(`/users/friends/${profileUser._id}`);
      setIsFriend(false);
      toast.success('Đã hủy kết bạn');
    } catch (error) {
      console.error('Error unfriending:', error);
      toast.error('Không thể hủy kết bạn');
    }
  };

  // Xử lý theo dõi
  const handleFollow = async () => {
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
    } catch (error) {
      console.error('Error following:', error);
      toast.error('Không thể thực hiện hành động');
    }
  };

  const isOwnProfile = currentUser?._id === profileUser?._id;

  if (loading) {
    return <Loading text="Đang tải thông tin..." />;
  }

  if (!profileUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Không tìm thấy người dùng</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profileUser.fullName} - Social Network</title>
      </Helmet>

      <div className="max-w-5xl mx-auto">
        {/* Cover và avatar */}
        <div className="card p-0 overflow-hidden">
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary-500 to-primary-700">
            {profileUser.coverPhoto && (
              <img
                src={profileUser.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                <img
                  src={profileUser.avatar || 'https://ui-avatars.com/api/?background=random&bold=true&size=128'}
                  alt={profileUser.fullName}
                  className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white dark:border-gray-800"
                />
                <div className="flex-1 text-white">
                  <h1 className="text-xl md:text-2xl font-bold">
                    {profileUser.fullName}
                  </h1>
                  <p className="text-sm opacity-90">@{profileUser.username}</p>
                  {profileUser.bio && (
                    <p className="text-sm mt-1 opacity-80">{profileUser.bio}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isOwnProfile && (
                    <>
                      {/* Nút kết bạn */}
                      {!isFriend && !friendRequestSent && !friendRequestReceived && (
                        <button
                          onClick={handleSendFriendRequest}
                          className="btn-primary text-sm"
                        >
                          <FiUserPlus className="w-4 h-4 mr-2" />
                          Kết bạn
                        </button>
                      )}
                      {friendRequestSent && (
                        <button className="btn-secondary text-sm" disabled>
                          Đã gửi yêu cầu
                        </button>
                      )}
                      {friendRequestReceived && (
                        <button
                          onClick={handleAcceptFriendRequest}
                          className="btn-primary text-sm"
                        >
                          Chấp nhận kết bạn
                        </button>
                      )}
                      {isFriend && (
                        <button
                          onClick={handleUnfriend}
                          className="btn-secondary text-sm"
                        >
                          <FiUserMinus className="w-4 h-4 mr-2" />
                          Hủy kết bạn
                        </button>
                      )}
                      
                      {/* Nút theo dõi */}
                      <button
                        onClick={handleFollow}
                        className={`text-sm ${
                          isFollowing ? 'btn-secondary' : 'btn-primary'
                        }`}
                      >
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                      </button>

                      {/* Nút nhắn tin */}
                      <Link
                        to={`/messages/${profileUser._id}`}
                        className="btn-primary text-sm"
                      >
                        <FiMessageSquare className="w-4 h-4 mr-2" />
                        Nhắn tin
                      </Link>
                    </>
                  )}
                  
                  {/* Nút cài đặt */}
                  {isOwnProfile && (
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="btn-secondary text-sm"
                    >
                      <FiSettings className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div>
            <span className="font-bold text-gray-900 dark:text-white">
              {profileUser.friends?.length || 0}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">bạn bè</span>
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white">
              {profileUser.followers?.length || 0}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">người theo dõi</span>
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white">
              {profileUser.following?.length || 0}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">đang theo dõi</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Bài viết
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'about'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Giới thiệu
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'friends'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Bạn bè
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Cài đặt
            </button>
          )}
        </div>

        {/* Nội dung */}
        <div className="mt-4">
          {activeTab === 'timeline' && (
            <Timeline userId={profileUser._id} isOwnProfile={isOwnProfile} />
          )}
          {activeTab === 'about' && (
            <About profileUser={profileUser} />
          )}
          {activeTab === 'friends' && (
            <FriendsList userId={profileUser._id} />
          )}
          {activeTab === 'settings' && isOwnProfile && (
            <ProfileSettings />
          )}
        </div>
      </div>
    </>
  );
};

// Component About
const About = ({ profileUser }) => {
  const items = [
    { icon: FiMapPin, label: 'Sống tại', value: profileUser.location?.city },
    { icon: FiBriefcase, label: 'Công việc', value: profileUser.work?.[0]?.company },
    { icon: FiBookOpen, label: 'Học tại', value: profileUser.education?.[0]?.school },
    { icon: FiCalendar, label: 'Sinh nhật', value: profileUser.birthday },
    { icon: FiLink, label: 'Website', value: profileUser.socialLinks?.website },
  ];

  const validItems = items.filter(item => item.value);

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Giới thiệu
      </h3>
      {validItems.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Chưa có thông tin</p>
      ) : (
        <div className="space-y-3">
          {validItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
                <p className="text-gray-900 dark:text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component FriendsList
const FriendsList = ({ userId }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await api.get(`/users/${userId}/friends`);
        setFriends(response.data.friends || []);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [userId]);

  if (loading) {
    return <Loading text="Đang tải bạn bè..." />;
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Bạn bè ({friends.length})
      </h3>
      {friends.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Chưa có bạn bè</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {friends.map((friend) => (
            <Link
              key={friend._id}
              to={`/profile/${friend.username}`}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <img
                src={friend.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                alt={friend.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-2 text-center">
                {friend.fullName}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;