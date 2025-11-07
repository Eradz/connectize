import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  UsersIcon,
  DocumentIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { dealRoomAPI } from '../../../api-services/dealRoom';
import Modal from '../components/Modal';

const AdminDeals = () => {
  const [activeTab, setActiveTab] = useState('deals');
  const [deals, setDeals] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [tabCounts, setTabCounts] = useState({
    deals: 0,
    participants: 0,
    documents: 0,
    milestones: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedItems([]);
    setCurrentPage(1);
    setSearchTerm('');
    setStatusFilter('all');
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleDealRoomClick = (dealRoomId) => {
    // Navigate to the specific deal room detail page
    window.open(`/deals/${dealRoomId}`, '_blank');
  };

  useEffect(() => {
    loadData();
    // Load counts for all tabs on component mount
    loadTabCounts();
  }, [activeTab, currentPage, statusFilter, searchTerm]);

  const loadTabCounts = async () => {
    try {
      // Load counts for all tabs to display in navigation
      const [dealsResponse, participantsResponse, documentsResponse, milestonesResponse] = await Promise.all([
        dealRoomAPI.getDealRooms({ page_size: 1 }), // Just get count
        dealRoomAPI.getAllParticipants({ page_size: 1 }),
        dealRoomAPI.getAllDocuments({ page_size: 1 }),
        dealRoomAPI.getAllMilestones({ page_size: 1 })
      ]);

      // Update counts without changing current data
      const dealCount = dealsResponse.data?.count || 0;
      const participantCount = participantsResponse.data?.count || 0;
      const documentCount = documentsResponse.data?.count || 0;
      const milestoneCount = milestonesResponse.data?.count || 0;

      // Update tab counts
      setTabCounts({
        deals: dealCount,
        participants: participantCount,
        documents: documentCount,
        milestones: milestoneCount
      });
    } catch (error) {
      console.error('Failed to load tab counts:', error);
      // Don't block the main functionality if counts fail
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      let response;
      
      if (activeTab === 'deals') {
        response = await dealRoomAPI.getDealRooms(params);
        setDeals(response.data?.results || []);
        setTotalItems(response.data?.count || 0);
      } else if (activeTab === 'participants') {
        response = await dealRoomAPI.getAllParticipants(params);
        setParticipants(response.data?.results || []);
        setTotalItems(response.data?.count || 0);
      } else if (activeTab === 'documents') {
        response = await dealRoomAPI.getAllDocuments(params);
        setDocuments(response.data?.results || []);
        setTotalItems(response.data?.count || 0);
      } else if (activeTab === 'milestones') {
        response = await dealRoomAPI.getAllMilestones(params);
        setMilestones(response.data?.results || []);
        setTotalItems(response.data?.count || 0);
      }
    } catch (error) {
      console.error('Failed to load deal room data:', error);
      // Set empty data on error but don't break the UI
      if (activeTab === 'deals') setDeals([]);
      else if (activeTab === 'participants') setParticipants([]);
      else if (activeTab === 'documents') setDocuments([]);
      else if (activeTab === 'milestones') setMilestones([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      let response;
      
      // Add default values based on entity type
      if (activeTab === 'milestones') {
        formData.created_by = 1; // Current user ID, should come from auth context
        formData.due_date = new Date(formData.due_date).toISOString();
      }
      
      if (activeTab === 'deals') {
        response = await dealRoomAPI.createDealRoom(formData);
      } else if (activeTab === 'participants') {
        // For participants, we might need to handle user creation or lookup
        response = await dealRoomAPI.createParticipant(formData);
      } else if (activeTab === 'documents') {
        response = await dealRoomAPI.createDocument(formData);
      } else if (activeTab === 'milestones') {
        response = await dealRoomAPI.createMilestone(formData);
      }
      
      setShowCreateModal(false);
      await loadData();
      await loadTabCounts();
      
      // Show success message
      alert(`${activeTab.slice(0, -1)} created successfully!`);
      console.log(`${activeTab.slice(0, -1)} created successfully:`, response);
    } catch (error) {
      console.error('Failed to create:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data || error.message || 'Unknown error';
      alert(`Failed to create ${activeTab.slice(0, -1)}: ${JSON.stringify(errorMsg)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      setLoading(true);
      let response;
      
      // Handle field conversions for updates
      if (activeTab === 'milestones' && formData.due_date) {
        formData.due_date = new Date(formData.due_date).toISOString();
      }
      
      if (activeTab === 'deals') {
        response = await dealRoomAPI.updateDealRoom(id, formData);
      } else if (activeTab === 'participants') {
        response = await dealRoomAPI.updateParticipant(id, formData);
      } else if (activeTab === 'documents') {
        response = await dealRoomAPI.updateDocument(id, formData);
      } else if (activeTab === 'milestones') {
        response = await dealRoomAPI.updateMilestone(id, formData);
      }
      
      setEditingItem(null);
      await loadData();
      await loadTabCounts();
      
      // Show success message
      alert(`${activeTab.slice(0, -1)} updated successfully!`);
      console.log(`${activeTab.slice(0, -1)} updated successfully:`, response);
    } catch (error) {
      console.error('Failed to update:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data || error.message || 'Unknown error';
      alert(`Failed to update ${activeTab.slice(0, -1)}: ${JSON.stringify(errorMsg)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;
    
    try {
      setLoading(true);
      
      if (activeTab === 'deals') {
        await dealRoomAPI.deleteDealRoom(id);
      } else if (activeTab === 'participants') {
        await dealRoomAPI.removeParticipant(id);
      } else if (activeTab === 'documents') {
        await dealRoomAPI.deleteDocument(id);
      } else if (activeTab === 'milestones') {
        await dealRoomAPI.deleteMilestone(id);
      }
      
      await loadData();
      await loadTabCounts();
      
      // Remove from selected items if it was selected
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
      
      console.log(`${activeTab.slice(0, -1)} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete:', error);
      alert(`Failed to delete ${activeTab.slice(0, -1)}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      alert('Please select items to perform bulk action');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedItems.length} item(s)?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const promises = selectedItems.map(id => {
        if (action === 'activate' && activeTab === 'deals') {
          return dealRoomAPI.updateDealRoom(id, { status: 'active' });
        } else if (action === 'close' && activeTab === 'deals') {
          return dealRoomAPI.updateDealRoom(id, { status: 'closed' });
        } else if (action === 'complete' && activeTab === 'milestones') {
          return dealRoomAPI.completeMilestone(id);
        } else if (action === 'delete') {
          if (activeTab === 'deals') return dealRoomAPI.deleteDealRoom(id);
          else if (activeTab === 'documents') return dealRoomAPI.deleteDocument(id);
          else if (activeTab === 'participants') return dealRoomAPI.removeParticipant(id);
        }
        return null;
      }).filter(Boolean);
      
      await Promise.all(promises);
      setSelectedItems([]);
      await loadData();
      await loadTabCounts();
      
      console.log(`Bulk ${action} completed successfully for ${selectedItems.length} items`);
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      alert(`Failed to ${action} items: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      negotiating: { color: 'bg-blue-100 text-blue-800', label: 'Negotiating' },
      due_diligence: { color: 'bg-yellow-100 text-yellow-800', label: 'Due Diligence' },
      completed: { color: 'bg-purple-100 text-purple-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Form field configurations for different entity types
  const getFormFields = (type) => {
    switch (type) {
      case 'deals':
        return [
          { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter deal room title' },
          { name: 'description', label: 'Description', type: 'textarea', rows: 3, placeholder: 'Enter description' },
          { name: 'deal_type', label: 'Deal Type', type: 'select', required: true, options: [
            { value: 'acquisition', label: 'Acquisition' },
            { value: 'joint_venture', label: 'Joint Venture' },
            { value: 'equipment_lease', label: 'Equipment Lease' },
            { value: 'service_contract', label: 'Service Contract' },
            { value: 'exploration_rights', label: 'Exploration Rights' },
            { value: 'drilling_contract', label: 'Drilling Contract' },
            { value: 'supply_agreement', label: 'Supply Agreement' },
            { value: 'other', label: 'Other' }
          ]},
          { name: 'estimated_value', label: 'Estimated Value ($)', type: 'number', placeholder: '0' },
          { name: 'status', label: 'Status', type: 'select', required: true, options: [
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'negotiating', label: 'Negotiating' },
            { value: 'due_diligence', label: 'Due Diligence' },
            { value: 'closing', label: 'Closing' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
          ]},
          { name: 'target_close_date', label: 'Target Close Date', type: 'date' }
        ];
      
      case 'participants':
        return [
          { name: 'deal_room', label: 'Deal Room ID', type: 'text', required: true, placeholder: 'Enter deal room ID' },
          { name: 'user', label: 'User ID', type: 'number', required: true, placeholder: 'Enter user ID' },
          { name: 'role', label: 'Role', type: 'select', required: true, options: [
            { value: 'owner', label: 'Owner' },
            { value: 'buyer', label: 'Buyer' },
            { value: 'seller', label: 'Seller' },
            { value: 'advisor', label: 'Advisor' },
            { value: 'legal', label: 'Legal Counsel' },
            { value: 'financial', label: 'Financial Advisor' },
            { value: 'technical', label: 'Technical Expert' },
            { value: 'observer', label: 'Observer' }
          ]},
          { name: 'permission_level', label: 'Permission Level', type: 'select', required: true, options: [
            { value: 'view', label: 'View Only' },
            { value: 'comment', label: 'View & Comment' },
            { value: 'edit', label: 'View, Comment & Edit' },
            { value: 'admin', label: 'Full Access' }
          ]},
          { name: 'is_active', label: 'Active', type: 'checkbox' }
        ];
      
      case 'documents':
        return [
          { name: 'deal_room', label: 'Deal Room ID', type: 'text', required: true, placeholder: 'Enter deal room ID' },
          { name: 'title', label: 'Document Title', type: 'text', required: true, placeholder: 'Enter document title' },
          { name: 'description', label: 'Description', type: 'textarea', rows: 3, placeholder: 'Enter description' },
          { name: 'document_type', label: 'Document Type', type: 'select', required: true, options: [
            { value: 'financial', label: 'Financial Statement' },
            { value: 'legal', label: 'Legal Document' },
            { value: 'technical', label: 'Technical Report' },
            { value: 'due_diligence', label: 'Due Diligence' },
            { value: 'contract', label: 'Contract' },
            { value: 'presentation', label: 'Presentation' },
            { value: 'other', label: 'Other' }
          ]},
          { name: 'file', label: 'File', type: 'file', required: !editingItem, accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt' },
          { name: 'access_level', label: 'Access Level', type: 'select', options: [
            { value: 'all', label: 'All Participants' },
            { value: 'role_based', label: 'Role Based' },
            { value: 'restricted', label: 'Restricted Access' }
          ]}
        ];
      
      case 'milestones':
        return [
          { name: 'deal_room', label: 'Deal Room ID', type: 'text', required: true, placeholder: 'Enter deal room ID' },
          { name: 'title', label: 'Milestone Title', type: 'text', required: true, placeholder: 'Enter milestone title' },
          { name: 'description', label: 'Description', type: 'textarea', rows: 3, placeholder: 'Enter description' },
          { name: 'due_date', label: 'Due Date', type: 'datetime-local', required: true },
          { name: 'assigned_to', label: 'Assigned To (User ID)', type: 'number', required: true, placeholder: 'Enter user ID' },
          { name: 'priority', label: 'Priority (1-5)', type: 'number', required: true, placeholder: '3' },
          { name: 'status', label: 'Status', type: 'select', options: [
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'cancelled', label: 'Cancelled' }
          ]},
          { name: 'progress', label: 'Progress (%)', type: 'number', placeholder: '0' }
        ];
      
      default:
        return [];
    }
  };

  const handleFormSubmit = async (formData) => {
    if (editingItem) {
      await handleUpdate(editingItem.id, formData);
    } else {
      await handleCreate(formData);
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingItem(null);
  };

  const tabs = [
    { id: 'deals', label: 'Deal Rooms', icon: BriefcaseIcon, count: tabCounts.deals },
    { id: 'participants', label: 'Participants', icon: UsersIcon, count: tabCounts.participants },
    { id: 'documents', label: 'Documents', icon: DocumentIcon, count: tabCounts.documents },
    { id: 'milestones', label: 'Milestones', icon: ChartBarIcon, count: tabCounts.milestones }
  ];

  const renderDealsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.length === deals.length && deals.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(deals.map(deal => deal.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deal Room
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Participants
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
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
          {deals.map((deal) => (
            <tr key={deal.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(deal.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, deal.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== deal.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                  <div className="text-sm text-gray-500">{deal.description}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center text-sm text-gray-900">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1 text-gray-400" />
                  {deal.estimated_value ? formatCurrency(deal.estimated_value) : 'Not specified'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <UsersIcon className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-sm text-gray-900">{deal.participants_count || 0}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(deal.status)}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{formatDate(deal.created_at)}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <Link
                    to={`/admin/deals/${deal.id}`}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Deal"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setEditingItem(deal)}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit Deal"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(deal.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete Deal"
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
  );

  const renderParticipantsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.length === participants.length && participants.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(participants.map(p => p.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Participant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deal Room
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Permission Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {participants.map((participant) => (
            <tr key={participant.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(participant.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, participant.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== participant.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-gray-600">
                      {participant.user_name ? participant.user_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {participant.user_name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-500">{participant.user_email || 'No email'}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div 
                  className="text-sm text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                  onClick={() => handleDealRoomClick(participant.deal_room)}
                >
                  {participant.deal_room_name || 'Unknown Deal Room'}
                </div>
                <div className="text-xs text-gray-500">
                  Status: {participant.deal_room_status || 'Unknown'}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {participant.role || 'participant'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  participant.permission_level === 'admin' ? 'bg-red-100 text-red-800' :
                  participant.permission_level === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {participant.permission_level || 'viewer'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  participant.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {participant.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {participant.joined_at ? formatDate(participant.joined_at) : 'Not joined'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingItem(participant)}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit Participant"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(participant.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Remove Participant"
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
  );

  const renderDocumentsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deal Room
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uploaded
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {documents.map((document) => (
            <tr key={document.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <DocumentIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{document.title}</div>
                    <div className="text-sm text-gray-500">{document.file_size}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div 
                  className="text-sm text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                  onClick={() => handleDealRoomClick(document.deal_room)}
                >
                  {document.deal_room_name || 'Unknown Deal Room'}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {document.document_type}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{formatDate(document.uploaded_at)}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(document.file_url, '_blank')}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Document"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(document.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete Document"
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
  );

  const renderMilestonesTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Milestone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deal Room
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {milestones.map((milestone) => (
            <tr key={milestone.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{milestone.title}</div>
                  <div className="text-sm text-gray-500">{milestone.description}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div 
                  className="text-sm text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                  onClick={() => handleDealRoomClick(milestone.deal_room)}
                >
                  {milestone.deal_room_name || 'Unknown Deal Room'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{formatDate(milestone.due_date)}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  milestone.is_completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {milestone.is_completed ? 'Completed' : 'Pending'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingItem(milestone)}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit Milestone"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  {!milestone.is_completed && (
                    <button
                      onClick={() => dealRoomAPI.completeMilestone(milestone.id).then(loadData)}
                      className="text-green-600 hover:text-green-700"
                      title="Mark Complete"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border border-white/20 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Deal Rooms Management
            </h1>
            <p className="text-gray-600 mt-1">Manage deal rooms, participants, documents, and milestones</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-medium flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create {activeTab.slice(0, -1)}
            </button>
            <button
              onClick={() => window.location.href = '/admin/deals/analytics'}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-medium flex items-center"
            >
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
                onClick={() => handleTabChange(tab.id)}
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
                onChange={handleSearch}
                className="pl-10 pr-4 py-3 w-full bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-gray-700"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="negotiating">Negotiating</option>
              <option value="due_diligence">Due Diligence</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={loadData}
              className="px-4 py-3 bg-gradient-to-r from-gray-100/80 to-gray-200/80 backdrop-blur-xl text-gray-700 rounded-xl hover:from-gray-200/80 hover:to-gray-300/80 transition-all duration-200 flex items-center border border-white/30 shadow-medium"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-4 py-3 bg-gradient-to-r from-red-100/80 to-red-200/80 backdrop-blur-xl text-red-700 rounded-xl hover:from-red-200/80 hover:to-red-300/80 transition-all duration-200 flex items-center border border-white/30 shadow-medium"
              >
                <XCircleIcon className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="backdrop-blur-xl bg-blue-500/20 border border-blue-300/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-semibold">
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-4 py-2 bg-gradient-to-r from-green-500/90 to-green-600/90 text-white rounded-xl text-sm hover:from-green-600/90 hover:to-green-700/90 transition-all duration-200 shadow-medium backdrop-blur-xl border border-white/20"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('close')}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500/90 to-yellow-600/90 text-white rounded-xl text-sm hover:from-yellow-600/90 hover:to-yellow-700/90 transition-all duration-200 shadow-medium backdrop-blur-xl border border-white/20"
              >
                Close
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 bg-gradient-to-r from-red-500/90 to-red-600/90 text-white rounded-xl text-sm hover:from-red-600/90 hover:to-red-700/90 transition-all duration-200 shadow-medium backdrop-blur-xl border border-white/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {activeTab === 'deals' && renderDealsTable()}
        {activeTab === 'participants' && renderParticipantsTable()}
        {activeTab === 'documents' && renderDocumentsTable()}
        {activeTab === 'milestones' && renderMilestonesTable()}

        {/* Empty State */}
        {((activeTab === 'deals' && deals.length === 0) ||
          (activeTab === 'participants' && participants.length === 0) ||
          (activeTab === 'documents' && documents.length === 0) ||
          (activeTab === 'milestones' && milestones.length === 0)) && (
          <div className="text-center py-12">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
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

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {(() => {
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                const pages = [];
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, currentPage + 2);
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-2 text-sm rounded-xl transition-all duration-200 ${
                        i === currentPage
                          ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white backdrop-blur-xl'
                          : 'bg-white/50 backdrop-blur-xl border border-white/30 hover:bg-white/70 text-gray-700'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                className="px-3 py-2 text-sm bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(Math.ceil(totalItems / itemsPerPage))}
                disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                className="px-3 py-2 text-sm bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || !!editingItem}
        onClose={handleModalClose}
        title={editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Create New ${activeTab.slice(0, -1)}`}
        size="lg"
      >
        <Modal.Form
          fields={getFormFields(activeTab)}
          data={editingItem || {}}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          loading={loading}
          submitLabel={editingItem ? 'Update' : 'Create'}
        />
      </Modal>
    </div>
  );
};

export default AdminDeals;
