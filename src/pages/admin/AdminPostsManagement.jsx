import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useAdminData } from './ComprehensiveAdmin';
import DataTable from '../../components/admin/DataTable';
import ResourceForm from '../../components/admin/ResourceForm';
import { confirmDialog } from '../../lib/confirm.jsx';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { NoSymbolIcon, PlusIcon, CheckCircleIcon, ClockIcon, PhotoIcon } from '@heroicons/react/24/outline';

// Posts Management (live API only) using generic building blocks
const AdminPostsManagement = () => {
  const { hasPermission } = useAuth();
  const { makeApiRequest, addToast } = useAdminData();
  const location = useLocation();
  const navigate = useNavigate();

  const isCreateRoute = location.pathname.endsWith('/content/create') || location.pathname.endsWith('/admin/content/create');

  const [companies, setCompanies] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = () => setRefreshKey(Date.now());

  // Preload companies for select
  useEffect(() => {
    (async () => {
      try {
        const res = await makeApiRequest('/companies/?page_size=100');
        if (res.success) {
          const list = Array.isArray(res.data) ? res.data : (res.data.results || []);
          setCompanies(list.map((c) => ({ value: c.id, label: c.company_name })));
        }
      } catch {}
    })();
  }, [makeApiRequest]);

  // Columns
  const columns = useMemo(() => ([
    {
      header: 'Post', sortable: false,
      render: (p) => (
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            {p.images && p.images.length > 0 ? (
              <img src={p.images[0]} alt="Post" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <PhotoIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{p.body || '—'}</p>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              by {p.user?.full_name || p.user?.email || 'System'}
              {p.company && ` for ${p.company.company_name}`}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Status', sortable: true, sortKey: 'status', width: '140px',
      render: (p) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          p.status === 'PUBLISHED' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}>
          {p.status === 'PUBLISHED' ? (
            <CheckCircleIcon className="h-4 w-4 mr-1.5" />
          ) : (
            <ClockIcon className="h-4 w-4 mr-1.5" />
          )}
          {p.status || 'DRAFT'}
        </span>
      )
    },
    {
      header: 'Date', sortable: true, sortKey: 'date_created', width: '140px',
      render: (p) => p.date_created ? new Date(p.date_created).toLocaleDateString() : '—'
    },
    {
      header: 'Comments', sortable: false, width: '120px',
      render: (p) => (
        <span className={`text-sm ${p.allow_comments ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
          {p.allow_comments ? 'Enabled' : 'Disabled'}
        </span>
      )
    }
  ]), []);

  // Fetcher
  const fetcher = useCallback(async ({ page, pageSize, ordering, search }) => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (pageSize) params.set('page_size', String(pageSize));
    if (ordering) params.set('ordering', ordering);
    if (search) params.set('search', search);
    const res = await makeApiRequest(`/posts/?${params.toString()}`);
    if (!res.success) throw new Error(res.error || 'Failed to load posts');
    const data = res.data;
    const items = Array.isArray(data) ? data : (data.results || []);
    const count = Number.isFinite(data?.count) ? data.count : items.length;
    return { items, count };
  }, [makeApiRequest]);

  const mapDrfErrors = (data) => {
    if (!data || typeof data !== 'object') return null;
    const out = {};
    Object.entries(data).forEach(([k, v]) => {
      if (Array.isArray(v)) out[k] = v.map(String);
      else if (typeof v === 'string') out[k] = [v];
    });
    return out;
  };

  // Create post
  const handleCreate = async (values) => {
    if (!hasPermission('content.add')) return { success: false, message: 'No permission' };
    const payload = {
      body: values.body || '',
      status: values.status || 'PUBLISHED',
      allow_comments: !!values.allow_comments,
      company: values.company ? Number(values.company) : undefined,
    };
    const res = await makeApiRequest('/posts/', { method: 'POST', body: JSON.stringify(payload) });
    if (res.success) {
      addToast('Post created successfully', 'success');
      bumpRefresh();
  navigate('/admin/content');
      return { success: true };
    }
    const errs = mapDrfErrors(res.data) || { __all__: [res.error || 'Failed to create post'] };
    return { success: false, errors: errs };
  };

  // Edit post
  const handleEditSubmit = async (values) => {
    if (!editingPost) return { success: false, message: 'No post selected' };
    if (!hasPermission('content.change')) return { success: false, message: 'No permission' };
    const payload = {
      body: values.body,
      status: values.status,
      allow_comments: !!values.allow_comments,
      // company immutable here to match previous behavior
    };
    const res = await makeApiRequest(`/posts/${editingPost.id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
    if (res.success) {
      addToast('Post updated successfully', 'success');
      setEditingPost(null);
      bumpRefresh();
      return { success: true };
    }
    const errs = mapDrfErrors(res.data) || { __all__: [res.error || 'Failed to update post'] };
    return { success: false, errors: errs };
  };

  // Delete single
  const handleDelete = async (row) => {
  if (!hasPermission('content.delete')) return;
  const ok = await confirmDialog({ title: 'Delete Post', message: 'Delete this post? This cannot be undone.', confirmLabel: 'Delete' });
  if (!ok) return;
    const res = await makeApiRequest(`/posts/${row.id}/`, { method: 'DELETE' });
    if (res.success || res.status === 204) {
      addToast('Post deleted', 'success');
      bumpRefresh();
    } else {
      addToast(res.error || 'Failed to delete post', 'error');
    }
  };

  // Bulk delete
  const handleBulkDelete = async (ids) => {
  if (!hasPermission('content.delete')) return;
  if (!ids?.length) return;
  const ok = await confirmDialog({ title: 'Bulk Delete', message: `Delete ${ids.length} selected post(s)? This cannot be undone.`, confirmLabel: 'Delete' });
  if (!ok) return;
    let success = 0;
    for (const id of ids) {
      const r = await makeApiRequest(`/posts/${id}/`, { method: 'DELETE' });
      if (r.success || r.status === 204) success += 1;
    }
    addToast(`Deleted ${success}/${ids.length} posts`, success === ids.length ? 'success' : 'warning');
    bumpRefresh();
  };

  if (!hasPermission('content.view')) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <NoSymbolIcon className="w-8 h-8" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view posts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post Management"
        subtitle="Manage user and company-generated posts"
        actions={
          hasPermission('content.add') && !isCreateRoute ? (
            <Button onClick={() => navigate('/admin/content/create')}>
              <PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />
              Create Post
            </Button>
          ) : null
        }
      />

      {/* Create Post */}
      {isCreateRoute && hasPermission('content.add') && (
        <ResourceForm
          title="Create Post"
          fields={[
            { name: 'body', label: 'Body', type: 'textarea', required: true, placeholder: 'Write post...' },
            { name: 'status', label: 'Status', type: 'select', options: [
              { value: 'PUBLISHED', label: 'PUBLISHED' },
              { value: 'DRAFT', label: 'DRAFT' },
            ]},
            { name: 'allow_comments', label: 'Allow Comments', type: 'checkbox' },
            { name: 'company', label: 'Company', type: 'select', required: true, options: companies },
          ]}
          onSubmit={handleCreate}
          onCancel={() => navigate('/admin/content')}
          submitLabel="Create Post"
        />
      )}

      {/* Edit Post */}
      {editingPost && hasPermission('content.change') && (
        <ResourceForm
          title={`Edit Post #${editingPost.id}`}
          initialValues={{
            body: editingPost.body || '',
            status: editingPost.status || 'PUBLISHED',
            allow_comments: !!editingPost.allow_comments,
          }}
          fields={[
            { name: 'body', label: 'Body', type: 'textarea', required: true },
            { name: 'status', label: 'Status', type: 'select', options: [
              { value: 'PUBLISHED', label: 'PUBLISHED' },
              { value: 'DRAFT', label: 'DRAFT' },
            ]},
            { name: 'allow_comments', label: 'Allow Comments', type: 'checkbox' },
          ]}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingPost(null)}
          submitLabel="Save Changes"
        />
      )}

      {/* Posts Table */}
      <DataTable
        title="All Posts"
        columns={columns}
        fetcher={fetcher}
        initialOrdering="-date_created"
        selectable={hasPermission('content.delete')}
  onRowClick={(row) => navigate(`/admin/content/${row.id}`)}
        renderRowActions={(row) => (
          <div className="flex gap-2">
            {hasPermission('content.change') && (
              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setEditingPost(row); }}>Edit</Button>
            )}
            {hasPermission('content.delete') && (
              <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>Delete</Button>
            )}
          </div>
        )}
        onBulkDelete={hasPermission('content.delete') ? handleBulkDelete : undefined}
        refreshKey={refreshKey}
      />
    </div>
  );
};

export default AdminPostsManagement;
 
