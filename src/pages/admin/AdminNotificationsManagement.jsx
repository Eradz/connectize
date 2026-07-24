import React, { useState, useEffect } from 'react';
import DataTable from './components/DataTable';
import StatsCard from './components/StatsCard';
import Modal from './components/Modal';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { NotificationIcon, EmailIcon, SettingsIcon, CalendarIcon } from "../../components/ui/ModernIcon";
import { getNotificationsForUser as getNotifications, markNotificationAsRead, deleteNotification, createNotification } from '../../api-services/notifications';
import { makeApiRequest } from '../../lib/helpers';
import { confirmDialog } from '../../lib/confirm.jsx';

const AdminNotificationsManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.results || data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalNotifications = notifications.length;
  const unreadNotifications = notifications.filter(notification => !notification.is_read).length;
  const systemNotifications = notifications.filter(notification => notification.type === 'system').length;
  const todayNotifications = notifications.filter(notification => {
    const today = new Date().toDateString();
    const ts = notification.timestamp || notification.created_at;
    return ts ? new Date(ts).toDateString() === today : false;
  }).length;

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      // Include alternate fields in search (subject)
      searchAccessor: (n) => n?.title || n?.subject || '',
      render: (notification) => (
        <div className={`${!notification.is_read ? 'font-semibold' : 'font-normal'}`}>
          {notification.title || notification.subject || 'No Title'}
        </div>
      )
    },
    {
      key: 'message',
      label: 'Message Preview',
      // Include alternate fields in search (content)
      searchAccessor: (n) => n?.message || n?.content || '',
      render: (notification) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {notification.message || notification.content || 'No message'}
        </div>
      )
    },
    {
      key: 'recipient',
      label: 'Recipient',
      sortable: true,
      // Search on nested recipient name/username/email
      searchAccessor: (n) => {
        const r = n?.recipient || {};
        const name = r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : '';
        return [
          name,
          r.username,
          r.email,
          n?.recipient_name,
          n?.recipient_email,
        ].filter(Boolean).join(' ').trim();
      },
      render: (notification) => (
        <div>
          <div className="font-medium text-gray-900">
            {notification.recipient?.first_name && notification.recipient?.last_name 
              ? `${notification.recipient.first_name} ${notification.recipient.last_name}`
              : notification.recipient?.username || notification.recipient_name || 'All Users'
            }
          </div>
          <div className="text-sm text-gray-500">
            {notification.recipient?.email || notification.recipient_email || ''}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
    render: (notification) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
      (notification.type || notification.notification_type) === 'system' ? 'bg-purple-100 text-purple-800' :
      (notification.type || notification.notification_type) === 'warning' ? 'bg-yellow-100 text-yellow-800' :
      (notification.type || notification.notification_type) === 'error' ? 'bg-red-100 text-red-800' :
      (notification.type || notification.notification_type) === 'success' ? 'bg-green-100 text-green-800' :
          'bg-blue-100 text-blue-800'
        }`}>
      {notification.type || notification.notification_type || 'info'}
        </span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (notification) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          notification.priority === 'high' ? 'bg-red-100 text-red-800' :
          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {notification.priority || 'low'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (notification) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          notification.is_read
            ? 'bg-gray-100 text-gray-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {notification.is_read ? 'Read' : 'Unread'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (notification) => (
        <div className="text-sm text-gray-900">
          {new Date(notification.timestamp || notification.created_at).toLocaleDateString()}
          <div className="text-xs text-gray-500">
            {new Date(notification.timestamp || notification.created_at).toLocaleTimeString()}
          </div>
        </div>
      )
    }
  ];

  const notificationFields = [
    {
      name: 'title',
      label: 'Notification Title',
      type: 'text',
      required: true,
      placeholder: 'Enter notification title'
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
      rows: 4,
      placeholder: 'Enter notification message'
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        { value: 'info', label: 'Information' },
        { value: 'success', label: 'Success' },
        { value: 'warning', label: 'Warning' },
        { value: 'error', label: 'Error' },
        { value: 'system', label: 'System' }
      ]
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ]
    },
    {
      name: 'recipient_type',
      label: 'Send To',
      type: 'select',
      options: [
        { value: 'all', label: 'All Users' },
        { value: 'specific', label: 'Specific User' },
        { value: 'role', label: 'User Role' }
      ]
    },
    {
      name: 'recipient_id',
      label: 'Recipient ID (if specific user)',
      type: 'number',
      placeholder: 'Enter user ID'
    },
    {
      name: 'expires_at',
      label: 'Expiration Date',
      type: 'datetime-local'
    },
    {
      name: 'action_url',
      label: 'Action URL',
      type: 'url',
      placeholder: 'https://example.com/action'
    },
    {
      name: 'action_text',
      label: 'Action Button Text',
      type: 'text',
      placeholder: 'e.g., View Details, Take Action'
    }
  ];

  const handleCreate = () => {
    setSelectedNotification(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleView = (notification) => {
    setSelectedNotification(notification);
    setModalMode('view');
    setShowModal(true);
    
    // Mark as read if unread
    if (!notification.is_read) {
      markNotificationAsRead(notification.id).then(() => {
        fetchNotifications();
      }).catch(console.error);
    }
  };

  const handleDelete = async (notification) => {
    const ok = await confirmDialog({ title: 'Delete Notification', message: 'Are you sure you want to delete this notification?', confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await deleteNotification(notification.id);
      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    const ok = await confirmDialog({ title: 'Delete Selected Notifications', message: `Are you sure you want to delete ${selectedItems.length} notifications?`, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      for (const id of selectedItems) {
        await deleteNotification(id);
      }
      setSelectedItems([]);
      await fetchNotifications();
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
      alert('Failed to delete notifications');
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      for (const notificationId of selectedItems) {
        await markNotificationAsRead(notificationId);
      }
      setSelectedItems([]);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      alert('Failed to mark notifications as read');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await createNotification(formData);
      setShowModal(false);
      await fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const getActions = (notification) => [
    {
      label: 'View Details',
      onClick: () => handleView(notification),
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: notification.is_read ? 'Mark as Unread' : 'Mark as Read',
      onClick: async () => {
        try {
          await markNotificationAsRead(notification.id, !notification.is_read);
          await fetchNotifications();
        } catch (error) {
          console.error('Error updating notification status:', error);
          alert('Failed to update notification status');
        }
      },
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Delete',
      onClick: () => handleDelete(notification),
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Notifications Management"
        subtitle="Create, monitor and manage platform notifications"
        actions={
          <div className="flex gap-2">
            <Button variant="minimal" onClick={() => fetchNotifications()}>Refresh</Button>
            <Button onClick={handleCreate}>Send Notification</Button>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Notifications"
          value={totalNotifications}
          icon={<NotificationIcon size={24} aria-hidden="true" />}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Unread Notifications"
          value={unreadNotifications}
          subtitle={`${totalNotifications > 0 ? Math.round((unreadNotifications / totalNotifications) * 100) : 0}% unread`}
          icon={<EmailIcon size={24} aria-hidden="true" />}
          color="red"
          loading={loading}
        />
        <StatsCard
          title="System Notifications"
          value={systemNotifications}
          subtitle={`${totalNotifications > 0 ? Math.round((systemNotifications / totalNotifications) * 100) : 0}% system`}
          icon={<SettingsIcon size={24} aria-hidden="true" />}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="Today's Notifications"
          value={todayNotifications}
          icon={<CalendarIcon size={24} aria-hidden="true" />}
          color="green"
          loading={loading}
        />
      </div>

      {/* Notifications Table */}
      <DataTable
        data={notifications}
        columns={columns}
        loading={loading}
        onEdit={handleView}
        onDelete={handleDelete}
        getActions={getActions}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        bulkActions={[
          {
            label: 'Mark as Read',
            onClick: handleBulkMarkAsRead,
            className: 'text-green-600 hover:text-green-900'
          },
          {
            label: 'Delete Selected',
            onClick: handleBulkDelete,
            className: 'text-red-600 hover:text-red-900',
            confirmMessage: 'Are you sure you want to delete the selected notifications?'
          }
        ]}
        searchFields={['title', 'message', 'type', 'recipient.username']}
        filterFields={[
          {
            key: 'type',
            label: 'Type',
            type: 'select',
            options: [
              { value: '', label: 'All Types' },
              { value: 'info', label: 'Information' },
              { value: 'success', label: 'Success' },
              { value: 'warning', label: 'Warning' },
              { value: 'error', label: 'Error' },
              { value: 'system', label: 'System' }
            ]
          },
          {
            key: 'priority',
            label: 'Priority',
            type: 'select',
            options: [
              { value: '', label: 'All Priorities' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]
          },
          {
            key: 'is_read',
            label: 'Status',
            type: 'select',
            options: [
              { value: '', label: 'All Notifications' },
              { value: 'false', label: 'Unread Only' },
              { value: 'true', label: 'Read Only' }
            ]
          }
        ]}
      />

      {/* Notification Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Send New Notification' : 'Notification Details'}
        size="lg"
      >
        {modalMode === 'create' ? (
          <Modal.Form
            fields={notificationFields}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
            submitLabel="Send Notification"
          />
        ) : selectedNotification && (
          <div className="space-y-4">
            {/* Notification Header */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedNotification.title || 'No Title'}
                  </h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(selectedNotification.timestamp || selectedNotification.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (selectedNotification.type || selectedNotification.notification_type) === 'system' ? 'bg-purple-100 text-purple-800' :
                    (selectedNotification.type || selectedNotification.notification_type) === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    (selectedNotification.type || selectedNotification.notification_type) === 'error' ? 'bg-red-100 text-red-800' :
                    (selectedNotification.type || selectedNotification.notification_type) === 'success' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedNotification.type || selectedNotification.notification_type || 'info'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedNotification.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedNotification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedNotification.priority || 'low'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recipient Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
              <div className="text-sm text-gray-900">
                {selectedNotification.recipient?.first_name && selectedNotification.recipient?.last_name 
                  ? `${selectedNotification.recipient.first_name} ${selectedNotification.recipient.last_name}`
                  : selectedNotification.recipient?.username || selectedNotification.recipient_name || 'All Users'
                }
              </div>
              <div className="text-xs text-gray-500">
                {selectedNotification.recipient?.email || selectedNotification.recipient_email || ''}
              </div>
            </div>

            {/* Notification Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedNotification.message || selectedNotification.content || 'No message'}
                </div>
              </div>
            </div>

            {/* Action URL */}
            {selectedNotification.action_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <a
                  href={selectedNotification.action_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
                >
                  {selectedNotification.action_text || 'View Details'}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={async () => {
                  try {
                    await markNotificationAsRead(selectedNotification.id, !selectedNotification.is_read);
                    await fetchNotifications();
                    setShowModal(false);
                  } catch (error) {
                    console.error('Error updating notification status:', error);
                    alert('Failed to update notification status');
                  }
                }}
                className="px-4 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow"
              >
                Mark as {selectedNotification.is_read ? 'Unread' : 'Read'}
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedNotification);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminNotificationsManagement;
