// ============================================
// FILE: src/components/pages/Pages.jsx
// MÔ TẢ: Trang quản lý và hiển thị các Fanpage
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import CreatePage from './CreatePage';
import PageDetail from './PageDetail';
import { FiFlag, FiPlus, FiSearch } from 'react-icons/fi';

const Pages = () => {
  const { pageId } = useParams();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (pageId) {
    return <PageDetail pageId={pageId} />;
  }

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await api.get('/pages');
        setPages(response.data.pages || []);
      } catch (error) {
        console.error('Error fetching pages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, []);

  const filteredPages = pages.filter(
    (page) =>
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading text="Đang tải trang..." />;
  }

  return (
    <>
      <Helmet>
        <title>Trang - VibeSpace</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trang của bạn
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Quản lý và theo dõi các trang
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Tạo trang mới
          </button>
        </div>

        <div className="relative mb-6">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm trang..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <FiFlag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Không tìm thấy trang nào' : 'Bạn chưa tạo trang nào'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 btn-primary"
              >
                Tạo trang đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.map((page) => (
              <Link
                key={page._id}
                to={`/pages/${page._id}`}
                className="card hover:shadow-lg transition-all duration-200 group"
              >
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                  <img
                    src={
                      page.coverPhoto ||
                      page.avatar ||
                      'https://via.placeholder.com/400x200'
                    }
                    alt={page.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                    <img
                      src={
                        page.avatar ||
                        'https://ui-avatars.com/api/?background=random&bold=true'
                      }
                      alt={page.name}
                      className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800"
                    />
                    <span className="text-white font-medium text-sm bg-black/50 px-2 py-1 rounded">
                      {page.name}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {page.description || 'Chưa có mô tả'}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{page.stats?.followers || 0} người theo dõi</span>
                    <span>{page.stats?.posts || 0} bài viết</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {showCreate && (
          <CreatePage
            onClose={() => setShowCreate(false)}
            onCreated={(newPage) => {
              setPages([newPage, ...pages]);
              setShowCreate(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default Pages;