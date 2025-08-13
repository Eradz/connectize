import React, { useState, useEffect } from 'react';
import { useAuth, useAdminData } from './ComprehensiveAdmin';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import TextInput, { Textarea } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { ChartBarIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

// Notification Management (Live API only)
const AdminNotifications = () => {
  const { hasPermission } = useAuth();
  const { makeApiRequest, addToast, refreshUnreadCount, unreadNotificationsCount } = useAdminData();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Default to list so items are visible immediately
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  // pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // selection
  const [selected, setSelected] = useState([]);

  // create form state (route-aware)
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });

  const loadNotifications = async (opts = {}) => {
    setLoading(true);
    setError('');
    const nextPage = opts.page ?? page;
    const nextSize = opts.pageSize ?? pageSize;
    const params = new URLSearchParams({ page: String(nextPage), page_size: String(nextSize) });
    // server filter for status if supported
    if (filterStatus === 'read') params.set('is_read', 'true');
    if (filterStatus === 'unread') params.set('is_read', 'false');
    if (searchTerm && searchTerm.trim()) params.set('search', searchTerm.trim());
    try {
      const res = await makeApiRequest(`/notifications/?${params.toString()}`);
      if (res.success) {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.results || []);
        setNotifications(list);
        setTotal(Number.isFinite(data?.count) ? data.count : list.length);
        setPage(nextPage);
        setPageSize(nextSize);
        setSelected([]);
      } else {
        setNotifications([]);
        setTotal(0);
        setError(res.error || 'Failed to load notifications');
      }
    } catch (e) {
      setError(e.message);
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  // Debounce server-side search
  useEffect(() => {
    const id = setTimeout(() => loadNotifications({ page: 1 }), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // route awareness for create form
  useEffect(() => {
    if (location.pathname.endsWith('/admin/notifications/create') || location.pathname.endsWith('/notifications/create')) {
      setShowCreate(true);
      setActiveTab('list');
    } else {
      setShowCreate(false);
    }
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await makeApiRequest('/notifications/mark-all-as-read/', { method: 'POST' });
      await loadNotifications({ page });
      await refreshUnreadCount();
      addToast('All notifications marked as read', 'success');
    } catch (e) {
      addToast(e.message || 'Failed to mark all as read', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return;
    try {
      await makeApiRequest(`/notifications/${id}/hard-delete/`, { method: 'DELETE' });
      await loadNotifications({ page });
      await refreshUnreadCount();
      addToast('Notification deleted', 'success');
    } catch (e) {
      addToast(e.message || 'Failed to delete notification', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await makeApiRequest('/notifications/', { method: 'POST', body: JSON.stringify(form) });
      if (res.success) {
        addToast('Notification created', 'success');
        setForm({ title: '', message: '' });
        await loadNotifications({ page: 1 });
        await refreshUnreadCount();
      } else {
        addToast(res.error || 'Failed to create notification', 'error');
      }
    } catch (e) {
      addToast(e.message || 'Failed to create notification', 'error');
    }
  };

  const filtered = notifications.filter((n) => {
    const txt = `${n.title || ''} ${n.message || ''}`.toLowerCase();
    const matchesSearch = txt.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'read' ? !!n.is_read : !n.is_read);
    return matchesSearch && matchesStatus;
  });

  // Use server totals where possible; global unread from context to avoid confusion
  const stats = {
    total,
    unread: unreadNotificationsCount,
    read: Math.max(0, (Number.isFinite(total) ? total : 0) - (Number.isFinite(unreadNotificationsCount) ? unreadNotificationsCount : 0)),
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map(n => n.id));
  };

  const bulkMarkRead = async () => {
    if (selected.length === 0) return;
    try {
      for (const id of selected) {
        await makeApiRequest(`/notifications/${id}/mark-as-read/`, { method: 'POST' });
      }
      addToast('Selected notifications marked as read', 'success');
      await loadNotifications({ page });
      await refreshUnreadCount();
    } catch (e) {
      addToast(e.message || 'Failed to update selected', 'error');
    }
  };

  const bulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} notifications? This cannot be undone.`)) return;
    try {
      for (const id of selected) {
        await makeApiRequest(`/notifications/${id}/hard-delete/`, { method: 'DELETE' });
      }
      addToast('Selected notifications deleted', 'success');
      await loadNotifications({ page });
      await refreshUnreadCount();
    } catch (e) {
      addToast(e.message || 'Failed to delete selected', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Manage user notifications from the Django API</p>
          </div>
          <div className="flex items-center gap-3">
            {hasPermission('notifications.change') && (
              <Button variant="secondary" onClick={handleMarkAllRead}>Mark all as read</Button>
            )}
            <Button onClick={() => loadNotifications({ page })}>Refresh</Button>
          </div>
        </div>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Unread</p>
          <p className="text-3xl font-bold">{stats.unread}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Read</p>
          <p className="text-3xl font-bold">{stats.read}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', Icon: ChartBarIcon },
              { id: 'list', name: 'All Notifications', Icon: MegaphoneIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.Icon && <tab.Icon className="h-5 w-5 inline" aria-hidden="true" />}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className="flex items-center justify-between bg-white p-4 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/notifications/${n.id}`)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{n.title || 'Notification'}</p>
                        <p className="text-sm text-gray-600">{n.message}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${n.is_read ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                        {n.is_read ? 'read' : 'unread'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                {hasPermission('notifications.change') && (
                  <button onClick={handleMarkAllRead} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Mark all as read</button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Create form when routed to /create */}
              {showCreate && hasPermission('notifications.add') && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Create Notification</h3>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} required />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Create</Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <TextInput
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={filterStatus}
                  onChange={async (e) => { setFilterStatus(e.target.value); await loadNotifications({ page: 1 }); await refreshUnreadCount(); }}
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </Select>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Page size</label>
                  <Select
                    value={pageSize}
                    onChange={(e) => loadNotifications({ page: 1, pageSize: Number(e.target.value) })}
                  >
                    {[10,20,50,100].map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
              </div>

              {/* Bulk actions banner */}
              {selected.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">{selected.length} selected</span>
                  <div className="space-x-2">
                    {hasPermission('notifications.change') && (
                      <Button size="sm" variant="secondary" onClick={bulkMarkRead}>Mark read</Button>
                    )}
                    {hasPermission('notifications.delete') && (
                      <Button size="sm" variant="danger" onClick={bulkDelete}>Delete</Button>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading notifications...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={toggleSelectAll} checked={selected.length > 0 && selected.length === filtered.length} />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notification</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filtered.map((n) => (
                          <tr
                            key={n.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/admin/notifications/${n.id}`)}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                checked={selected.includes(n.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleSelect(n.id)}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{n.title || 'Notification'}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{n.message}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${n.is_read ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                {n.is_read ? 'read' : 'unread'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(n.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {!n.is_read && hasPermission('notifications.change') && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        await makeApiRequest(`/notifications/${n.id}/mark-as-read/`, { method: 'POST' });
                                        await loadNotifications({ page });
                                        await refreshUnreadCount();
                                        addToast('Notification marked as read', 'success');
                                      } catch (e) {
                                        addToast(e.message || 'Failed to mark as read', 'error');
                                      }
                                    }}
                                  >
                                    Mark Read
                                  </Button>
                                )}
                                {hasPermission('notifications.delete') && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
                <div className="space-x-2">
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => loadNotifications({ page: 1 })}>First</Button>
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => loadNotifications({ page: Math.max(1, page - 1) })}>Prev</Button>
                  <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => loadNotifications({ page: page + 1 })}>Next</Button>
                  <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => loadNotifications({ page: totalPages })}>Last</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
