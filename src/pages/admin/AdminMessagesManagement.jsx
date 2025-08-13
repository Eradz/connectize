import React, { useState, useEffect } from 'react';
import DataTable from './components/DataTable';
import StatsCard from './components/StatsCard';
import Modal from './components/Modal';
import { getMessagesForUser as getMessages, markMessageAsRead, bulkDeleteMessages } from '../../api-services/messaging';
import { makeApiRequest } from '../../lib/helpers';
import { confirmDialog } from '../../lib/confirm.jsx';

const AdminMessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages();
      setMessages(data.results || data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalMessages = messages.length;
  const unreadMessages = messages.filter(message => !message.is_read).length;
  const readMessages = messages.filter(message => message.is_read).length;
  const todayMessages = messages.filter(message => {
    const today = new Date().toDateString();
    return new Date(message.created_at).toDateString() === today;
  }).length;

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      key: 'sender',
      label: 'From',
      sortable: true,
      render: (message) => (
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            !message.is_read ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <span className="text-sm font-medium">
              {message.sender?.first_name?.[0] || message.sender?.username?.[0] || message.sender_name?.[0] || '?'}
            </span>
          </div>
          <div>
            <div className={`font-medium ${!message.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
              {message.sender?.first_name && message.sender?.last_name 
                ? `${message.sender.first_name} ${message.sender.last_name}`
                : message.sender?.username || message.sender_name || 'Unknown'
              }
            </div>
            <div className="text-sm text-gray-500">
              {message.sender?.email || message.sender_email || ''}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'recipient',
      label: 'To',
      sortable: true,
      render: (message) => (
        <div>
          <div className="font-medium text-gray-900">
            {message.recipient?.first_name && message.recipient?.last_name 
              ? `${message.recipient.first_name} ${message.recipient.last_name}`
              : message.recipient?.username || message.recipient_name || 'Unknown'
            }
          </div>
          <div className="text-sm text-gray-500">
            {message.recipient?.email || message.recipient_email || ''}
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (message) => (
        <div className={`${!message.is_read ? 'font-semibold' : 'font-normal'}`}>
          {message.subject || 'No Subject'}
        </div>
      )
    },
    {
      key: 'content',
      label: 'Message Preview',
      render: (message) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {message.content || message.message || 'No content'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (message) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          message.is_read
            ? 'bg-gray-100 text-gray-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {message.is_read ? 'Read' : 'Unread'}
        </span>
      )
    },
    {
      key: 'message_type',
      label: 'Type',
      render: (message) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          message.message_type === 'system' ? 'bg-purple-100 text-purple-800' :
          message.message_type === 'notification' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {message.message_type || 'message'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Sent',
      sortable: true,
      render: (message) => (
        <div className="text-sm text-gray-900">
          {new Date(message.created_at).toLocaleDateString()}
          <div className="text-xs text-gray-500">
            {new Date(message.created_at).toLocaleTimeString()}
          </div>
        </div>
      )
    }
  ];

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    
    // Mark as read if unread
    if (!message.is_read) {
      markMessageAsRead(message.id).then(() => {
        fetchMessages();
      }).catch(console.error);
    }
  };

  const handleDelete = async (message) => {
    const ok = await confirmDialog({ title: 'Delete Message', message: 'Are you sure you want to delete this message?', confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      // Fallback: use bulk-delete for single id to keep endpoints consistent
      await bulkDeleteMessages([message.id]);
      await fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    const ok = await confirmDialog({ title: 'Delete Selected Messages', message: `Are you sure you want to delete ${selectedItems.length} messages?`, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await bulkDeleteMessages(selectedItems);
      setSelectedItems([]);
      await fetchMessages();
    } catch (error) {
      console.error('Error bulk deleting messages:', error);
      alert('Failed to delete messages');
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      for (const messageId of selectedItems) {
        await markMessageAsRead(messageId);
      }
      setSelectedItems([]);
      await fetchMessages();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      alert('Failed to mark messages as read');
    }
  };

  const getActions = (message) => [
    {
      label: 'View Message',
      onClick: () => handleViewMessage(message),
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: message.is_read ? 'Mark as Unread' : 'Mark as Read',
      onClick: async () => {
        try {
          await markMessageAsRead(message.id, !message.is_read);
          await fetchMessages();
        } catch (error) {
          console.error('Error updating message status:', error);
          alert('Failed to update message status');
        }
      },
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Delete',
      onClick: () => handleDelete(message),
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages Management</h1>
          <p className="text-gray-600">Monitor and manage all platform messages and communications</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchMessages()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Messages"
          value={totalMessages}
          icon="💬"
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Unread Messages"
          value={unreadMessages}
          subtitle={`${totalMessages > 0 ? Math.round((unreadMessages / totalMessages) * 100) : 0}% unread`}
          icon="🔔"
          color="red"
          loading={loading}
        />
        <StatsCard
          title="Read Messages"
          value={readMessages}
          subtitle={`${totalMessages > 0 ? Math.round((readMessages / totalMessages) * 100) : 0}% read`}
          icon="✅"
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Today's Messages"
          value={todayMessages}
          icon="📅"
          color="purple"
          loading={loading}
        />
      </div>

      {/* Messages Table */}
      <DataTable
        data={messages}
        columns={columns}
        loading={loading}
        onEdit={handleViewMessage}
        onDelete={handleDelete}
        getActions={getActions}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        bulkActions={[
          { label: 'Mark as Read', onClick: handleBulkMarkAsRead, className: 'px-3 py-1 text-sm border rounded hover:bg-gray-50' },
          { label: 'Delete Selected', onClick: handleBulkDelete, className: 'px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700' },
        ]}
      />

      {/* Message Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Message Details"
        size="lg"
      >
        {selectedMessage && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedMessage.subject || 'No Subject'}</h3>
                <p className="text-xs text-gray-500">Sent {new Date(selectedMessage.created_at).toLocaleString()}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                selectedMessage.is_read ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedMessage.is_read ? 'Read' : 'Unread'}
              </span>
            </div>

            {/* Sender/Recipient Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="text-sm text-gray-900">
                  {selectedMessage.sender?.first_name && selectedMessage.sender?.last_name
                    ? `${selectedMessage.sender.first_name} ${selectedMessage.sender.last_name}`
                    : selectedMessage.sender?.username || selectedMessage.sender_name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedMessage.sender?.email || selectedMessage.sender_email || ''}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="text-sm text-gray-900">
                  {selectedMessage.recipient?.first_name && selectedMessage.recipient?.last_name
                    ? `${selectedMessage.recipient.first_name} ${selectedMessage.recipient.last_name}`
                    : selectedMessage.recipient?.username || selectedMessage.recipient_name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedMessage.recipient?.email || selectedMessage.recipient_email || ''}
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedMessage.content || selectedMessage.message || 'No content'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={async () => {
                  try {
                    await markMessageAsRead(selectedMessage.id, !selectedMessage.is_read);
                    await fetchMessages();
                    setShowModal(false);
                  } catch (error) {
                    console.error('Error updating message status:', error);
                    alert('Failed to update message status');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mark as {selectedMessage.is_read ? 'Unread' : 'Read'}
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedMessage);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Message
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

export default AdminMessagesManagement;
