// ============================================
// FILE: src/components/groups/Groups.jsx
// MÔ TẢ: Trang quản lý và hiển thị nhóm - HOÀN CHỈNH
// ============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import CreateGroup from './CreateGroup';
import GroupDetail from './GroupDetail';
import { FiUsers, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Groups = () => {
  const { groupId } = useParams();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // ============================================
  // GỌI HACKS TRƯỚC
  // ============================================
  
  // FETCH GROUPS
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setIsSearching(false);
      console.log('📖 Fetching groups...');
      
      const response = await api.get('/groups');
      console.log('📖 Groups response:', response);
      
      let groupsData = [];
      if (response && response.groups) {
        groupsData = response.groups;
      } else if (response && Array.isArray(response)) {
        groupsData = response;
      } else {
        groupsData = response?.groups || response?.data || [];
      }
      
      console.log('📖 Groups data:', groupsData);
      setGroups(groupsData);
      
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      toast.error('Không thể tải danh sách nhóm');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // TÌM KIẾM NHÓM CÔNG KHAI
  // ============================================
  const searchGroups = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchTerm('');
      fetchGroups();
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      console.log(`🔍 Searching groups: ${query}`);
      
      const response = await api.get('/groups/search', {
        params: { q: query.trim(), page: 1, limit: 20 },
      });
      console.log('🔍 Search response:', response);
      
      let groupsData = [];
      if (response && response.groups) {
        groupsData = response.groups;
      } else if (response && Array.isArray(response)) {
        groupsData = response;
      } else {
        groupsData = response?.groups || response?.data || [];
      }
      
      console.log('🔍 Search results:', groupsData);
      setGroups(groupsData);
      
    } catch (error) {
      console.error('❌ Error searching groups:', error);
      toast.error('Không thể tìm kiếm nhóm');
    } finally {
      setLoading(false);
    }
  }, [fetchGroups]);

  // HANDLE GROUP CREATED
  const handleGroupCreated = (newGroup) => {
    console.log('📝 New group created:', newGroup);
    if (newGroup && newGroup._id) {
      setGroups(prev => [newGroup, ...prev]);
    }
    setShowCreate(false);
    toast.success('Đã tạo nhóm thành công!');
  };

  // EFFECT
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      fetchGroups();
    }
  }, [fetchGroups, searchTerm]);

  useEffect(() => () => {
    clearTimeout(searchTimeoutRef.current);
  }, []);

  // ============================================
  // SAU KHI GỌI HACKS, MỚI XỬ LÝ RETURN
  // ============================================
  
  if (groupId) {
    return <GroupDetail groupId={groupId} />;
  }

  if (loading) {
    return <Loading text="Đang tải nhóm..." />;
  }

  // ============================================
  // XỬ LÝ TÌM KIẾM
  // ============================================
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        searchGroups(value);
      } else {
        fetchGroups();
      }
    }, 500);
  };

  // ============================================
  // LẤY URL ẢNH
  // ============================================
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return `http://localhost:5000${url}`;
  };

  // ============================================
  // RENDER CHÍNH
  // ============================================
  const displayGroups = groups;

  return (
    <>
      <Helmet>
        <title>{searchTerm.trim().length >= 2 ? 'Tìm kiếm nhóm' : 'Nhóm'} - VibeSpace</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {searchTerm.trim().length >= 2 ? 'Tìm kiếm nhóm' : 'Khám phá nhóm'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm.trim().length >= 2 
                ? `Kết quả tìm kiếm cho "${searchTerm}"` 
                : 'Khám phá các nhóm công khai và các nhóm bạn đã tham gia'}
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
            onChange={handleSearchChange}
            placeholder="Tìm kiếm nhóm công khai..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                fetchGroups();
                clearTimeout(searchTimeoutRef.current);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {displayGroups.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm.trim().length >= 2 
                ? `Không tìm thấy nhóm nào cho "${searchTerm}"` 
                : 'Chưa có nhóm công khai hoặc nhóm bạn đã tham gia'}
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
            {displayGroups.map((group) => (
              <Link
                key={group._id}
                to={`/groups/${group._id}`}
                className="card hover:shadow-lg transition-all duration-200 group"
              >
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                  <img
                    src={getImageUrl(group.coverPhoto || group.avatar) || 'https://ui-avatars.com/api/?background=random&bold=true&size=128'}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://ui-avatars.com/api/?background=random&bold=true&size=128';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <img
                      src={getImageUrl(group.avatar) || 'https://ui-avatars.com/api/?background=random&bold=true'}
                      alt={group.name}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800"
                      onError={(e) => {
                        e.target.src = 'https://ui-avatars.com/api/?background=random&bold=true';
                      }}
                    />
                  </div>
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {group.privacy === 'public' ? '🌍 Công khai' : group.privacy === 'private' ? '🔒 Riêng tư' : '🔐 Bí mật'}
                  </div>
                  {!group.isMember && group.privacy === 'public' && (
                    <div className="absolute bottom-2 left-2 bg-blue-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                      Có thể tham gia
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {group.description || 'Nhóm không có mô tả'}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>👥 {group.stats?.members || 0} thành viên</span>
                    <span>📝 {group.stats?.posts || 0} bài viết</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {showCreate && (
          <CreateGroup
            onClose={() => setShowCreate(false)}
            onCreated={handleGroupCreated}
          />
        )}
      </div>
    </>
  );
};

export default Groups;
