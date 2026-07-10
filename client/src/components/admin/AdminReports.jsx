// ============================================
// FILE: src/components/admin/AdminReports.jsx
// MÔ TẢ: Quản lý báo cáo cho admin
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
  FiAlertTriangle,
  FiUserX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/reports', {
          params: { page, limit: 20 },
        });
        setReports(response.data.reports || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Không thể tải danh sách báo cáo');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [page]);

  const handleReport = async (postId, action) => {
    try {
      await api.put(`/admin/reports/${postId}`, { action });

      const messages = {
        ignore: 'Đã bỏ qua báo cáo',
        delete: 'Đã xóa bài viết',
        warn: 'Đã gửi cảnh báo cho tác giả',
      };

      toast.success(messages[action]);
      setReports((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) {
      console.error('Error handling report:', error);
      toast.error('Không thể xử lý báo cáo');
    }
  };

  if (loading) {
    return <Loading text="Đang tải danh sách báo cáo..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quản lý báo cáo
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {reports.length} báo cáo đang chờ xử lý
        </span>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <FiCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Không có báo cáo nào cần xử lý
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((post) => (
            <div
              key={post._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={
                        post.author?.avatar ||
                        'https://ui-avatars.com/api/?background=random&bold=true'
                      }
                      alt={post.author?.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {post.author?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        @{post.author?.username} · {timeAgo(post.createdAt)}
                      </p>
                    </div>
                    <span className="ml-auto text-xs bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full">
                      <FiAlertTriangle className="w-3 h-3 inline mr-1" />
                      {post.reportCount} báo cáo
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                    {post.content || 'Bài viết không có nội dung'}
                  </p>

                  <div className="mt-2 space-y-1">
                    {post.reports?.slice(0, 3).map((report, index) => (
                      <div
                        key={index}
                        className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2"
                      >
                        <span>👤 {report.user?.fullName}</span>
                        <span>·</span>
                        <span className="text-red-500">{report.reason}</span>
                        {report.description && (
                          <span>· "{report.description}"</span>
                        )}
                      </div>
                    ))}
                    {post.reports?.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{post.reports.length - 3} báo cáo khác
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:flex-col">
                  <button
                    onClick={() => setSelectedReport(post)}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiEye className="w-4 h-4 inline mr-1" />
                    Xem
                  </button>
                  <button
                    onClick={() => handleReport(post._id, 'ignore')}
                    className="px-3 py-1.5 text-sm border border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <FiCheck className="w-4 h-4 inline mr-1" />
                    Bỏ qua
                  </button>
                  <button
                    onClick={() => handleReport(post._id, 'warn')}
                    className="px-3 py-1.5 text-sm border border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                  >
                    <FiUserX className="w-4 h-4 inline mr-1" />
                    Cảnh báo
                  </button>
                  <button
                    onClick={() => handleReport(post._id, 'delete')}
                    className="px-3 py-1.5 text-sm border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4 inline mr-1" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4 py-3">
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

      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Chi tiết báo cáo
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedReport.author?.avatar ||
                    'https://ui-avatars.com/api/?background=random&bold=true'
                  }
                  alt={selectedReport.author?.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedReport.author?.fullName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{selectedReport.author?.username} · {timeAgo(selectedReport.createdAt)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedReport.content || 'Bài viết không có nội dung'}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Danh sách báo cáo ({selectedReport.reports?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedReport.reports?.map((report, index) => (
                    <div
                      key={index}
                      className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              report.user?.avatar ||
                              'https://ui-avatars.com/api/?background=random&bold=true'
                            }
                            alt={report.user?.fullName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {report.user?.fullName}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {timeAgo(report.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        <strong>Lý do:</strong> {report.reason}
                      </p>
                      {report.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          <strong>Mô tả:</strong> {report.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    handleReport(selectedReport._id, 'ignore');
                    setSelectedReport(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={() => {
                    handleReport(selectedReport._id, 'warn');
                    setSelectedReport(null);
                  }}
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Cảnh báo
                </button>
                <button
                  onClick={() => {
                    handleReport(selectedReport._id, 'delete');
                    setSelectedReport(null);
                  }}
                  className="flex-1 btn-danger"
                >
                  Xóa bài viết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;