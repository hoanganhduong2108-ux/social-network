// ============================================
// FILE: src/components/groups/Groups.jsx
// MÔ TẢ: Trang quản lý và hiển thị nhóm
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import CreateGroup from './CreateGroup';
import GroupDetail from './GroupDetail';
import { FiUsers, FiPlus, FiSearch } from 'react-icons/fi';

const Groups = () => {
  const { groupId } = useParams();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (groupId) {
    return <GroupDetail groupId={groupId} />;
  }

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get('/groups');
        setGroups(response.data.groups || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading text="Đang tải nhóm..." />;
  }

  return (
    <>
      <Helmet>
        <title>Nhóm - VibeSpace</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nhóm của bạn
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Kết nối và chia sẻ với cộng đồng
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Tạo nhóm mới
          </button>
        </div>

        <div className="relative mb-6">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm nhóm..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Không tìm thấy nhóm nào' : 'Bạn chưa tham gia nhóm nào'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 btn-primary"
              >
                Tạo nhóm đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <Link
                key={group._id}
                to={`/groups/${group._id}`}
                className="card hover:shadow-lg transition-all duration-200 group"
              >
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                  <img
                    src={
                      group.coverPhoto ||
                      group.avatar ||
                      'https://via.placeholder.com/400x200'
                    }
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <img
                      src={
                        group.avatar ||
                        'https://ui-avatars.com/api/?background=random&bold=true'
                      }
                      alt={group.name}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {group.description || 'Nhóm không có mô tả'}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{group.stats?.members || 0} thành viên</span>
                    <span>{group.stats?.posts || 0} bài viết</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {showCreate && (
          <CreateGroup
            onClose={() => setShowCreate(false)}
            onCreated={(newGroup) => {
              setGroups([newGroup, ...groups]);
              setShowCreate(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default Groups;