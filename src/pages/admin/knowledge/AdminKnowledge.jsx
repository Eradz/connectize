import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  FolderIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { knowledgeHubAPI } from '../../../api-services/enhanced-knowledge';

const AdminKnowledge = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [forums, setForums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reportedContent, setReportedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, categoryFilter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'articles') {
        const response = await knowledgeHubAPI.getArticles({
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined
        });
        setArticles(response.data?.results || []);
      } else if (activeTab === 'forums') {
        const response = await knowledgeHubAPI.getForums();
        setForums(response.data?.results || []);
      } else if (activeTab === 'categories') {
        const response = await knowledgeHubAPI.getCategories();
        setCategories(response.data?.results || []);
      } else if (activeTab === 'moderation') {
        const response = await knowledgeHubAPI.getReportedContent();
        setReportedContent(response.data?.results || []);
      }

      // Load categories for filter dropdown if needed
      if (categories.length === 0) {
        const categoriesResponse = await knowledgeHubAPI.getCategories();
        setCategories(categoriesResponse.data?.results || []);
      }
    } catch (error) {
      console.error('Failed to load knowledge hub data:', error);
      // Use mock data if API fails
      if (activeTab === 'articles') {
        setArticles([
          { id: 1, title: 'Sample Article', status: 'published', author: { name: 'Admin' }, category: { name: 'General' }, created_at: new Date().toISOString() }
        ]);
      } else if (activeTab === 'forums') {
        setForums([
          { id: 1, name: 'Sample Forum', description: 'A sample forum', status: 'active', created_at: new Date().toISOString() }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id, publish = true) => {
    try {
      if (publish) {
        await knowledgeHubAPI.publishArticle(id);
      } else {
        await knowledgeHubAPI.unpublishArticle(id);
      }
      loadData();
    } catch (error) {
      console.error('Failed to update publication status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (activeTab === 'articles') {
        await knowledgeHubAPI.deleteArticle(id);
      } else if (activeTab === 'forums') {
        await knowledgeHubAPI.deleteForum(id);
      } else if (activeTab === 'categories') {
        await knowledgeHubAPI.deleteCategory(id);
      }
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      archived: { color: 'bg-red-100 text-red-800', label: 'Archived' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'articles', label: 'Articles', icon: BookOpenIcon, count: articles.length },
    { id: 'forums', label: 'Forums', icon: ChatBubbleLeftRightIcon, count: forums.length },
    { id: 'categories', label: 'Categories', icon: FolderIcon, count: categories.length },
    { id: 'moderation', label: 'Moderation', icon: ShieldCheckIcon, count: reportedContent.length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border border-white/20 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Knowledge Hub Management
            </h1>
            <p className="text-gray-600 mt-1">Manage articles, forums, and content moderation</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-medium flex items-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create {activeTab.slice(0, -1)}
            </button>
            <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-medium flex items-center">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-1">
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedItems([]);
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-lg backdrop-blur-xl'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-xl'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100/80 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters and Search */}
      <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            {activeTab === 'articles' && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-gray-700"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </>
            )}
            <button
              onClick={loadData}
              className="px-4 py-3 bg-gradient-to-r from-gray-100/80 to-gray-200/80 backdrop-blur-xl text-gray-700 rounded-xl hover:from-gray-200/80 hover:to-gray-300/80 transition-all duration-200 flex items-center border border-white/30 shadow-medium"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {activeTab === 'articles' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{article.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{article.excerpt || article.content}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{article.author?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {article.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(article.created_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700" title="View Article">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-700" title="Edit Article">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {article.status === 'published' ? (
                          <button
                            onClick={() => handlePublish(article.id, false)}
                            className="text-yellow-600 hover:text-yellow-700"
                            title="Unpublish"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(article.id, true)}
                            className="text-green-600 hover:text-green-700"
                            title="Publish"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Article"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'forums' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {forums.map((forum) => (
                  <tr key={forum.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{forum.name}</div>
                        <div className="text-sm text-gray-500">{forum.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(forum.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(forum.created_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700" title="View Forum">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-700" title="Edit Forum">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(forum.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Forum"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'articles' && articles.length === 0) ||
          (activeTab === 'forums' && forums.length === 0) ||
          (activeTab === 'categories' && categories.length === 0) ||
          (activeTab === 'moderation' && reportedContent.length === 0)) && (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No {activeTab} found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : `Get started by creating a new ${activeTab.slice(0, -1)}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminKnowledge;
