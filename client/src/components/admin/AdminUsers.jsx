// ============================================
// FILE: src/components/admin/AdminUsers.jsx
// MÔ TẢ: Quản lý người dùng cho admin
// ============================================

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import { FiSearch, FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: { page, limit: 20, search: searchTerm },
      });
      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const handleToggleBan = async (userId, isBanned) => {
    if (!confirm(`Bạn có chắc muốn ${isBanned ? 'mở khóa' : 'khóa'} người dùng này?`)) {
      return;
    }

    try {
      await api.put(`/admin/users/${userId}/ban`, {
        isBanned: !isBanned,
        banReason: !isBanned ? 'Vi phạm điều khoản' : '',
      });
      toast.success(`Đã ${isBanned ? 'mở khóa' : 'khóa'} người dùng`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling ban:', error);
      toast.error('Không thể thực hiện thao tác');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Đã xóa người dùng');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Không thể xóa người dùng');
    }
  };

  if (loading) {
    return <Loading text="Đang tải danh sách người dùng..." />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quản lý người dùng
        </h1>
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm người dùng..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Người dùng
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Ngày tham gia
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.avatar ||
                          'https://ui-avatars.com/api/?background=random&bold=true'
                        }
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.fullName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.isBanned
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          : user.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {user.isBanned ? 'Bị khóa' : user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBan(user._id, user.isBanned)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={user.isBanned ? 'Mở khóa' : 'Khóa'}
                      >
                        {user.isBanned ? (
                          <FiUserCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <FiUserX className="w-4 h-4 text-red-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Xóa"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;