import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, useAdminData } from './ComprehensiveAdmin';
import { confirmDialog } from '../../lib/confirm.jsx';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card, { CardHeader, CardContent } from '../../components/ui/Card';
import { useLocation } from 'react-router-dom';
import { EditIcon, RefreshIcon, DocumentIcon, WarningIcon, CheckIcon } from "../../components/ui/ModernIcon";

// Content Management Component (Live API Only)
const AdminContentManagement = () => {
  const { hasPermission } = useAuth();
  const { 
    posts, 
    comments,
    media, // will be used for documents data store
    loading, 
    errors, 
    fetchData,
    updateState,
    makeApiRequest,
    setLoading,
    setError,
    clearError,
    addToast,
  } = useAdminData();

  const location = useLocation();

  const [activeTab, setActiveTab] = useState('posts'); // posts | comments | media (documents)
  const [selectedItems, setSelectedItems] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Per-tab state for server-side pagination and filters
  const [postsState, setPostsState] = useState({ page: 1, pageSize: 20, total: 0, search: '', ordering: '-date_created', company: '' });
  const [commentsState, setCommentsState] = useState({ page: 1, pageSize: 20, total: 0 });
  const [mediaState, setMediaState] = useState({ page: 1, pageSize: 20, total: 0, company: '' });

  // Posts form (align with DRF PostSerializer)
  const [postForm, setPostForm] = useState({
    body: '',
    status: 'PUBLISHED', // DRF uses uppercase choices
    allow_comments: true,
    company: '' // company id (required on create)
  });

  // Comments form for editing
  const [commentForm, setCommentForm] = useState({
    content: ''
  });
  const [showCommentEditModal, setShowCommentEditModal] = useState(false);

  // Companies for selecting on Post create
  const [companyOptions, setCompanyOptions] = useState([]);

  // Helper to load data with server-side pagination
  const loadData = async (tab, overrides = {}) => {
    if (!hasPermission('content.view')) return;

    const stateMap = {
      posts: [postsState, setPostsState],
      comments: [commentsState, setCommentsState],
      media: [mediaState, setMediaState],
    };
    const [state, setter] = stateMap[tab] || [];
    const nextState = { ...state, ...overrides };
    const params = new URLSearchParams({
      page: String(nextState.page),
      page_size: String(nextState.pageSize),
    });
    if (tab === 'posts') {
      if (nextState.search) params.set('search', nextState.search);
      if (nextState.ordering) params.set('ordering', nextState.ordering);
      if (nextState.company) params.set('company', String(nextState.company));
    }
    if (tab === 'media') {
      if (nextState.company) params.set('company', String(nextState.company));
    }

    const resource = tab === 'media' ? 'documents' : tab; // media maps to documents

    setLoading(tab, true);
    clearError(tab);
    try {
      const res = await makeApiRequest(`/${resource}/?${params.toString()}`);
      if (res.success) {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.results || []);
        const total = Number.isFinite(data?.count) ? data.count : list.length;
        updateState({ [tab]: list });
        setter(prev => ({ ...prev, ...nextState, total }));
      } else {
        updateState({ [tab]: [] });
        setter(prev => ({ ...prev, ...nextState, total: 0 }));
        setError(tab, res.error || 'Failed to load data');
      }
    } catch (e) {
      updateState({ [tab]: [] });
      setter(prev => ({ ...prev, ...nextState, total: 0 }));
      setError(tab, e.message || 'Request failed');
    } finally {
      setLoading(tab, false);
    }
  };

  // Initial load + preload companies
  useEffect(() => {
    if (hasPermission('content.view')) {
      loadData('posts');
      loadData('comments');
      loadData('media');
      // Preload companies for post creation (first page, larger page_size)
      makeApiRequest('/companies/?page_size=100').then(res => {
        if (res?.success) {
          const list = Array.isArray(res.data) ? res.data : (res.data.results || []);
          setCompanyOptions(list);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission]);

  // Route-aware tab and create form
  useEffect(() => {
    if (location.pathname.endsWith('/admin/content/comments') || location.pathname.endsWith('/content/comments')) {
      setActiveTab('comments');
    } else if (location.pathname.endsWith('/admin/content/media') || location.pathname.endsWith('/content/media')) {
      setActiveTab('media');
    } else {
      setActiveTab('posts');
    }
    if ((location.pathname.endsWith('/admin/content/create') || location.pathname.endsWith('/content/create')) && hasPermission('content.add')) {
      setEditingItem(null);
      setShowCreateForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, hasPermission]);

  // Process data based on active tab
  const processedData = useMemo(() => {
    const key = activeTab;
    const data = key === 'posts' ? (posts || []) : key === 'comments' ? (comments || []) : (media || []);
    return data;
  }, [activeTab, posts, comments, media]);

  const totals = useMemo(() => ({
    posts: postsState.total,
    comments: commentsState.total,
    media: mediaState.total,
  }), [postsState.total, commentsState.total, mediaState.total]);

  // Selection handlers
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };
  const handleSelectAll = () => {
    if (selectedItems.length === processedData.length) setSelectedItems([]);
    else setSelectedItems(processedData.map(item => item.id));
  };

  // Bulk delete (available for all tabs)
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    const ok = await confirmDialog({ title: 'Bulk Delete', message: `Delete ${selectedItems.length} ${activeTab}? This cannot be undone.`, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      for (const id of selectedItems) {
        const endpoint = activeTab === 'posts' ? `/posts/${id}/` : activeTab === 'comments' ? `/comments/${id}/` : `/documents/${id}/`;
        await makeApiRequest(endpoint, { method: 'DELETE' });
      }
      setSelectedItems([]);
      await loadData(activeTab);
      addToast('Deleted successfully', 'success');
    } catch (e) {
      addToast(e.message || 'Failed to delete items', 'error');
    }
  };

  // Posts: create/update
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingItem;
      const endpoint = isEdit ? `/posts/${editingItem.id}/` : '/posts/';
      const method = isEdit ? 'PATCH' : 'POST';
      // Build payload; company required on create
      const payload = {
        body: postForm.body,
        status: postForm.status,
        allow_comments: !!postForm.allow_comments,
        ...(isEdit ? {} : { company: postForm.company ? Number(postForm.company) : undefined })
      };
      const res = await makeApiRequest(endpoint, { method, body: JSON.stringify(payload) });
      if (res.success) {
        setShowCreateForm(false);
        setEditingItem(null);
        setPostForm({ body: '', status: 'PUBLISHED', allow_comments: true, company: '' });
        await loadData('posts');
        addToast(`Post ${isEdit ? 'updated' : 'created'} successfully`, 'success');
      } else {
        addToast(res.error || 'Operation failed', 'error');
      }
    } catch (error) {
      addToast(error.message || 'Operation failed', 'error');
    }
  };

  // Posts: edit initializer
  const handleEditPost = (item) => {
    setEditingItem(item);
    setPostForm({
      body: item.body || '',
      status: item.status || 'PUBLISHED',
      allow_comments: item.allow_comments ?? true,
      company: String(item.company?.id || '')
    });
    setShowCreateForm(true);
  };

  const handleEditComment = (item) => {
    setEditingItem(item);
    setCommentForm({
      content: item.content || ''
    });
    setShowCommentEditModal(true);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await makeApiRequest(`/comments/${editingItem.id}/`, {
        method: 'PUT',
        data: {
          content: commentForm.content
        }
      });
      
      setShowCommentEditModal(false);
      setEditingItem(null);
      setCommentForm({ content: '' });
      await loadData('comments');
      addToast('Comment updated successfully', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to update comment', 'error');
    }
  };

  if (!hasPermission('content.view')) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view content management.</p>
      </div>
    );
  }

  // Helpers for current tab state
  const currentState = activeTab === 'posts' ? postsState : activeTab === 'comments' ? commentsState : mediaState;
  const setCurrentState = activeTab === 'posts' ? setPostsState : activeTab === 'comments' ? setCommentsState : setMediaState;
  const totalPages = Math.max(1, Math.ceil((currentState.total || 0) / (currentState.pageSize || 20)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Content Management"
        subtitle="Manage posts, comments, and documents"
        actions={
          <div className="flex gap-2">
            {hasPermission('content.add') && activeTab === 'posts' && (
              <Button onClick={() => { setEditingItem(null); setPostForm({ body: '', status: 'PUBLISHED', allow_comments: true, company: '' }); setShowCreateForm(true); }}>
                <EditIcon size={20} className="mr-2" />
                Create Post
              </Button>
            )}
            <Button variant="minimal" onClick={() => loadData(activeTab)}>
              <RefreshIcon size={20} className="mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <Card>
        <CardHeader className="px-6">
          <nav className="flex space-x-8">
            {['posts', 'comments', 'media'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedItems([]); setShowCreateForm(false); setEditingItem(null); }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="capitalize">{tab === 'media' ? 'documents' : tab}</span>
                  <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {totals[tab] || 0}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </CardHeader>
      </Card>

      {/* Create/Edit Post Form */}
      {showCreateForm && activeTab === 'posts' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{editingItem ? 'Edit Post' : 'Create New Post'}</h3>
            <Button variant="minimal" size="sm" onClick={() => { setShowCreateForm(false); setEditingItem(null); }}>Close</Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPost} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Body *</label>
                <Textarea value={postForm.body} onChange={(e) => setPostForm({ ...postForm, body: e.target.value })} rows={8} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={postForm.status} onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                </Select>
              </div>
              <div className="flex items-center md:col-span-1">
                <label className="flex items-center">
                  <input type="checkbox" checked={postForm.allow_comments} onChange={(e) => setPostForm({ ...postForm, allow_comments: e.target.checked })} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Allow Comments</span>
                </label>
              </div>
              {!editingItem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <Select value={postForm.company} onChange={(e) => setPostForm({ ...postForm, company: e.target.value })} required>
                    <option value="">Select Company</option>
                    {companyOptions.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="minimal" onClick={() => { setShowCreateForm(false); setEditingItem(null); }}>Cancel</Button>
              <Button type="submit">{editingItem ? 'Update Post' : 'Create Post'}</Button>
            </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Comment Modal */}
      {showCommentEditModal && editingItem && (
        <Card className="mb-6">
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Comment</h3>
              <Button variant="minimal" size="sm" onClick={() => { setShowCommentEditModal(false); setEditingItem(null); }}>Close</Button>
            </div>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment Content</label>
                <Textarea 
                  value={commentForm.content} 
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })} 
                  rows={4} 
                  required 
                  placeholder="Enter comment content..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="minimal" onClick={() => { setShowCommentEditModal(false); setEditingItem(null); }}>Cancel</Button>
                <Button type="submit">Update Comment</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters and Bulk Actions */}
      <Card>
        <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
          {activeTab === 'posts' && (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Posts</label>
                <div className="flex">
                  <Input value={postsState.search} onChange={(e) => setPostsState({ ...postsState, search: e.target.value })} placeholder="Search by body..." className="flex-1 rounded-r-none" />
                  <Button onClick={() => { setPostsState(prev => ({ ...prev, page: 1 })); loadData('posts', { page: 1 }); }} className="rounded-l-none">Apply</Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <Select value={postsState.ordering} onChange={(e) => { const val = e.target.value; setPostsState(prev => ({ ...prev, ordering: val, page: 1 })); loadData('posts', { ordering: val, page: 1 }); }}>
                  <option value="-date_created">Newest</option>
                  <option value="date_created">Oldest</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <Select value={postsState.company} onChange={(e) => { const company = e.target.value; setPostsState(prev => ({ ...prev, company, page: 1 })); loadData('posts', { company, page: 1 }); }}>
                  <option value="">All companies</option>
                  {companyOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </Select>
              </div>
            </>
          )}

          {activeTab === 'media' && (
            <>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <Select value={mediaState.company} onChange={(e) => { const company = e.target.value; setMediaState(prev => ({ ...prev, company, page: 1 })); loadData('media', { company, page: 1 }); }}>
                  <option value="">All companies</option>
                  {companyOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </Select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page size</label>
            <Select value={currentState.pageSize} onChange={(e) => { const size = Number(e.target.value); setCurrentState(prev => ({ ...prev, pageSize: size, page: 1 })); loadData(activeTab, { pageSize: size, page: 1 }); }}>
              {[10,20,50,100].map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>

        {/* Bulk delete */}
        {selectedItems.length > 0 && (
      <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">{selectedItems.length} {activeTab} selected</span>
              <div className="flex space-x-2">
        <Button variant="minimal" size="sm" onClick={handleBulkDelete} className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20">Delete</Button>
              </div>
            </div>
          </div>
        )}
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 capitalize">{activeTab === 'media' ? 'documents' : activeTab} ({totals[activeTab] || 0})</h3>
        </CardHeader>
        <CardContent className="p-0">
        {loading[activeTab] ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {activeTab === 'media' ? 'documents' : activeTab}...</p>
          </div>
        ) : errors[activeTab] ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WarningIcon size={32} className="text-red-600" />
            </div>
            <p className="text-red-600 mb-2">Error loading {activeTab}</p>
            <p className="text-gray-500 text-sm">{errors[activeTab]}</p>
          </div>
        ) : processedData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentIcon size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-600">No {activeTab === 'media' ? 'documents' : activeTab} found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" checked={selectedItems.length === processedData.length && processedData.length > 0} onChange={handleSelectAll} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  </th>
                  {activeTab === 'posts' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Body</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                  {activeTab === 'comments' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                  {activeTab === 'media' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    </td>
                    {activeTab === 'posts' && (
                      <>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 truncate max-w-xl">{item.body || '—'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.user?.full_name || item.user?.email || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.company?.company_name || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.status || 'DRAFT'}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{item.date_created ? new Date(item.date_created).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            {hasPermission('content.change') && (
                              <Button variant="minimal" size="sm" onClick={() => handleEditPost(item)}>Edit</Button>
                            )}
                            {hasPermission('content.delete') && (
                              <Button variant="minimal" size="sm" onClick={async () => { const ok = await confirmDialog({ title: 'Delete Post', message: 'Delete this post?', confirmLabel: 'Delete' }); if (!ok) return; try { await makeApiRequest(`/posts/${item.id}/`, { method: 'DELETE' }); await loadData('posts'); addToast('Post deleted', 'success'); } catch (e) { addToast(e.message || 'Failed to delete post', 'error'); } }} className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20">Delete</Button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'comments' && (
                      <>
                        <td className="px-6 py-4"><div className="text-sm text-gray-900 truncate max-w-xl">{item.content || '—'}</div></td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.user?.full_name || item.user?.email || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">#{item.post_id || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{item.commented_at ? new Date(item.commented_at).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            {hasPermission('content.change') && (
                              <Button variant="minimal" size="sm" onClick={() => handleEditComment(item)}>
                                <EditIcon size={16} />
                              </Button>
                            )}
                            {hasPermission('content.delete') && (
                              <Button variant="minimal" size="sm" onClick={async () => { const ok = await confirmDialog({ title: 'Delete Comment', message: 'Delete this comment?', confirmLabel: 'Delete' }); if (!ok) return; try { await makeApiRequest(`/comments/${item.id}/`, { method: 'DELETE' }); await loadData('comments'); addToast('Comment deleted', 'success'); } catch (e) { addToast(e.message || 'Failed to delete comment', 'error'); } }} className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20">
                                <WarningIcon size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'media' && (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <DocumentIcon size={20} className="text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{item.document?.split('/').pop() || 'Document'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.type || item.type?.name || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.company || item.company?.company_name || '—'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <Button as="a" href={item.document} target="_blank" rel="noreferrer" variant="minimal" size="sm">Download</Button>
                            {hasPermission('content.delete') && (
                              <Button variant="minimal" size="sm" onClick={async () => { const ok = await confirmDialog({ title: 'Delete Document', message: 'Delete this document?', confirmLabel: 'Delete' }); if (!ok) return; try { await makeApiRequest(`/documents/${item.id}/`, { method: 'DELETE' }); await loadData('media'); addToast('Document deleted', 'success'); } catch (e) { addToast(e.message || 'Failed to delete document', 'error'); } }} className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20">Delete</Button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </CardContent>
      </Card>

      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {currentState.page} of {totalPages}</div>
        <div className="space-x-2">
          <button disabled={currentState.page <= 1} onClick={() => { setCurrentState(prev => ({ ...prev, page: 1 })); loadData(activeTab, { page: 1 }); }} className="px-3 py-1 border rounded disabled:opacity-50">First</button>
          <button disabled={currentState.page <= 1} onClick={() => { const p = Math.max(1, currentState.page - 1); setCurrentState(prev => ({ ...prev, page: p })); loadData(activeTab, { page: p }); }} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <button disabled={currentState.page >= totalPages} onClick={() => { const p = currentState.page + 1; setCurrentState(prev => ({ ...prev, page: p })); loadData(activeTab, { page: p }); }} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          <button disabled={currentState.page >= totalPages} onClick={() => { const p = totalPages; setCurrentState(prev => ({ ...prev, page: p })); loadData(activeTab, { page: p }); }} className="px-3 py-1 border rounded disabled:opacity-50">Last</button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center">
          <CheckIcon size={24} className="text-blue-600 mr-3" />
          <div>
            <h4 className="text-blue-800 font-semibold">Live content management connected!</h4>
            <p className="text-blue-700 mt-1">Posts, comments, and documents are now managed directly from the Django API.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentManagement;
