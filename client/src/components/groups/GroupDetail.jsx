// ============================================
// FILE: src/components/groups/GroupDetail.jsx
// MÔ TẢ: Chi tiết nhóm - HOÀN CHỈNH
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';
import CreatePost from '../feed/CreatePost';
import PostCard from '../feed/PostCard';
import EditGroupModal from './EditGroupModal';
import MemberManagement from './MemberManagement';
import {
  FiUsers,
  FiUserPlus,
  FiUserMinus,
  FiSettings,
  FiInfo,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiClock,
  FiPlus,
  FiShield,
  FiUserCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const GroupDetail = ({ groupId: propGroupId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMemberManagement, setShowMemberManagement] = useState(false);

  const groupId = propGroupId;

  // ============================================
  // LẤY URL ẢNH ĐÚNG
  // ============================================
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return `http://localhost:5000${url}`;
  };

  // ============================================
  // KIỂM TRA USER CÓ TRONG NHÓM KHÔNG
  // ============================================
  const checkIsMember = (groupData) => {
    if (!groupData || !user) return false;
    
    if (groupData.members && Array.isArray(groupData.members)) {
      const found = groupData.members.some(m => {
        const memberId = m.user?._id?.toString() || m.user?.toString() || m._id?.toString();
        return memberId === user._id?.toString();
      });
      if (found) return true;
    }
    
    if (groupData.admins && Array.isArray(groupData.admins)) {
      const found = groupData.admins.some(id => id?.toString() === user._id?.toString());
      if (found) return true;
    }
    
    if (groupData.admin) {
      const adminId = groupData.admin._id?.toString() || groupData.admin?.toString();
      if (adminId === user._id?.toString()) return true;
    }
    
    return false;
  };

  // ============================================
  // FETCH GROUP POSTS
  // ============================================
  const fetchGroupPosts = useCallback(async (groupId, page = 1) => {
    try {
      console.log(`📖 Fetching posts for group: ${groupId}`);
      const response = await api.get(`/posts/group/${groupId}`, {
        params: { page, limit: 10 },
      });
      console.log('📖 Group posts response:', response);
      setPosts(response.posts || []);
    } catch (error) {
      console.error('❌ Error fetching group posts:', error);
      setPosts([]);
    }
  }, []);

  // ============================================
  // FETCH PENDING POSTS
  // ============================================
  const fetchPendingPosts = useCallback(async (groupId) => {
    if (!isAdmin) return;
    
    try {
      console.log('📖 Fetching pending posts for group:', groupId);
      const response = await api.get(`/groups/${groupId}/pending-posts`);
      setPendingPosts(response.posts || []);
    } catch (error) {
      console.error('❌ Error fetching pending posts:', error);
      if (error.response?.status === 403) {
        console.log('⛔ Không có quyền xem bài viết chờ duyệt');
      }
      setPendingPosts([]);
    }
  }, [isAdmin]);

  // ============================================
  // FETCH GROUP
  // ============================================
  const fetchGroup = useCallback(async () => {
    if (!groupId) {
      setError('Không tìm thấy ID nhóm');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📖 Fetching group:', groupId);
      
      const response = await api.get(`/groups/${groupId}`);
      console.log('📖 Group response:', response);
      
      let groupData = null;
      
      if (response && response.group) {
        groupData = response.group;
      } else if (response && response.data && response.data.group) {
        groupData = response.data.group;
      } else if (response && response.success && response.data) {
        groupData = response.data;
      } else if (response && response._id) {
        groupData = response;
      } else {
        for (const key of Object.keys(response || {})) {
          if (response[key] && response[key]._id) {
            groupData = response[key];
            break;
          }
        }
      }
      
      console.log('📖 Group data:', groupData);
      
      if (!groupData || !groupData._id) {
        console.error('❌ Invalid group data:', groupData);
        setError('Không tìm thấy nhóm');
        setLoading(false);
        return;
      }
      
      setGroup(groupData);
      
      const memberStatus = checkIsMember(groupData);
      console.log('📖 Is member:', memberStatus);
      
      setIsMember(memberStatus);
      setIsAdmin(groupData.isAdmin || false);
      
      // Xác định role của user trong nhóm
      if (groupData.members && Array.isArray(groupData.members)) {
        const member = groupData.members.find(m => {
          const memberId = m.user?._id?.toString() || m.user?.toString() || m._id?.toString();
          return memberId === user?._id?.toString();
        });
        if (member) {
          setUserRole(member.role || 'member');
          console.log('📖 User role:', member.role);
        }
      }
      
      // Lấy bài viết nhóm
      await fetchGroupPosts(groupId);
      
      // Nếu là admin, lấy bài viết chờ duyệt
      if (groupData.isAdmin || groupData.admin?._id?.toString() === user?._id?.toString()) {
        await fetchPendingPosts(groupId);
      }
      
    } catch (error) {
      console.error('❌ Error fetching group:', error);
      setError(error.message || 'Không thể tải thông tin nhóm');
      toast.error('Không thể tải thông tin nhóm');
      
      if (error.response?.status === 404) {
        navigate('/groups');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId, navigate, user, fetchGroupPosts, fetchPendingPosts]);

  // ============================================
  // HANDLE REFRESH
  // ============================================
  const handleRefresh = () => {
    setRefreshing(true);
    fetchGroup();
  };

  // ============================================
  // THAM GIA NHÓM
  // ============================================
  const handleJoin = async () => {
    if (isMember) {
      toast.info('Bạn đã tham gia nhóm này');
      return;
    }

    try {
      console.log('👋 Joining group:', groupId);
      
      const response = await api.post(`/groups/${groupId}/join`);
      console.log('✅ Join response:', response);
      
      if (response.status === 'pending') {
        toast.success('Yêu cầu tham gia nhóm đã được gửi! Vui lòng chờ admin duyệt.');
      } else {
        setIsMember(true);
        toast.success('Đã tham gia nhóm thành công!');
      }
      
      await fetchGroup();
      
    } catch (error) {
      console.error('❌ Error joining group:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      if (errorMessage.includes('đã tham gia')) {
        toast.info('Bạn đã tham gia nhóm này');
        setIsMember(true);
        await fetchGroup();
      } else if (errorMessage.includes('đã gửi yêu cầu')) {
        toast.info('Bạn đã gửi yêu cầu tham gia nhóm này');
      } else {
        toast.error(errorMessage || 'Không thể tham gia nhóm');
      }
    }
  };

  // ============================================
  // RỜI NHÓM
  // ============================================
  const handleLeave = async () => {
    if (!confirm('Bạn có chắc muốn rời nhóm này?')) return;

    try {
      await api.post(`/groups/${groupId}/leave`);
      setIsMember(false);
      setIsAdmin(false);
      setUserRole(null);
      toast.success('Đã rời nhóm');
      navigate('/groups');
    } catch (error) {
      console.error('❌ Error leaving group:', error);
      toast.error(error.response?.data?.message || 'Không thể rời nhóm');
    }
  };

  // ============================================
  // DUYỆT BÀI VIẾT
  // ============================================
  const handleApprovePost = async (postId) => {
    try {
      await api.put(`/groups/${groupId}/posts/${postId}/approve`);
      setPendingPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Đã duyệt bài viết');
      fetchGroup();
    } catch (error) {
      console.error('Error approving post:', error);
      toast.error('Không thể duyệt bài viết');
    }
  };

  const handleRejectPost = async (postId) => {
    try {
      await api.put(`/groups/${groupId}/posts/${postId}/reject`);
      setPendingPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Đã từ chối bài viết');
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast.error('Không thể từ chối bài viết');
    }
  };

  // ============================================
  // HANDLE NEW POST
  // ============================================
  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  // ============================================
  // EFFECT
  // ============================================
  useEffect(() => {
    if (groupId && user) {
      fetchGroup();
    }
  }, [groupId, fetchGroup, user]);

  // ============================================
  // RENDER LOADING
  // ============================================
  if (loading) {
    return <Loading text="Đang tải thông tin nhóm..." />;
  }

  // ============================================
  // RENDER ERROR
  // ============================================
  if (error || !group) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-gray-500 dark:text-gray-400">
          {error || 'Không tìm thấy nhóm'}
        </p>
        <button
          onClick={() => navigate('/groups')}
          className="mt-4 btn-primary"
        >
          Quay lại danh sách nhóm
        </button>
      </div>
    );
  }

  // ============================================
  // RENDER CHÍNH
  // ============================================
  const isGroupAdmin = group.admin?._id?.toString() === user?._id?.toString() || 
                       group.admin?.toString() === user?._id?.toString() ||
                       group.admins?.some(id => id?.toString() === user?._id?.toString()) ||
                       isAdmin;
  
  const canManageMembers = isGroupAdmin || userRole === 'admin' || userRole === 'vice_admin';
  
  console.log('📊 Render state:', {
    isMember,
    isAdmin,
    isGroupAdmin,
    userRole,
    canManageMembers,
    postsCount: posts.length
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header với Cover và Avatar */}
      <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#3E4042] overflow-hidden">
        <div className="relative h-48 bg-gray-200 dark:bg-[#3A3B3C]">
          {group.coverPhoto && (
            <img
              src={getImageUrl(group.coverPhoto)}
              alt={group.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-end gap-4">
              <img
                src={getImageUrl(group.avatar) || 'https://ui-avatars.com/api/?background=random&bold=true&size=128'}
                alt={group.name}
                className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                onError={(e) => {
                  e.target.src = 'https://ui-avatars.com/api/?background=random&bold=true&size=128';
                }}
              />
              <div className="flex-1 text-white">
                <h1 className="text-2xl font-bold">{group.name}</h1>
                <p className="text-sm opacity-90">
                  {group.stats?.members || 0} thành viên
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {isMember ? (
                  <button
                    onClick={handleLeave}
                    className="btn-secondary bg-white/20 hover:bg-white/30 text-white"
                  >
                    <FiUserMinus className="w-4 h-4 mr-2" />
                    Rời nhóm
                  </button>
                ) : (
                  <button onClick={handleJoin} className="btn-primary">
                    <FiUserPlus className="w-4 h-4 mr-2" />
                    Tham gia
                  </button>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="btn-secondary bg-white/20 hover:bg-white/30 text-white disabled:opacity-50"
                >
                  <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                {isGroupAdmin && (
                  <>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="btn-secondary bg-white/20 hover:bg-white/30 text-white flex items-center gap-1"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Sửa nhóm
                    </button>
                    <button
                      onClick={() => setShowMemberManagement(true)}
                      className="btn-secondary bg-white/20 hover:bg-white/30 text-white flex items-center gap-1"
                    >
                      <FiShield className="w-4 h-4" />
                      Quản lý thành viên
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 mt-4 border-b border-gray-200 dark:border-[#3E4042]">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'posts'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FiPlus className="w-4 h-4 inline mr-1" />
          Bài viết
        </button>
        
        {isGroupAdmin && (
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-yellow-500 text-yellow-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <FiClock className="w-4 h-4" />
            Duyệt bài viết
            {pendingPosts.length > 0 && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingPosts.length}
              </span>
            )}
          </button>
        )}
        
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'members'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FiUsers className="w-4 h-4 inline mr-1" />
          Thành viên ({group.members?.length || 0})
        </button>
        
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'about'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FiInfo className="w-4 h-4 inline mr-1" />
          Giới thiệu
        </button>
      </div>

      {/* TAB NỘI DUNG */}
      <div className="mt-4">
        {/* TAB 1: BÀI VIẾT */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {isMember ? (
                <div className="mb-4">
                  <CreatePost 
                    onPostCreated={handleNewPost}
                    groupId={groupId}
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
                    Bài viết của bạn sẽ hiển thị trong nhóm
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#3E4042] p-8 text-center">
                  <FiUserPlus className="w-12 h-12 mx-auto mb-3 text-[#0866FF]" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                    Tham gia nhóm để đăng bài viết
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Chỉ thành viên mới có thể đăng bài trong nhóm
                  </p>
                  <button
                    onClick={handleJoin}
                    className="mt-4 btn-primary"
                  >
                    Tham gia ngay
                  </button>
                </div>
              )}
              
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#3E4042] p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {isMember ? 'Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!' : 'Tham gia nhóm để xem bài viết'}
                    </p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#3E4042] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiInfo className="text-blue-500" />
                    Giới thiệu
                  </h3>
                  {isGroupAdmin && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="text-sm text-[#0866FF] hover:text-[#1877F2] flex items-center gap-1"
                    >
                      <FiEdit2 className="w-3 h-3" />
                      Sửa
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {group.description || 'Chưa có mô tả'}
                </p>
                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <p>📅 Tạo ngày: {new Date(group.createdAt).toLocaleDateString('vi-VN')}</p>
                  <p>👥 {group.stats?.members || 0} thành viên</p>
                  <p>📝 {group.stats?.posts || 0} bài viết</p>
                  <p>🔒 {group.privacy === 'public' ? 'Công khai' : group.privacy === 'private' ? 'Riêng tư' : 'Bí mật'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DUYỆT BÀI VIẾT */}
        {activeTab === 'pending' && isGroupAdmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiClock className="text-yellow-500" />
                Bài viết chờ duyệt ({pendingPosts.length})
              </h3>
              <button
                onClick={() => fetchPendingPosts(groupId)}
                className="text-sm text-[#0866FF] hover:text-[#1877F2]"
              >
                <FiRefreshCw className="w-4 h-4 inline" />
                Làm mới
              </button>
            </div>
            
            {pendingPosts.length === 0 ? (
              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#3E4042] p-8 text-center">
                <FiCheck className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Không có bài viết chờ duyệt</p>
              </div>
            ) : (
              pendingPosts.map((post) => (
                <div key={post._id} className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#3E4042] p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={post.author?.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                      alt={post.author?.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {post.author?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                  {post.media && post.media.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {post.media.slice(0, 2).map((item, index) => (
                        <img
                          key={index}
                          src={getImageUrl(item.url)}
                          alt="Post media"
                          className="rounded-lg w-full h-32 object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleApprovePost(post._id)}
                      className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <FiCheck className="w-4 h-4" />
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleRejectPost(post._id)}
                      className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <FiX className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: THÀNH VIÊN */}
        {activeTab === 'members' && (
          <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#3E4042] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiUsers className="text-blue-500" />
                Danh sách thành viên ({group.members?.length || 0})
              </h3>
              {canManageMembers && (
                <button
                  onClick={() => setShowMemberManagement(true)}
                  className="text-sm text-[#0866FF] hover:text-[#1877F2] flex items-center gap-1"
                >
                  <FiShield className="w-3 h-3" />
                  Quản lý
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {group.members?.map((member) => {
                const memberId = member.user?._id || member.user || member._id;
                const isOwner = group.admin?._id?.toString() === memberId?.toString() || 
                               group.admin?.toString() === memberId?.toString();
                const isViceAdmin = member.role === 'vice_admin';
                const isModerator = member.role === 'moderator';
                const isCurrentUser = memberId?.toString() === user?._id?.toString();
                
                return (
                  <div
                    key={memberId?.toString() || Math.random()}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800' : 'hover:bg-gray-100 dark:hover:bg-[#3A3B3C]'
                    }`}
                  >
                    <Link to={`/profile/${member.user?.username || member.username}`}>
                      <img
                        src={getImageUrl(member.user?.avatar) || 'https://ui-avatars.com/api/?background=random&bold=true'}
                        alt={member.user?.fullName || member.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?background=random&bold=true';
                        }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${member.user?.username || member.username}`}>
                        <p className={`text-sm font-medium truncate ${
                          isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        } hover:text-[#0866FF]`}>
                          {member.user?.fullName || member.fullName || 'Người dùng'}
                          {isCurrentUser && ' (Bạn)'}
                        </p>
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        @{member.user?.username || member.username}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {isOwner && (
                        <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                          👑 Trưởng nhóm
                        </span>
                      )}
                      {isViceAdmin && (
                        <span className="text-xs bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
                          Phó nhóm
                        </span>
                      )}
                      {isModerator && (
                        <span className="text-xs bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                          Điều hành
                        </span>
                      )}
                      {!isOwner && !isViceAdmin && !isModerator && (
                        <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                          Thành viên
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {(!group.members || group.members.length === 0) && (
                <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-4">
                  Chưa có thành viên
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: GIỚI THIỆU */}
        {activeTab === 'about' && (
          <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#3E4042] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Thông tin nhóm</h3>
              {isGroupAdmin && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-sm text-[#0866FF] hover:text-[#1877F2] flex items-center gap-1"
                >
                  <FiEdit2 className="w-3 h-3" />
                  Sửa thông tin
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tên nhóm</p>
                <p className="text-gray-900 dark:text-white font-medium">{group.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mô tả</p>
                <p className="text-gray-900 dark:text-white">{group.description || 'Chưa có mô tả'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Danh mục</p>
                <p className="text-gray-900 dark:text-white">{group.category || 'Chung'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quyền riêng tư</p>
                <p className="text-gray-900 dark:text-white">
                  {group.privacy === 'public' && '🌍 Công khai - Ai cũng có thể tham gia'}
                  {group.privacy === 'private' && '🔒 Riêng tư - Phải được phê duyệt'}
                  {group.privacy === 'secret' && '🔐 Bí mật - Chỉ thành viên mới thấy'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(group.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Thống kê</p>
                <p className="text-gray-900 dark:text-white">
                  👥 {group.stats?.members || 0} thành viên · 
                  📝 {group.stats?.posts || 0} bài viết · 
                  💬 {group.stats?.comments || 0} bình luận
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Người tạo</p>
                <p className="text-gray-900 dark:text-white">
                  {group.admin?.fullName || 'Người dùng'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CHỈNH SỬA NHÓM */}
      {showEditModal && (
        <EditGroupModal
          group={group}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            fetchGroup();
          }}
        />
      )}

      {/* MODAL QUẢN LÝ THÀNH VIÊN */}
      {showMemberManagement && (
        <MemberManagement
          group={group}
          onClose={() => setShowMemberManagement(false)}
          onUpdate={() => {
            setShowMemberManagement(false);
            fetchGroup();
          }}
        />
      )}
    </div>
  );
};

export default GroupDetail;