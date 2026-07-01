// ============================================
// FILE: client/src/components/groups/GroupDetail.jsx
// MÔ TẢ: Chi tiết nhóm
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';
import CreatePost from '../feed/CreatePost';
import PostCard from '../feed/PostCard';
import { 
  FiUsers, 
  FiUserPlus, 
  FiUserMinus, 
  FiSettings,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiImage,
  FiInfo,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const GroupDetail = ({ groupId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [isMember, setIsMember] = useState(false);

  // Lấy thông tin nhóm
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await api.get(`/groups/${groupId}`);
        setGroup(response.data.group);
        setPosts(response.data.group.posts || []);
        setMembers(response.data.group.members || []);
        setIsMember(response.data.group.isMember || false);
      } catch (error) {
        console.error('Error fetching group:', error);
        toast.error('Không thể tải thông tin nhóm');
        navigate('/groups');
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  // Xử lý tham gia nhóm
  const handleJoin = async () => {
    try {
      await api.post(`/groups/${groupId}/join`);
      setIsMember(true);
      toast.success('Đã tham gia nhóm');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Không thể tham gia nhóm');
    }
  };

  // Xử lý rời nhóm
  const handleLeave = async () => {
    if (!confirm('Bạn có chắc muốn rời nhóm này?')) return;

    try {
      await api.post(`/groups/${groupId}/leave`);
      setIsMember(false);
      toast.success('Đã rời nhóm');
      navigate('/groups');
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Không thể rời nhóm');
    }
  };

  if (loading) {
    return <Loading text="Đang tải thông tin nhóm..." />;
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Không tìm thấy nhóm</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover và avatar */}
      <div className="card p-0 overflow-hidden">
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
          {group.coverPhoto && (
            <img
              src={group.coverPhoto}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-end gap-4">
              <img
                src={group.avatar || 'https://ui-avatars.com/api/?background=random&bold=true&size=128'}
                alt={group.name}
                className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800"
              />
              <div className="flex-1 text-white">
                <h1 className="text-2xl font-bold">{group.name}</h1>
                <p className="text-sm opacity-90">{group.stats?.members || 0} thành viên</p>
              </div>
              <div className="flex gap-2">
                {isMember ? (
                  <button
                    onClick={handleLeave}
                    className="btn-secondary bg-white/20 hover:bg-white/30 text-white"
                  >
                    <FiUserMinus className="w-4 h-4 mr-2" />
                    Rời nhóm
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    className="btn-primary"
                  >
                    <FiUserPlus className="w-4 h-4 mr-2" />
                    Tham gia
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-gray-700">
        <button className="px-4 py-2 border-b-2 border-primary-500 text-primary-500 font-medium">
          Bài viết
        </button>
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Thành viên
        </button>
        <button className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          Giới thiệu
        </button>
        <button className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          Sự kiện
        </button>
        {group.admin === user?._id && (
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-auto">
            <FiSettings className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nội dung */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bài viết */}
        <div className="lg:col-span-2">
          {isMember && (
            <CreatePost
              onPostCreated={(newPost) => {
                setPosts([newPost, ...posts]);
              }}
            />
          )}
          <div className="space-y-4 mt-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            {posts.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Chưa có bài viết nào
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Thông tin nhóm */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiInfo className="text-primary-500" />
              Giới thiệu
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {group.description || 'Chưa có mô tả'}
            </p>
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              <p>📅 Tạo ngày: {new Date(group.createdAt).toLocaleDateString('vi-VN')}</p>
              <p>👥 {group.stats?.members || 0} thành viên</p>
              <p>📝 {group.stats?.posts || 0} bài viết</p>
            </div>
          </div>

          {/* Thành viên */}
          {showMembers && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FiUsers className="text-primary-500" />
                Thành viên
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {members.slice(0, 20).map((member) => (
                  <Link
                    key={member.user._id}
                    to={`/profile/${member.user.username}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <img
                      src={member.user.avatar || 'https://ui-avatars.com/api/?background=random&bold=true'}
                      alt={member.user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {member.user.fullName}
                    </span>
                    {member.role === 'admin' && (
                      <span className="text-xs text-primary-500">Admin</span>
                    )}
                    {member.role === 'moderator' && (
                      <span className="text-xs text-green-500">Mod</span>
                    )}
                  </Link>
                ))}
                {members.length > 20 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    và {members.length - 20} thành viên khác
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;