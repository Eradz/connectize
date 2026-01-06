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
  ChartBarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { knowledgeHubAPI } from '../../../api-services/knowledgeHub';
import { subscriptionsAPI } from '../../../api-services/subscriptions';

const AdminKnowledge = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [forums, setForums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reportedContent, setReportedContent] = useState([]);
  const [tags, setTags] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  
  // Separate states for counts
  const [counts, setCounts] = useState({
    articles: 0,
    forums: 0,
    categories: 0,
    moderation: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);

  // Modal and form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load counts immediately without blocking UI
    loadAllCounts();
    // Load initial data
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, categoryFilter, searchTerm]);

    const loadAllCounts = async () => {
    try {
      const [articlesRes, forumsRes, categoriesRes, moderationRes, tagsRes, plansRes] = await Promise.all([
        knowledgeHubAPI.getArticles(),
        knowledgeHubAPI.getForums(),
        knowledgeHubAPI.getCategories(),
        knowledgeHubAPI.getReportedContent(),
        knowledgeHubAPI.getTags(),
        subscriptionsAPI.getAllPlans()
      ]);

      const newCounts = {
        articles: articlesRes.data?.count || 0,
        forums: forumsRes.data?.count || 0,
        categories: categoriesRes.data?.count || 0,
        moderation: moderationRes.data?.count || 0
      };

      setCounts(newCounts);
      
      // Also set tags and subscription plans for form usage
      if (tagsRes.success && tagsRes.data?.results) {
        setTags(tagsRes.data.results);
      }
      
      if (plansRes?.results) {
        setSubscriptionPlans(plansRes.results);
      }
    } catch (error) {
      console.error('Failed to load counts:', error);
    }
  };

  const loadData = async (updateCounts = false) => {
    try {
      setLoading(true);
      
      if (activeTab === 'articles') {
        const response = await knowledgeHubAPI.getArticles({
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined
        });
        setArticles(response.data?.results || []);
        // Only update count if specifically requested
        if (updateCounts) {
          setCounts(prev => ({ ...prev, articles: response.data?.count || 0 }));
        }
      } else if (activeTab === 'forums') {
        const response = await knowledgeHubAPI.getForums();
        setForums(response.data?.results || []);
        if (updateCounts) {
          setCounts(prev => ({ ...prev, forums: response.data?.count || 0 }));
        }
      } else if (activeTab === 'categories') {
        const response = await knowledgeHubAPI.getCategories();
        setCategories(response.data?.results || []);
        if (updateCounts) {
          setCounts(prev => ({ ...prev, categories: response.data?.count || 0 }));
        }
      } else if (activeTab === 'moderation') {
        const response = await knowledgeHubAPI.getReportedContent();
        setReportedContent(response.data?.results || []);
        if (updateCounts) {
          setCounts(prev => ({ ...prev, moderation: response.data?.count || 0 }));
        }
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
      loadData(true); // Update counts after publish/unpublish
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
      loadData(true); // Update counts after delete
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  // Form management functions
  const openCreateModal = () => {
    setModalMode('create');
    setEditingItem(null);
    setFormData(getInitialFormData());
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setEditingItem(item);
    setFormData(getFormDataFromItem(item));
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMode('create');
    setEditingItem(null);
    setFormData({});
    setFormErrors({});
    setSubmitting(false);
  };

  // Helper function to get plan name from plan type
  const getPlanName = (planType) => {
    if (!planType) return '';
    const plan = subscriptionPlans.find(p => p.plan_type === planType);
    return plan ? plan.name : planType.charAt(0).toUpperCase() + planType.slice(1);
  };

  const deleteItem = async (item) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      return;
    }

    setSubmitting(true);
    try {
      let response;
      switch(activeTab) {
        case 'articles':
          response = await knowledgeHubAPI.deleteArticle(item.id);
          break;
        case 'forums':
          response = await knowledgeHubAPI.deleteForum(item.id);
          break;
        case 'categories':
          response = await knowledgeHubAPI.deleteCategory(item.id);
          break;
        default:
          throw new Error('Unknown content type');
      }

      if (response.success) {
        await fetchData();
        setMessage(`${activeTab.slice(0, -1)} deleted successfully!`);
        setTimeout(() => setMessage(''), 5000);
      } else {
        throw new Error(response.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage(`Error deleting ${activeTab.slice(0, -1)}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitialFormData = () => {
    switch (activeTab) {
      case 'articles':
        return {
          title: '',
          content: '',
          excerpt: '',
          category: '',
          tags: [],
          article_type: 'news',
          status: 'draft',
          is_featured: false,
          meta_description: '',
          slug: ''
        };
      case 'forums':
        return {
          name: '',
          description: '',
          category: '',
          is_public: true,
          is_moderated: false,
          required_plan: ''
        };
      case 'categories':
        return {
          name: '',
          description: '',
          color: '#3B82F6',
          icon: '',
          is_active: true,
          sort_order: 0
        };
      case 'moderation':
        return {
          content_type: 'article',
          content_id: '',
          action_taken: 'approve',
          moderator_notes: '',
          is_spam: false,
          is_inappropriate: false,
          is_off_topic: false
        };
      default:
        return {};
    }
  };

  const getFormDataFromItem = (item) => {
    switch (activeTab) {
      case 'articles':
        return {
          title: item.title || '',
          content: item.content || '',
          excerpt: item.excerpt || '',
          category: item.category || '',
          tags: item.tags ? item.tags.join(', ') : '',
          status: item.status || 'draft',
          is_featured: item.is_featured || false,
          meta_title: item.meta_title || '',
          meta_description: item.meta_description || '',
          slug: item.slug || ''
        };
      case 'forums':
        return {
          name: item.name || '',
          description: item.description || '',
          category: item.category || '',
          is_public: item.is_public !== undefined ? item.is_public : true,
          is_moderated: item.is_moderated || false,
          required_plan: item.required_plan || '',
          rules: item.rules || '',
          guidelines: item.guidelines || ''
        };
      case 'categories':
        return {
          name: item.name || '',
          description: item.description || '',
          color: item.color || '#3B82F6',
          icon: item.icon || '',
          is_active: item.is_active !== undefined ? item.is_active : true,
          sort_order: item.sort_order || 0
        };
      case 'moderation':
        return {
          action: 'approve',
          reason: '',
          moderator_notes: ''
        };
      default:
        return {};
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      // Validate form
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setSubmitting(false);
        return;
      }

      // Prepare data for submission
      const submitData = prepareSubmitData();

      if (modalMode === 'create') {
        await createItem(submitData);
      } else {
        await updateItem(editingItem.id, submitData);
      }

      closeModal();
      loadData(true); // Reload data and update counts
    } catch (error) {
      console.error('Form submission error:', error);
      setFormErrors({ general: error.message || 'Failed to save item' });
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    switch (activeTab) {
      case 'articles':
        if (!formData.title?.trim()) errors.title = 'Title is required';
        if (!formData.content?.trim()) errors.content = 'Content is required';
        if (!formData.category) errors.category = 'Category is required';
        break;
      case 'forums':
        if (!formData.name?.trim()) errors.name = 'Name is required';
        if (!formData.description?.trim()) errors.description = 'Description is required';
        if (!formData.category) errors.category = 'Category is required';
        break;
      case 'categories':
        if (!formData.name?.trim()) errors.name = 'Name is required';
        if (!formData.color?.trim()) errors.color = 'Color is required';
        break;
    }

    return errors;
  };

  const prepareSubmitData = () => {
    const data = { ...formData };

    switch (activeTab) {
      case 'articles':
        // Convert tags string to array
        if (data.tags) {
          data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
        // Generate slug if not provided
        if (!data.slug && data.title) {
          data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        break;
      case 'forums':
        // Handle boolean values
        data.is_public = Boolean(data.is_public);
        data.is_moderated = Boolean(data.is_moderated);
        break;
      case 'categories':
        // Generate slug from name
        if (data.name) {
          data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        data.is_active = Boolean(data.is_active);
        data.sort_order = parseInt(data.sort_order) || 0;
        break;
    }

    return data;
  };

  const createItem = async (data) => {
    switch (activeTab) {
      case 'articles':
        return await knowledgeHubAPI.createArticle(data);
      case 'forums':
        return await knowledgeHubAPI.createForum(data);
      case 'categories':
        return await knowledgeHubAPI.createCategory(data);
      default:
        throw new Error('Invalid tab for creation');
    }
  };

  const updateItem = async (id, data) => {
    switch (activeTab) {
      case 'articles':
        return await knowledgeHubAPI.updateArticle(id, data);
      case 'forums':
        return await knowledgeHubAPI.updateForum(id, data);
      case 'categories':
        return await knowledgeHubAPI.updateCategory(id, data);
      default:
        throw new Error('Invalid tab for update');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
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
    { id: 'articles', label: 'Articles', icon: BookOpenIcon, count: counts.articles },
    { id: 'forums', label: 'Forums', icon: ChatBubbleLeftRightIcon, count: counts.forums },
    { id: 'categories', label: 'Categories', icon: FolderIcon, count: counts.categories },
    { id: 'moderation', label: 'Moderation', icon: ShieldCheckIcon, count: counts.moderation }
  ];

  // Don't block the UI for initial loading - show immediately with 0 counts
  // if (initialLoad) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

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
            <button 
              onClick={openCreateModal}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-medium flex items-center"
            >
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
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
                        <div className="text-sm text-gray-500 truncate max-w-xs">{article.excerpt || 'No excerpt available'}</div>
                        {article.tags_list && article.tags_list.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {article.tags_list.slice(0, 3).map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                              </span>
                            ))}
                            {article.tags_list.length > 3 && (
                              <span className="text-xs text-gray-500">+{article.tags_list.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">{article.author?.first_name} {article.author?.last_name}</div>
                          <div className="text-xs text-gray-500">{article.author?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {article.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                        {article.article_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {article.views}
                        </div>
                        <div className="flex items-center">
                          <HeartIcon className="w-4 h-4 mr-1" />
                          {article.likes}
                        </div>
                        <div className="flex items-center">
                          <ArrowPathIcon className="w-4 h-4 mr-1" />
                          {article.shares}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {article.published_at ? formatDate(article.published_at) : 'Not published'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {article.is_featured ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700" title="View Article">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(article)}
                          className="text-indigo-600 hover:text-indigo-700" 
                          title="Edit Article"
                        >
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
                          onClick={() => deleteItem(article)}
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
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Moderation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Latest Activity
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {forum.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          forum.is_public ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {forum.is_public ? 'Public' : 'Private'}
                        </span>
                        {forum.required_plan && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {getPlanName(forum.required_plan)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          forum.is_moderated ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {forum.is_moderated ? 'Moderated' : 'Unmoderated'}
                        </span>
                        <div className="text-xs text-gray-500">
                          {forum.moderators_count} moderator{forum.moderators_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center text-gray-600">
                          <UserIcon className="w-4 h-4 mr-1" />
                          {forum.members_count} member{forum.members_count !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                          {forum.topic_count} topic{forum.topic_count !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <ChatBubbleOvalLeftIcon className="w-4 h-4 mr-1" />
                          {forum.post_count} post{forum.post_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {forum.latest_topic ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 truncate max-w-xs">
                            {forum.latest_topic.title}
                          </div>
                          <div className="text-gray-500 text-xs">
                            by {forum.latest_topic.author}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {formatDate(forum.latest_topic.last_reply_at)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No activity</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(forum.created_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700" title="View Forum">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(forum)}
                          className="text-indigo-600 hover:text-indigo-700" 
                          title="Edit Forum"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(forum)}
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

        {activeTab === 'categories' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sort Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.description || 'No description'}</div>
                        <div className="text-xs text-gray-400 mt-1">Slug: {category.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: category.color }}
                          title={`Color: ${category.color}`}
                        ></div>
                        {category.icon ? (
                          <span className="text-lg" title={`Icon: ${category.icon}`}>
                            {category.icon}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No icon</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {category.sort_order}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div>Articles: {articles.filter(a => a.category_name === category.name).length}</div>
                        <div>Forums: {forums.filter(f => f.category_name === category.name).length}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700" title="View Category">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(category)}
                          className="text-indigo-600 hover:text-indigo-700" 
                          title="Edit Category"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(category)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Category"
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

      {/* Modal for Create/Edit Forms */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Create' : 'Edit'} {activeTab.slice(0, -1)}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              {/* General Error */}
              {formErrors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{formErrors.general}</p>
                </div>
              )}

              {/* Article Form */}
              {activeTab === 'articles' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter article title"
                      />
                      {formErrors.title && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.category ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      {formErrors.category && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article Type
                      </label>
                      <select
                        value={formData.article_type || 'news'}
                        onChange={(e) => handleFormChange('article_type', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="news">News</option>
                        <option value="insight">Insight</option>
                        <option value="analysis">Analysis</option>
                        <option value="tutorial">Tutorial</option>
                        <option value="opinion">Opinion</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status || 'draft'}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Under Review</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Excerpt
                      </label>
                      <textarea
                        value={formData.excerpt || ''}
                        onChange={(e) => handleFormChange('excerpt', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief summary of the article"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                      </label>
                      <textarea
                        value={formData.content || ''}
                        onChange={(e) => handleFormChange('content', e.target.value)}
                        rows={8}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.content ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Article content (Markdown supported)"
                      />
                      {formErrors.content && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.content}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <select
                        multiple
                        value={formData.tags || []}
                        onChange={(e) => {
                          const selectedTags = Array.from(e.target.selectedOptions, option => option.value);
                          handleFormChange('tags', selectedTags);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        size="4"
                      >
                        {tags.map(tag => (
                          <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple tags</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        onChange={(e) => handleFormChange('slug', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="article-url-slug"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from title</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_featured || false}
                          onChange={(e) => handleFormChange('is_featured', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Featured article</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description (SEO)
                      </label>
                      <textarea
                        value={formData.meta_description || ''}
                        onChange={(e) => handleFormChange('meta_description', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="SEO description (max 160 characters)"
                        maxLength="160"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(formData.meta_description || '').length}/160 characters
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Forum Form */}
              {activeTab === 'forums' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Forum Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter forum name"
                      />
                      {formErrors.name && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.category ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      {formErrors.category && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Required Plan
                      </label>
                      <select
                        value={formData.required_plan || ''}
                        onChange={(e) => handleFormChange('required_plan', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No requirement (public forum)</option>
                        {subscriptionPlans.map(plan => (
                          <option key={plan.id} value={plan.plan_type}>
                            {plan.name} ({plan.plan_type})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Users must have this subscription level or higher to access the forum
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Describe what this forum is about"
                      />
                      {formErrors.description && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_public !== undefined ? formData.is_public : true}
                          onChange={(e) => handleFormChange('is_public', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Public forum (visible to all users)</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_moderated || false}
                          onChange={(e) => handleFormChange('is_moderated', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Moderated forum (posts require approval)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Form */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter category name"
                      />
                      {formErrors.name && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sort_order || 0}
                        onChange={(e) => handleFormChange('sort_order', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={formData.color || '#3B82F6'}
                          onChange={(e) => handleFormChange('color', e.target.value)}
                          className="w-16 h-12 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={formData.color || '#3B82F6'}
                          onChange={(e) => handleFormChange('color', e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon (Emoji)
                      </label>
                      <input
                        type="text"
                        value={formData.icon || ''}
                        onChange={(e) => handleFormChange('icon', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="📚"
                        maxLength="2"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe this category"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_active !== undefined ? formData.is_active : true}
                          onChange={(e) => handleFormChange('is_active', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active category</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Moderation Form */}
              {activeTab === 'moderation' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-700">
                      This form is for moderating reported content. Select an action and provide a reason.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Action
                      </label>
                      <select
                        value={formData.action_taken || 'approve'}
                        onChange={(e) => handleFormChange('action_taken', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="approve">Approve Content</option>
                        <option value="reject">Reject Content</option>
                        <option value="edit">Request Edit</option>
                        <option value="delete">Delete Content</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Type
                      </label>
                      <select
                        value={formData.content_type || 'article'}
                        onChange={(e) => handleFormChange('content_type', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="article">Article</option>
                        <option value="forum_post">Forum Post</option>
                        <option value="forum_topic">Forum Topic</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content ID
                      </label>
                      <input
                        type="text"
                        value={formData.content_id || ''}
                        onChange={(e) => handleFormChange('content_id', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="UUID of the content to moderate"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_spam || false}
                          onChange={(e) => handleFormChange('is_spam', e.target.checked)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mark as spam</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_inappropriate || false}
                          onChange={(e) => handleFormChange('is_inappropriate', e.target.checked)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mark as inappropriate</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_off_topic || false}
                          onChange={(e) => handleFormChange('is_off_topic', e.target.checked)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mark as off-topic</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Moderator Notes
                      </label>
                      <textarea
                        value={formData.moderator_notes || ''}
                        onChange={(e) => handleFormChange('moderator_notes', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Internal notes for other moderators"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-custom_yellow transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      {modalMode === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      {modalMode === 'create' ? 'Create' : 'Update'} {activeTab.slice(0, -1)}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKnowledge;
