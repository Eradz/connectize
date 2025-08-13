import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/admin/DataTable';
import StatsCard from '../../components/admin/dashboard/StatsCard';
import { ChatBubbleLeftRightIcon, EnvelopeOpenIcon, EnvelopeIcon, CalendarDaysIcon, ArrowPathIcon, TrashIcon, PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import Modal from './components/Modal';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useAdminData } from './ComprehensiveAdmin';
import { confirmDialog } from '../../lib/confirm.jsx';
import Avatar from '../../components/ui/Avatar';

const AdminMessagesManagement = () => {
  const { fetchData, addToast } = useAdminData();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetcher = async (params) => {
    setLoading(true);
    try {
      const result = await fetchData(`/chat/messages/?${params.toString()}`, 'messages');
      if (result.success) {
        // The backend sends `sender_info` and `recipient_info`
        const normalizedData = result.data.results.map(msg => ({
          ...msg,
          sender: msg.sender_info,
          recipient: msg.recipient_info,
          is_read: !!msg.read_at,
          created_at: msg.timestamp,
        }));
        return { data: normalizedData, total: result.data.count };
      } else {
        addToast(result.error || 'Failed to fetch messages.', 'error');
        return { data: [], total: 0 };
      }
    } catch (error) {
      addToast(error.message, 'error');
      return { data: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    // These would ideally come from a separate stats endpoint
    // For now, we'll use placeholder values.
    return {
      total: '...',
      unread: '...',
      read: '...',
      today: '...',
    };
  }, []);

  const handleAction = async (action, messageId, payload = {}) => {
    const endpoints = {
      delete: { url: `/chat/messages/${messageId}/`, method: 'DELETE' },
      update: { url: `/chat/messages/${messageId}/`, method: 'PATCH', body: payload },
      mark_read: { url: `/chat/messages/${messageId}/mark-as-read/`, method: 'POST' },
    };

    try {
      const { url, method, body } = endpoints[action];
      const result = await fetchData(url, 'messages', { method, body });
      if (result.success) {
        addToast(`Message ${action === 'delete' ? 'deleted' : 'updated'} successfully.`, 'success');
        return true;
      } else {
        addToast(result.error || `Failed to ${action} message.`, 'error');
        return false;
      }
    } catch (error) {
      addToast(error.message, 'error');
      return false;
    }
  };

  const columns = useMemo(() => [
    {
      key: 'sender',
      label: 'From',
      render: (msg) => (
        <div className="flex items-center space-x-3">
          <Avatar user={msg.sender} size="sm" />
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{msg.sender?.display_name || 'Unknown User'}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{msg.sender?.email || 'No email'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'recipient',
      label: 'To',
      render: (msg) => (
        <div className="flex items-center space-x-3">
          <Avatar user={msg.recipient} size="sm" />
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{msg.recipient?.display_name || 'Unknown User'}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{msg.recipient?.email || 'No email'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'content',
      label: 'Message',
      render: (msg) => <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm truncate">{msg.content}</p>,
    },
    {
      key: 'is_read',
      label: 'Status',
      render: (msg) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          msg.is_read
            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
        }`}>
          {msg.is_read ? 'Read' : 'Unread'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (msg) => <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(msg.created_at).toLocaleString()}</div>,
    },
  ], []);

  const rowActions = (message, reload) => [
    { label: 'View', icon: EyeIcon, onClick: () => { setSelectedMessage(message); setModalOpen(true); } },
    { label: 'Edit', icon: PencilSquareIcon, onClick: async () => {
        const newContent = prompt('Enter new message content:', message.content);
        if (newContent && newContent !== message.content) {
            const success = await handleAction('update', message.id, { content: newContent });
            if (success) reload();
        }
    }},
    { label: 'Delete', icon: TrashIcon, onClick: async () => {
        const ok = await confirmDialog({ title: 'Delete Message', message: 'Are you sure you want to delete this message?' });
        if (ok) {
            const success = await handleAction('delete', message.id);
            if (success) reload();
        }
    }},
  ];

  const bulkActions = (selectedIds, reload) => [
    { label: 'Mark as Read', onClick: async () => {
        for (const id of selectedIds) await handleAction('mark_read', id);
        reload();
    }},
    { label: 'Delete Selected', onClick: async () => {
        const ok = await confirmDialog({ title: 'Bulk Delete', message: `Delete ${selectedIds.length} messages?` });
        if (ok) {
            for (const id of selectedIds) await handleAction('delete', id);
            reload();
        }
    }},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages Management"
        subtitle="Monitor and manage all platform messages and communications."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Messages" value={stats.total} icon={ChatBubbleLeftRightIcon} color="blue" loading={loading} />
        <StatsCard title="Unread Messages" value={stats.unread} icon={EnvelopeIcon} color="orange" loading={loading} />
        <StatsCard title="Read Messages" value={stats.read} icon={EnvelopeOpenIcon} color="green" loading={loading} />
        <StatsCard title="Today's Messages" value={stats.today} icon={CalendarDaysIcon} color="purple" loading={loading} />
      </div>

      <DataTable
        fetcher={fetcher}
        columns={columns}
        rowActions={rowActions}
        bulkActions={bulkActions}
        searchPlaceholder="Search by user or content..."
      />

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Message Details">
        {selectedMessage && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">From</label>
                    <div className="flex items-center space-x-3 mt-1">
                        <Avatar user={selectedMessage.sender} size="sm" />
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedMessage.sender?.display_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedMessage.sender?.email}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">To</label>
                     <div className="flex items-center space-x-3 mt-1">
                        <Avatar user={selectedMessage.recipient} size="sm" />
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedMessage.recipient?.display_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedMessage.recipient?.email}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Message</label>
              <div className="mt-1 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {selectedMessage.content}
              </div>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
              Sent on {new Date(selectedMessage.created_at).toLocaleString()}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminMessagesManagement;
