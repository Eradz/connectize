import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useAdminData } from './ComprehensiveAdmin';
import DataTable from '../../components/admin/DataTable';
import ResourceForm from '../../components/admin/ResourceForm';
import { confirmDialog } from '../../lib/confirm.jsx';

// Users Management using generic building blocks (live API only)
const AdminUsersManagement = () => {
  const { hasPermission } = useAuth();
  const { makeApiRequest, addToast } = useAdminData();
  const location = useLocation();
  const navigate = useNavigate();

  const isAddRoute = location.pathname.endsWith('/users/add');

  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = () => setRefreshKey(Date.now());

  const columns = useMemo(() => ([
    { key: 'id', header: 'ID', sortable: true, width: '80px' },
    {
      header: 'User', sortable: true, sortKey: 'first_name',
      render: (u) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{u.first_name?.[0] || u.email?.[0] || 'U'}</span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{u.first_name} {u.last_name}</div>
            <div className="text-xs text-gray-500">{u.role || '—'}</div>
          </div>
        </div>
      )
    },
    { key: 'email', header: 'Email', sortable: true },
    {
      header: 'Verified', sortable: true, sortKey: 'verified', width: '120px',
      render: (u) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${u.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {u.verified ? 'Verified' : 'Unverified'}
        </span>
      )
    },
    { key: 'country', header: 'Country', sortable: true },
    { key: 'followers_count', header: 'Followers', sortable: true, width: '120px' },
    { key: 'following_count', header: 'Following', sortable: true, width: '120px' },
  ]), []);

  const fetcher = useCallback(async ({ page, pageSize, ordering, search }) => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (pageSize) params.set('page_size', String(pageSize));
    if (ordering) params.set('ordering', ordering);
    if (search) params.set('search', search);

    const res = await makeApiRequest(`/users/?${params.toString()}`);
    if (!res.success) throw new Error(res.error || 'Failed to load users');

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

  const handleCreate = async (values) => {
    if (!hasPermission('users.add')) return { success: false, message: 'No permission' };
    const payload = {
      first_name: values.first_name || '',
      last_name: values.last_name || '',
      email: values.email || '',
      role: values.role || '',
      phone_number: values.phone_number || '',
      country: values.country || '',
      region: values.region || '',
      city: values.city || '',
      address: values.address || '',
      verified: !!values.verified,
    };
    const res = await makeApiRequest('/users/', { method: 'POST', body: JSON.stringify(payload) });
    if (res.success) {
      addToast('User created successfully', 'success');
      bumpRefresh();
      navigate('/admin/users');
      return { success: true };
    }
    const errs = mapDrfErrors(res.data) || { __all__: [res.error || 'Failed to create user'] };
    return { success: false, errors: errs };
  };

  const [editingUser, setEditingUser] = useState(null);
  const handleEditSubmit = async (values) => {
    if (!editingUser) return { success: false, message: 'No user selected' };
    if (!hasPermission('users.change')) return { success: false, message: 'No permission' };
    const payload = { ...values };
    const res = await makeApiRequest(`/users/${editingUser.id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
    if (res.success) {
      addToast('User updated successfully', 'success');
      setEditingUser(null);
      bumpRefresh();
      return { success: true };
    }
    const errs = mapDrfErrors(res.data) || { __all__: [res.error || 'Failed to update user'] };
    return { success: false, errors: errs };
  };

  const handleDelete = async (user) => {
    if (!hasPermission('users.delete')) return;
  const ok = await confirmDialog({ title: 'Delete User', message: `Delete user ${user.email}? This cannot be undone.`, confirmLabel: 'Delete' });
  if (!ok) return;
    const res = await makeApiRequest(`/users/${user.id}/`, { method: 'DELETE' });
    if (res.success || res.status === 204) {
      addToast('User deleted successfully', 'success');
      bumpRefresh();
    } else {
      addToast(res.error || 'Failed to delete user', 'error');
    }
  };

  const handleBulkDelete = async (ids) => {
    if (!hasPermission('users.delete')) return;
    if (!ids?.length) return;
  const ok = await confirmDialog({ title: 'Bulk Delete', message: `Delete ${ids.length} selected user(s)? This cannot be undone.`, confirmLabel: 'Delete' });
  if (!ok) return;
    let success = 0;
    for (const id of ids) {
      const r = await makeApiRequest(`/users/${id}/`, { method: 'DELETE' });
      if (r.success || r.status === 204) success += 1;
    }
    addToast(`Deleted ${success}/${ids.length} users`, success === ids.length ? 'success' : 'warning');
    bumpRefresh();
  };

  if (!hasPermission('users.view')) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage platform users</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {hasPermission('users.add') && !isAddRoute && (
            <button
              onClick={() => navigate('/admin/users/add')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="mr-2">➕</span>
              New User
            </button>
          )}
        </div>
      </div>

      {/* Create User */}
      {isAddRoute && hasPermission('users.add') && (
        <ResourceForm
          title="Create User"
          fields={[
            { name: 'first_name', label: 'First Name', required: true },
            { name: 'last_name', label: 'Last Name', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'role', label: 'Role' },
            { name: 'phone_number', label: 'Phone' },
            { name: 'country', label: 'Country' },
            { name: 'region', label: 'Region' },
            { name: 'city', label: 'City' },
            { name: 'address', label: 'Address' },
            { name: 'verified', label: 'Verified', type: 'checkbox' },
          ]}
          onSubmit={handleCreate}
          onCancel={() => navigate('/admin/users')}
          submitLabel="Create"
        />
      )}

      {/* Edit User */}
      {editingUser && hasPermission('users.change') && (
        <ResourceForm
          title={`Edit User: ${editingUser.email}`}
          initialValues={{
            first_name: editingUser.first_name || '',
            last_name: editingUser.last_name || '',
            email: editingUser.email || '',
            role: editingUser.role || '',
            phone_number: editingUser.phone_number || '',
            country: editingUser.country || '',
            region: editingUser.region || '',
            city: editingUser.city || '',
            address: editingUser.address || '',
            verified: !!editingUser.verified,
          }}
          fields={[
            { name: 'first_name', label: 'First Name', required: true },
            { name: 'last_name', label: 'Last Name', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'role', label: 'Role' },
            { name: 'phone_number', label: 'Phone' },
            { name: 'country', label: 'Country' },
            { name: 'region', label: 'Region' },
            { name: 'city', label: 'City' },
            { name: 'address', label: 'Address' },
            { name: 'verified', label: 'Verified', type: 'checkbox' },
          ]}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingUser(null)}
          submitLabel="Save Changes"
        />
      )}

      {/* Users Table */}
      <DataTable
        title="All Users"
        columns={columns}
        fetcher={fetcher}
        initialOrdering="-id"
        selectable={hasPermission('users.delete')}
  onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
        renderRowActions={(u) => (
          <div className="flex space-x-3">
            {hasPermission('users.change') && (
              <button onClick={() => setEditingUser(u)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
            )}
            {hasPermission('users.delete') && (
              <button onClick={() => handleDelete(u)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
            )}
          </div>
        )}
        onBulkDelete={hasPermission('users.delete') ? handleBulkDelete : undefined}
        refreshKey={refreshKey}
      />
    </div>
  );
};

export default AdminUsersManagement;
