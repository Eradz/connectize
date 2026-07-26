import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdminData, useAuth } from '../ComprehensiveAdmin';
import { getUserDisplayName } from '../../../lib/userDisplay';

const AdminNotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { makeApiRequest, addToast, refreshUnreadCount } = useAdminData();
  const { hasPermission } = useAuth();
  const [notification, setNotification] = useState(null);
  const [sender, setSender] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUser = useCallback(async (userId, setter) => {
    if (!userId) return;
    try {
      const res = await makeApiRequest(`/users/${userId}/`);
      if (res.success) setter(res.data);
    } catch (_) {
      // ignore hydration errors
    }
  }, [makeApiRequest]);

  const loadNotification = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await makeApiRequest(`/notifications/${id}/`);
      if (!res.success) {
        setError(res.error || 'Failed to load notification');
        setNotification(null);
        return;
      }
      const data = res.data;
      setNotification(data);
      // Hydrate related users if numeric IDs
      const recipientId = typeof data.user === 'number' ? data.user : data.user?.id;
      const senderId = typeof data.sender === 'number' ? data.sender : data.sender?.id;
      await Promise.all([
        loadUser(recipientId, setRecipient),
        loadUser(senderId, setSender)
      ]);
    } catch (e) {
      setError(e.message || 'Failed to load notification');
      setNotification(null);
    } finally {
      setLoading(false);
    }
  }, [id, makeApiRequest, loadUser]);

  useEffect(() => { loadNotification(); }, [loadNotification]);

  const handleMarkRead = async () => {
    try {
      const res = await makeApiRequest(`/notifications/${id}/mark-as-read/`, { method: 'POST' });
      if (res.success) {
        addToast('Notification marked as read', 'success');
  await refreshUnreadCount();
        await loadNotification();
      } else {
        addToast(res.error || 'Failed to mark as read', 'error');
      }
    } catch (e) {
      addToast(e.message || 'Failed to mark as read', 'error');
    }
  };

  const handleSoftDelete = async () => {
    if (!confirm('Delete this notification?')) return;
    try {
      const res = await makeApiRequest(`/notifications/${id}/delete/`, { method: 'POST' });
      if (res.success) {
        addToast('Notification deleted', 'success');
  await refreshUnreadCount();
        navigate('/admin/notifications');
      } else {
        addToast(res.error || 'Failed to delete', 'error');
      }
    } catch (e) {
      addToast(e.message || 'Failed to delete', 'error');
    }
  };

  const handleHardDelete = async () => {
    if (!confirm('Permanently delete this notification? This cannot be undone.')) return;
    try {
      const res = await makeApiRequest(`/notifications/${id}/hard-delete/`, { method: 'DELETE' });
      if (res.success) {
        addToast('Notification permanently deleted', 'success');
  await refreshUnreadCount();
        navigate('/admin/notifications');
      } else {
        addToast(res.error || 'Failed to delete permanently', 'error');
      }
    } catch (e) {
      addToast(e.message || 'Failed to delete permanently', 'error');
    }
  };

  const isRead = !!notification?.is_read;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Details</h1>
          <p className="text-gray-600">ID #{id}</p>
        </div>
        <div className="space-x-2">
          <Link to="/admin/notifications" className="px-4 py-2 border rounded-lg">Back to list</Link>
          {!isRead && hasPermission('notifications.change') && (
            <button onClick={handleMarkRead} className="px-4 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow">Mark as read</button>
          )}
          {hasPermission('notifications.change') && (
            <button onClick={handleSoftDelete} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">Delete</button>
          )}
          {hasPermission('notifications.delete') && (
            <button onClick={handleHardDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Hard Delete</button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notification...</p>
        </div>
      ) : notification ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{notification.title || 'Notification'}</h2>
                  <p className="text-gray-600 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isRead ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                  {isRead ? 'read' : 'unread'}
                </span>
              </div>
              {notification.message && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="whitespace-pre-wrap text-gray-800">{notification.message}</p>
                </div>
              )}
              {notification.link && (
                <div className="mt-4">
                  <a href={notification.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Open related link ↗</a>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Type</dt>
                  <dd className="font-medium">{notification.notification_type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Created</dt>
                  <dd className="font-medium">{new Date(notification.timestamp).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Read at</dt>
                  <dd className="font-medium">{notification.is_read ? new Date(notification.is_read).toLocaleString() : '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Deleted at</dt>
                  <dd className="font-medium">{notification.deleted_at ? new Date(notification.deleted_at).toLocaleString() : '—'}</dd>
                </div>
              </dl>
              {notification.extra_data && Object.keys(notification.extra_data || {}).length > 0 && (
                <div className="mt-4">
                  <dt className="text-sm text-gray-500 mb-1">Extra Data</dt>
                  <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-64">{JSON.stringify(notification.extra_data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recipient</p>
                  {recipient ? (
                    <Link to={`/admin/users/${recipient.id}`} className="text-blue-600 hover:underline">
                      {getUserDisplayName(recipient) || `User #${recipient.id}`}
                    </Link>
                  ) : (
                    <span className="text-gray-700">{typeof notification.user === 'number' ? `User #${notification.user}` : '—'}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Sender</p>
                  {sender ? (
                    <Link to={`/admin/users/${sender.id}`} className="text-blue-600 hover:underline">
                      {getUserDisplayName(sender) || `User #${sender.id}`}
                    </Link>
                  ) : (
                    <span className="text-gray-700">{typeof notification.sender === 'number' ? `User #${notification.sender}` : '—'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-600">No notification found.</div>
      )}
    </div>
  );
};

export default AdminNotificationDetail;
