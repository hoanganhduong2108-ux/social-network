// ============================================
// FILE: src/components/groups/MemberManagement.jsx
// MÔ TẢ: Modal quản lý thành viên nhóm - PHÂN QUYỀN
// ============================================

import React, { useState } from 'react';
import { api } from '../../services/api';
import { FiX, FiShield, FiUserCheck, FiUserMinus, FiUserX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MemberManagement = ({ group, onClose, onUpdate }) => {
  const [members, setMembers] = useState(group?.members || []);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return `http://localhost:5000${url}`;
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return '👑 Trưởng nhóm';
      case 'vice_admin': return 'Phó nhóm';
      case 'moderator': return 'Điều hành';
      default: return 'Thành viên';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'vice_admin': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'moderator': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!confirm(`Bạn có chắc muốn thay đổi quyền của thành viên này?`)) return;

    setLoading(true);
    try {
      await api.put(`/groups/${group._id}/members/${userId}/role`, { role: newRole });
      toast.success('Đã cập nhật quyền thành viên');
      setMembers(prev => 
        prev.map(m => 
          (m.user?._id === userId || m._id === userId) 
            ? { ...m, role: newRole } 
            : m
        )
      );
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Không thể cập nhật quyền');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa thành viên này khỏi nhóm?')) return;

    setLoading(true);
    try {
      await api.delete(`/groups/${group._id}/members/${userId}`);
      toast.success('Đã xóa thành viên khỏi nhóm');
      setMembers(prev => prev.filter(m => (m.user?._id !== userId && m._id !== userId)));
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Không thể xóa thành viên');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = (member) => {
    const userId = member.user?._id || member._id;
    return group.admin === userId;
  };

  const canManage = (member) => {
    const userId = member.user?._id || member._id;
    // Không thể thay đổi quyền của chính mình
    if (userId === group.owner?._id || userId === group.owner) return false;
    // Không thể thay đổi quyền của trưởng nhóm
    if (isOwner(member)) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#242526] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-[#3E4042]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3E4042]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiShield className="text-[#0866FF]" />
            Quản lý thành viên
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {members.map((member) => {
              const userId = member.user?._id || member._id;
              const isMemberOwner = isOwner(member);
              const canManageMember = canManage(member);
              
              return (
                <div
                  key={userId}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(member.user?.avatar) || 'https://ui-avatars.com/api/?background=random&bold=true'}
                      alt={member.user?.fullName || member.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.user?.fullName || member.fullName || 'Người dùng'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        @{member.user?.username || member.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role badge */}
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleColor(member.role || 'member')}`}>
                      {getRoleLabel(member.role || 'member')}
                    </span>

                    {/* Role management - chỉ hiển thị cho admin và không hiển thị với trưởng nhóm */}
                    {canManageMember && !isMemberOwner && (
                      <div className="relative">
                        <select
                          value={member.role || 'member'}
                          onChange={(e) => handleChangeRole(userId, e.target.value)}
                          disabled={loading}
                          className="text-xs bg-gray-100 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#3E4042] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0866FF] disabled:opacity-50"
                        >
                          <option value="member">Thành viên</option>
                          <option value="moderator">Điều hành</option>
                          <option value="vice_admin">Phó nhóm</option>
                        </select>
                      </div>
                    )}

                    {/* Remove button - không hiển thị với trưởng nhóm */}
                    {!isMemberOwner && (
                      <button
                        onClick={() => handleRemoveMember(userId)}
                        disabled={loading}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Xóa thành viên"
                      >
                        <FiUserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {members.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Chưa có thành viên
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-[#3E4042]">
          <button
            onClick={onClose}
            className="w-full btn-secondary"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberManagement;