// ============================================
// FILE: src/components/admin/AdminPosts.jsx
// MÔ TẢ: Quản lý bài viết cho admin
// ============================================

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import { timeAgo } from '../../utils/helpers';
import {
  FiSearch,
  FiCheck,
  FiX,
  FiTrash2,
  FiEye,
  FiFilter,
  FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/posts', {
          params: { page, limit: 20, status: filter, search: searchTerm },
        });
        setPosts(response.posts || []);
        setTotalPages(response.pagination?.pages || 1);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Không thể tải danh sách bài viết');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPosts, 500);
    return () => clearTimeout(debounceTimer);
  }, [page, filter, searchTerm]);

  const handleApprove = async (postId, isApproved) => {
    try {
      await api.put(`/admin/posts/${postId}/approve`, { isApproved });
      toast.success(isApproved ? 'Đã duyệt bài viết' : 'Đã từ chối bài viết');
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) {
      console.error('Error approving post:', error);
      toast.error('Không thể thực hiện thao tác');
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      await api.delete(`/admin/posts/${postId}`);
      toast.success('Đã xóa bài viết');
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Không thể xóa bài viết');
    }
  };

  if (loading) {
    return <Loading text="Đang tải danh sách bài viết..." />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quản lý bài viết
        </h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="reported">Bị báo cáo</option>
          </select>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Bài viết
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Tác giả
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Ngày đăng
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                        {post.content || 'Bài viết không có nội dung'}
                      </p>
                      {post.media && post.media.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {post.media.length} ảnh/video
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          post.author?.avatar ||
                          'https://ui-avatars.com/api/?background=random&bold=true'
                        }
                        alt={post.author?.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {post.author?.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          @{post.author?.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-block w-fit ${
                          post.isApproved
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}
                      >
                        {post.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                      {post.isReported && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 inline-block w-fit">
                          <FiAlertTriangle className="w-3 h-3 inline mr-1" />
                          {post.reportCount} báo cáo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {timeAgo(post.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Xem chi tiết"
                      >
                        <FiEye className="w-4 h-4 text-gray-500" />
                      </button>
                      {!post.isApproved && (
                        <>
                          <button
                            onClick={() => handleApprove(post._id, true)}
                            className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                            title="Duyệt bài viết"
                          >
                            <FiCheck className="w-4 h-4 text-green-500" />
                          </button>
                          <button
                            onClick={() => handleApprove(post._id, false)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Từ chối"
                          >
                            <FiX className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Xóa bài viết"
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

      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Chi tiết bài viết
              </h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedPost.author?.avatar ||
                    'https://ui-avatars.com/api/?background=random&bold=true'
                  }
                  alt={selectedPost.author?.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedPost.author?.fullName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {timeAgo(selectedPost.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedPost.content}
              </p>
              {selectedPost.media && selectedPost.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedPost.media.map((item, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={`Media ${index}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {selectedPost.reports && selectedPost.reports.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">
                    Báo cáo ({selectedPost.reports.length})
                  </h4>
                  {selectedPost.reports.map((report, index) => (
                    <div key={index} className="text-sm text-red-600 dark:text-red-300">
                      <p>👤 {report.user?.fullName}</p>
                      <p>📝 {report.reason} - {report.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
