import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

import { logisticsAPI } from '../../../api-services/logistics';

const AdminLogistics = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'shipments', 'inventory'
  const [requests, setRequests] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Unified data loading function
  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, statusFilter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'requests') {
        const response = await logisticsAPI.getLogisticsRequests({
          page: currentPage,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
        setRequests(response.results || []);
      } else if (activeTab === 'shipments') {
        const response = await logisticsAPI.getShipments({
          page: currentPage,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
        setShipments(response.results || []);
      } else if (activeTab === 'inventory') {
        const response = await logisticsAPI.getInventoryItems();
        setInventory(response.results || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Bulk action handlers
  const handleBulkAction = async (action) => {
    try {
      const promises = selectedItems.map(async (id) => {
        if (activeTab === 'requests') {
          if (action === 'approve') return logisticsAPI.approveRequest(id);
          if (action === 'reject') return logisticsAPI.rejectRequest(id);
        } else if (activeTab === 'shipments') {
          if (action === 'update') return logisticsAPI.updateShipmentStatus(id, 'in_transit');
        }
        if (action === 'delete') {
          if (activeTab === 'requests') {
            return logisticsAPI.deleteLogisticsRequest(id);
          } else if (activeTab === 'inventory') {
            return logisticsAPI.deleteInventoryItem(id);
          }
        }
      });
      
      await Promise.all(promises);
      setSelectedItems([]);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Individual action handlers
  const handleApprove = async (id) => {
    try {
      await logisticsAPI.approveRequest(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await logisticsAPI.rejectRequest(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (activeTab === 'requests') {
          await logisticsAPI.deleteLogisticsRequest(id);
        } else if (activeTab === 'inventory') {
          await logisticsAPI.deleteInventoryItem(id);
        }
        loadData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const ids = requests.map(item => item.id);
      setSelectedItems(ids);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id));
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'requests', label: 'Requests', icon: ClipboardDocumentListIcon, count: requests.length },
    { id: 'shipments', label: 'Shipments', icon: TruckIcon, count: shipments.length },
    { id: 'inventory', label: 'Inventory', icon: CubeIcon, count: inventory.length }
  ];

  // Render table functions
  const renderRequestsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedItems.length === requests.length && requests.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Request ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              From
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(request.id)}
                  onChange={(e) => handleSelectItem(request.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{request.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.pickup_location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.delivery_location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {request.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(request.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.location.href = `/admin/logistics/requests/${request.id}`}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="text-green-600 hover:text-green-700"
                        title="Approve Request"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="text-yellow-600 hover:text-yellow-700"
                        title="Reject Request"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => window.location.href = `/admin/logistics/requests/${request.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit Request"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete Request"
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

  const renderShipmentsTable = () => (
    <div className="text-center py-12">
      <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">Shipments Management</h3>
      <p className="mt-1 text-sm text-gray-500">Shipments tracking and management coming soon</p>
    </div>
  );

  const renderInventoryTable = () => (
    <div className="text-center py-12">
      <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">Inventory Management</h3>
      <p className="mt-1 text-sm text-gray-500">Inventory management system coming soon</p>
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
      {/* Modern Header Card */}
      <div className="glass rounded-2xl p-6 border border-white/20 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Logistics Hub Management
            </h1>
            <p className="text-gray-600 mt-1">Manage logistics requests, shipments, and inventory</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/admin/logistics/analytics'}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-medium flex items-center"
            >
              <TruckIcon className="w-4 h-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl mb-6 p-1">
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedItems([]);
                    setCurrentPage(1);
                  }}
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
        <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              {activeTab !== 'inventory' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
              <button
                onClick={loadData}
                className="px-4 py-3 bg-gradient-to-r from-gray-100/80 to-gray-200/80 backdrop-blur-xl text-gray-700 rounded-xl hover:from-gray-200/80 hover:to-gray-300/80 transition-all duration-200 flex items-center border border-white/30 shadow-medium"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="backdrop-blur-xl bg-blue-500/20 border border-blue-300/30 rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-semibold">
                {selectedItems.length} item(s) selected
              </span>
              <div className="flex gap-3">
                {activeTab !== 'inventory' && (
                  <>
                    <button
                      onClick={() => handleBulkAction('approve')}
                      className="px-4 py-2 bg-gradient-to-r from-green-500/90 to-green-600/90 text-white rounded-xl text-sm hover:from-green-600/90 hover:to-green-700/90 transition-all duration-200 shadow-medium backdrop-blur-xl border border-white/20"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      className="px-4 py-2 bg-gradient-to-r from-red-500/90 to-red-600/90 text-white rounded-xl text-sm hover:from-red-600/90 hover:to-red-700/90 transition-all duration-200 shadow-medium backdrop-blur-xl border border-white/20"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-gradient-to-r from-gray-500/90 to-gray-600/90 text-white rounded-xl text-sm hover:from-gray-600/90 hover:to-gray-700/90 transition-all duration-200 shadow-medium backdrop-blur-xl border border-white/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {activeTab === 'requests' && renderRequestsTable()}
          {activeTab === 'shipments' && renderShipmentsTable()}
          {activeTab === 'inventory' && renderInventoryTable()}

          {activeTab === 'requests' && requests.length === 0 && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No logistics requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No logistics requests available at the moment'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {activeTab === 'requests' && requests.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, requests.length)} of {requests.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={requests.length < itemsPerPage}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogistics;
