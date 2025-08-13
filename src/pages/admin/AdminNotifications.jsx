import React, { useState, useEffect } from 'react';
import { useAuth, useAdminData } from './ComprehensiveAdmin';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import TextInput, { Textarea } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { WarningIcon, CheckIcon, MegaphoneIcon, ChartIcon } from "../../components/ui/ModernIcon";
import { confirmDialog } from '../../lib/confirm.jsx';

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

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchNotifications = async (params) => {
    try {
      const qs = new URLSearchParams({
        page: String(params.page),
        page_size: String(params.pageSize),
        ...(params.search ? { search: params.search } : {}),
        ...(params.ordering ? { ordering: params.ordering } : {}),
        ...(typeof params.is_read === 'boolean' ? { is_read: String(params.is_read) } : {}),
      }).toString();
      const res = await makeApiRequest(`/notifications/?${qs}`);
      if (res.success) {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.results || []);
        const count = Number.isFinite(data?.count) ? data.count : list.length;
        return { items: list, count: count };
      }
      return { items: [], count: 0 };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { items: [], count: 0 };
    }
  };

  // Loader
  const loadNotifications = async ({ page: nextPage = page, pageSize: nextSize = pageSize } = {}) => {
    try {
      setLoading(true);
      setError('');
      const serverParams = {
        page: nextPage,
        pageSize: nextSize,
        search: (searchTerm || '').trim(),
        ...(filterStatus === 'read' ? { is_read: true } : filterStatus === 'unread' ? { is_read: false } : {}),
      };
      const { items, count } = await fetchNotifications(serverParams);
      setNotifications(items);
      setTotal(count);
      if (nextPage !== page) setPage(nextPage);
      if (nextSize !== pageSize) setPageSize(nextSize);
      setSelected([]);
    } catch (e) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification) => {
    try {
      await makeApiRequest(`/notifications/${notification.id}/mark-as-read/`, { method: 'POST' });
      await refreshUnreadCount();
      setRefreshKey(prev => prev + 1);
      addToast('Notification marked as read', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to mark as read', 'error');
    }
  };

  const handleDelete = async (notification) => {
    const id = typeof notification === 'object' ? notification?.id : notification;
    const confirmed = await confirmDialog({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      confirmText: 'Delete',
      confirmVariant: 'danger'
    });

    if (confirmed) {
      try {
        await makeApiRequest(`/notifications/${id}/`, { method: 'DELETE' });
        setRefreshKey(prev => prev + 1);
        addToast('Notification deleted successfully', 'success');
      } catch (error) {
        addToast('Failed to delete notification', 'error');
      }
    }
  };

  const handleBulkDelete = async (selectedIds) => {
    const confirmed = await confirmDialog({
      title: 'Delete Notifications',
      message: `Are you sure you want to delete ${selectedIds.length} notification(s)?`,
      confirmText: 'Delete',
      confirmVariant: 'danger'
    });

    if (confirmed) {
      try {
        await Promise.all(selectedIds.map(id => 
          makeApiRequest(`/notifications/${id}/`, { method: 'DELETE' })
        ));
        setRefreshKey(prev => prev + 1);
        addToast(`${selectedIds.length} notification(s) deleted successfully`, 'success');
      } catch (error) {
        addToast('Failed to delete some notifications', 'error');
      }
    }
  };

  const renderRowActions = (notification) => (
    <div className="flex items-center gap-2">
      {!notification.is_read && hasPermission('notifications.change') && (
        <Button
          variant="minimal"
          size="sm"
          onClick={() => handleMarkAsRead(notification)}
          className="text-green-600 hover:text-green-700"
        >
          <CheckIcon size={16} />
        </Button>
      )}
      {hasPermission('notifications.delete') && (
        <Button
          variant="minimal"
          size="sm"
          onClick={() => handleDelete(notification)}
          className="text-red-600 hover:text-red-700"
        >
          <WarningIcon size={16} />
        </Button>
      )}
    </div>
  );

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      key: 'title',
      label: 'Notification',
      sortable: true,
      render: (notification) => (
        <div>
          <div className="font-medium text-gray-900">{notification.title || 'Notification'}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
        </div>
      )
    },
    {
      key: 'is_read',
      label: 'Status',
      render: (notification) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          notification.is_read ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
        }`}>
          {notification.is_read ? 'Read' : 'Unread'}
        </span>
      )
    },
    {
      key: 'timestamp',
      label: 'Created',
      sortable: true,
      render: (notification) => (
        <div className="text-sm text-gray-900">
          {new Date(notification.timestamp).toLocaleDateString()}
        </div>
      )
    }
  ];

  // route awareness for create form
  useEffect(() => {
    if (location.pathname.endsWith('/admin/notifications/create') || location.pathname.endsWith('/notifications/create')) {
      setShowCreate(true);
      setActiveTab('list');
    } else {
      setShowCreate(false);
    }
  }, [location.pathname]);

  // initial and reactive load
  useEffect(() => {
    loadNotifications({ page: 1, pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    loadNotifications({ page, pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filterStatus, searchTerm]);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await makeApiRequest('/notifications/', { method: 'POST', body: JSON.stringify(form) });
      if (res.success) {
        addToast('Notification created', 'success');
        setForm({ title: '', message: '' });
        setRefreshKey(prev => prev + 1);
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
              { id: 'overview', name: 'Overview', Icon: ChartIcon },
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
                                    onClick={(e) => { e.stopPropagation(); handleDelete(n); }}
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
