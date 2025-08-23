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
  PlusIcon,
  ArchiveBoxIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

import { logisticsAPI } from '../../../api-services/logistics';

const AdminLogistics = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'shipments', 'inventory', 'providers'
  const [requests, setRequests] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const itemsPerPage = 10;

  // Counts for tabs - load once and update when data changes
  const [counts, setCounts] = useState({
    requests: 0,
    shipments: 0,
    inventory: 0,
    providers: 0
  });

  // Load counts for all tabs initially
  useEffect(() => {
    loadAllCounts();
  }, []);

  // Load data when tab, page, search or filter changes
  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, statusFilter, searchTerm]);

  const loadAllCounts = async () => {
    try {
      console.log('🔢 Loading counts for all tabs...');
      const [requestsCount, shipmentsCount, inventoryCount, providersCount] = await Promise.all([
        logisticsAPI.getShipmentRequests({ page_size: 1 })
          .then(r => r && typeof r === 'object' ? (r.count || 0) : 0)
          .catch(err => {
            console.error('Error loading requests count:', err);
            return 0;
          }),
        logisticsAPI.getShipments({ page_size: 1 })
          .then(r => r && typeof r === 'object' ? (r.count || 0) : 0)
          .catch(err => {
            console.error('Error loading shipments count:', err);
            return 0;
          }),
        logisticsAPI.getInventoryItems({ page_size: 1 })
          .then(r => r && typeof r === 'object' ? (r.count || 0) : 0)
          .catch(err => {
            console.error('Error loading inventory count:', err);
            return 0;
          }),
        logisticsAPI.getLogisticsProviders({ page_size: 1 })
          .then(r => r && typeof r === 'object' ? (r.count || 0) : 0)
          .catch(err => {
            console.error('Error loading providers count:', err);
            return 0;
          }),
      ]);

      console.log('📊 Counts loaded:', { requestsCount, shipmentsCount, inventoryCount, providersCount });
      setCounts({
        requests: requestsCount,
        shipments: shipmentsCount,
        inventory: inventoryCount,
        providers: providersCount
      });
    } catch (err) {
      console.error('Error loading counts:', err);
      setCounts({
        requests: 0,
        shipments: 0,
        inventory: 0,
        providers: 0
      });
    }
  };

  // Unified data loading function
  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, statusFilter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading logistics data for tab:', activeTab);
      
      if (activeTab === 'requests') {
        console.log('📋 Fetching logistics requests...');
        const response = await logisticsAPI.getShipmentRequests({
          page: currentPage,
          page_size: 20,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
        console.log('✅ Requests response:', response);
        if (response && typeof response === 'object') {
          setRequests(response.results || []);
          setTotalCount(response.count || 0);
          setTotalPages(Math.ceil((response.count || 0) / 20));
        } else {
          console.warn('⚠️ Invalid response format for requests:', response);
          setRequests([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } else if (activeTab === 'shipments') {
        console.log('🚛 Fetching shipments...');
        const response = await logisticsAPI.getShipments({
          page: currentPage,
          page_size: 20,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
        console.log('✅ Shipments response:', response);
        if (response && typeof response === 'object') {
          setShipments(response.results || []);
          setTotalCount(response.count || 0);
          setTotalPages(Math.ceil((response.count || 0) / 20));
        } else {
          console.warn('⚠️ Invalid response format for shipments:', response);
          setShipments([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } else if (activeTab === 'inventory') {
        console.log('📦 Fetching inventory...');
        const response = await logisticsAPI.getInventoryItems({
          page: currentPage,
          page_size: 20,
          search: searchTerm
        });
        console.log('✅ Inventory response:', response);
        if (response && typeof response === 'object') {
          setInventory(response.results || []);
          setTotalCount(response.count || 0);
          setTotalPages(Math.ceil((response.count || 0) / 20));
        } else {
          console.warn('⚠️ Invalid response format for inventory:', response);
          setInventory([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } else if (activeTab === 'providers') {
        console.log('🏢 Fetching providers...');
        const response = await logisticsAPI.getLogisticsProviders({
          page: currentPage,
          page_size: 20,
          search: searchTerm,
          is_active: statusFilter !== 'all' ? (statusFilter === 'active') : undefined
        });
        console.log('✅ Providers response:', response);
        if (response && typeof response === 'object') {
          setProviders(response.results || []);
          setTotalCount(response.count || 0);
          setTotalPages(Math.ceil((response.count || 0) / 20));
        } else {
          console.warn('⚠️ Invalid response format for providers:', response);
          setProviders([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error('❌ Error loading logistics data:', err);
      setError(err.message || 'Failed to load logistics data');
      // Set empty states on error
      setRequests([]);
      setShipments([]);
      setInventory([]);
      setProviders([]);
      setTotalCount(0);
      setTotalPages(1);
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
            return logisticsAPI.deleteShipmentRequest(id);
          } else if (activeTab === 'shipments') {
            return logisticsAPI.deleteShipment(id);
          } else if (activeTab === 'inventory') {
            return logisticsAPI.deleteInventoryItem(id);
          } else if (activeTab === 'providers') {
            return logisticsAPI.deleteLogisticsProvider(id);
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
          await logisticsAPI.deleteShipmentRequest(id);
        } else if (activeTab === 'shipments') {
          await logisticsAPI.deleteShipment(id);
        } else if (activeTab === 'inventory') {
          await logisticsAPI.deleteInventoryItem(id);
        } else if (activeTab === 'providers') {
          await logisticsAPI.deleteLogisticsProvider(id);
        }
        loadData();
        loadAllCounts(); // Refresh counts after deletion
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowCreateModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        // Update existing item
        if (activeTab === 'requests') {
          await logisticsAPI.updateShipmentRequest(editingItem.id, formData);
        } else if (activeTab === 'shipments') {
          await logisticsAPI.updateShipment(editingItem.id, formData);
        } else if (activeTab === 'inventory') {
          await logisticsAPI.updateInventoryItem(editingItem.id, formData);
        } else if (activeTab === 'providers') {
          await logisticsAPI.updateLogisticsProvider(editingItem.id, formData);
        }
      } else {
        // Create new item
        if (activeTab === 'requests') {
          await logisticsAPI.createShipmentRequest(formData);
        } else if (activeTab === 'inventory') {
          await logisticsAPI.createInventoryItem(formData);
        } else if (activeTab === 'providers') {
          await logisticsAPI.createLogisticsProvider(formData);
        }
      }
      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingItem(null);
      loadData();
      loadAllCounts(); // Refresh counts after create/update
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      let ids = [];
      if (activeTab === 'requests') {
        ids = requests.map(item => item.id);
      } else if (activeTab === 'shipments') {
        ids = shipments.map(item => item.id);
      } else if (activeTab === 'inventory') {
        ids = inventory.map(item => item.id);
      } else if (activeTab === 'providers') {
        ids = providers.map(item => item.id);
      }
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
    { 
      id: 'requests', 
      label: `Requests (${counts.requests})`, 
      icon: ClipboardDocumentListIcon 
    },
    { 
      id: 'shipments', 
      label: `Shipments (${counts.shipments})`, 
      icon: TruckIcon 
    },
    { 
      id: 'inventory', 
      label: `Inventory (${counts.inventory})`, 
      icon: ArchiveBoxIcon 
    },
    { 
      id: 'providers', 
      label: `Providers (${counts.providers})`, 
      icon: BuildingOfficeIcon 
    }
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
                {request.origin_address}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.destination_address}
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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedItems.length === shipments.length && shipments.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Shipment ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Request Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Origin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Provider
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tracking Number
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
        <tbody className="bg-white divide-y divide-gray-200">
          {shipments.map((shipment) => (
            <tr key={shipment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(shipment.id)}
                  onChange={(e) => handleSelectItem(shipment.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div>
                  <div className="font-medium">#{shipment.id.slice(0, 8)}...</div>
                  <div className="text-xs text-gray-500">
                    Request: #{shipment.request?.slice(0, 8) || 'N/A'}...
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {shipment.request_details?.title || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {shipment.request_details?.origin_address || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {shipment.request_details?.destination_address || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {shipment.provider_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {shipment.provider ? shipment.provider.slice(0, 8) + '...' : 'N/A'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {shipment.tracking_number || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                  shipment.status === 'picked_up' ? 'bg-yellow-100 text-yellow-800' :
                  shipment.status === 'created' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {shipment.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(shipment.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.location.href = `/admin/logistics/shipments/${shipment.id}`}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(shipment)}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(shipment.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
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

  const renderInventoryTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedItems.length === inventory.length && inventory.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inventory.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.sku}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.current_stock}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  item.current_stock > item.reorder_level ? 'bg-green-100 text-green-800' :
                  item.current_stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.current_stock > item.reorder_level ? 'In Stock' :
                   item.current_stock > 0 ? 'Low Stock' : 'Out of Stock'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.location.href = `/admin/logistics/inventory/${item.id}`}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
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

  const renderProvidersTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedItems.length === providers.length && providers.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              License Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service Types
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Coverage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fleet Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {providers.map((provider) => (
            <tr key={provider.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(provider.id)}
                  onChange={(e) => handleSelectItem(provider.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {provider.company_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {provider.user_name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {provider.license_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex flex-wrap gap-1">
                  {provider.service_types.slice(0, 2).map((service, index) => (
                    <span 
                      key={index}
                      className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      {service}
                    </span>
                  ))}
                  {provider.service_types.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{provider.service_types.length - 2} more
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  provider.coverage_type === 'global' ? 'bg-purple-100 text-purple-800' :
                  provider.coverage_type === 'international' ? 'bg-indigo-100 text-indigo-800' :
                  provider.coverage_type === 'national' ? 'bg-green-100 text-green-800' :
                  provider.coverage_type === 'regional' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {provider.coverage_type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {provider.fleet_size}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1">{provider.safety_rating}/5</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  provider.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {provider.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.location.href = `/admin/logistics/providers/${provider.id}`}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(provider)}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Logistics Data</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
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
              onClick={handleCreate}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-medium flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create {activeTab === 'requests' ? 'Request' : 
                      activeTab === 'inventory' ? 'Item' : 
                      activeTab === 'providers' ? 'Provider' : 'Entry'}
            </button>
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
                {activeTab === 'requests' && (
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
          {activeTab === 'providers' && renderProvidersTable()}

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

          {activeTab === 'shipments' && shipments.length === 0 && (
            <div className="text-center py-12">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No shipments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No shipments available at the moment'
                }
              </p>
            </div>
          )}

          {activeTab === 'inventory' && inventory.length === 0 && (
            <div className="text-center py-12">
              <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No inventory items available at the moment'
                }
              </p>
            </div>
          )}

          {activeTab === 'providers' && providers.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No providers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No logistics providers available at the moment'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
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
