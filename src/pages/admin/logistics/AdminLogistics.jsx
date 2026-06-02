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
import CurrencyPicker from '../../../components/CurrencyPicker';

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
  const [cargoTypes, setCargoTypes] = useState([]);

  // Fetch admin-managed cargo types
  useEffect(() => {
    const fetchCargoTypes = async () => {
      try {
        const res = await logisticsAPI.getCargoTypes();
        const types = Array.isArray(res) ? res : res?.results || [];
        setCargoTypes(types.map(t => ({ value: t.name, label: t.display_name })));
      } catch (err) {
        console.error('Failed to fetch cargo types:', err);
        setCargoTypes([
          { value: 'general_cargo', label: 'General Cargo' },
          { value: 'project_cargo', label: 'Project Cargo' },
          { value: 'crude_oil', label: 'Crude Oil' },
          { value: 'refined_products', label: 'Refined Products' },
          { value: 'natural_gas', label: 'Natural Gas' },
          { value: 'drilling_equipment', label: 'Drilling Equipment' },
          { value: 'pipes', label: 'Pipes & Tubulars' },
          { value: 'chemicals', label: 'Chemicals' },
          { value: 'hazardous', label: 'Hazardous Materials' }
        ]);
      }
    };
    fetchCargoTypes();
  }, []);
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
        } else if (activeTab === 'shipments') {
          await logisticsAPI.createShipment(formData);
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
                    onClick={() => handleEdit(request)}
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

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <LogisticsForm
              type={activeTab}
              initialData={editingItem}
              onSave={handleSave}
              onCancel={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setEditingItem(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Logistics Form Component
const LogisticsForm = ({ type, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(getInitialFormData(type, initialData));
  const [loading, setLoading] = useState(false);

  function getInitialFormData(type, data) {
    switch (type) {
      case 'requests':
        return {
          title: data?.title || '',
          description: data?.description || '',
          cargo_type: data?.cargo_type || 'general_cargo',
          origin_address: data?.origin_address || '',
          destination_address: data?.destination_address || '',
          origin_contact_name: data?.origin_contact_name || '',
          origin_contact_email: data?.origin_contact_email || '',
          origin_contact_phone: data?.origin_contact_phone || '',
          destination_contact_name: data?.destination_contact_name || '',
          destination_contact_email: data?.destination_contact_email || '',
          destination_contact_phone: data?.destination_contact_phone || '',
          weight: data?.weight || '',
          volume: data?.volume || '',
          pickup_date_requested: data?.pickup_date_requested ? data.pickup_date_requested.slice(0, 16) : new Date().toISOString().slice(0, 16),
          delivery_date_requested: data?.delivery_date_requested ? data.delivery_date_requested.slice(0, 16) : new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 16),
          urgency: data?.urgency || 'standard',
          budget_min: data?.budget_min || '',
          budget_max: data?.budget_max || '',
          currency: data?.currency || 'USD',
          special_requirements: data?.special_requirements || '',
          allow_bids: data?.allow_bids !== undefined ? data?.allow_bids : true,
          dimensions: data?.dimensions || { length: 0, width: 0, height: 0, unit: 'meters' },
          origin_coordinates: data?.origin_coordinates || null,
          destination_coordinates: data?.destination_coordinates || null,
          // Note: requested_by is set automatically from current user
          // Note: awarded_to is set through business process
          // Note: quotes_count is calculated automatically
          // Note: shipment_* fields are read-only relationships
        };
      case 'shipments':
        return {
          request: data?.request || '',
          provider: data?.provider || '',
          // tracking_number is auto-generated by backend
          status: data?.status || 'preparing',
          actual_pickup_date: data?.actual_pickup_date ? data.actual_pickup_date.slice(0, 16) : '',
          actual_delivery_date: data?.actual_delivery_date ? data.actual_delivery_date.slice(0, 16) : '',
          current_location: data?.current_location || '',
          current_coordinates: data?.current_coordinates || null,
          delays_count: data?.delays_count || 0,
          total_delay_hours: data?.total_delay_hours || 0,
          delivery_notes: data?.delivery_notes || '',
          // Note: tracking_number is auto-generated
          // Note: tracking_events_count is calculated automatically
        };
      case 'inventory':
        return {
          name: data?.name || '',
          description: data?.description || '',
          sku: data?.sku || '',
          category: data?.category || 'drilling_equipment',
          current_stock: data?.current_stock || 0,
          minimum_stock: data?.minimum_stock || 0,
          maximum_stock: data?.maximum_stock || 0,
          reorder_point: data?.reorder_point || 0,
          unit: data?.unit || 'pcs',
          unit_cost: data?.unit_cost || 0,
          last_purchase_price: data?.last_purchase_price || 0,
          average_cost: data?.average_cost || 0,
          status: data?.status || 'available',
          condition: data?.condition || 'excellent',
          location: data?.location || '',
          warehouse: data?.warehouse || '',
          bin_location: data?.bin_location || '',
          supplier: data?.supplier || '',
          supplier_part_number: data?.supplier_part_number || '',
          manufacturer: data?.manufacturer || '',
          manufacturer_part_number: data?.manufacturer_part_number || '',
          specifications: data?.specifications || {},
          serial_numbers: data?.serial_numbers || [],
          last_counted: data?.last_counted ? data.last_counted.slice(0, 10) : '',
          // Note: total_value, is_low_stock, stock_status are auto-calculated
          // Note: created_by is set automatically from current user
          // Note: last_movement_* fields are updated via inventory transactions
        };
      case 'providers':
        return {
          user: data?.user || 1,
          company_name: data?.company_name || '',
          license_number: data?.license_number || '',
          service_types: data?.service_types || ['trucking'],
          coverage_type: data?.coverage_type || 'local',
          service_regions: data?.service_regions || [],
          fleet_size: data?.fleet_size || 0,
          vehicle_types: data?.vehicle_types || {},
          warehouse_capacity: data?.warehouse_capacity || 0,
          certifications: data?.certifications || [],
          insurance_coverage: data?.insurance_coverage || 0,
          on_time_delivery_rate: data?.on_time_delivery_rate || 0,
          safety_rating: data?.safety_rating || 0,
          is_active: data?.is_active !== undefined ? data?.is_active : true,
          // Note: active_shipments_count is calculated automatically
          // Note: user_name is read-only from user relationship
          // Following fields are not in backend model:
          contact_person: data?.contact_person || '',
          email: data?.email || '',
          phone: data?.phone || '',
          address: data?.address || '',
          coverage_areas: data?.coverage_areas || '',
          rating: data?.rating || 0,
        };
      default:
        return {};
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderFormFields = () => {
    switch (type) {
      case 'requests':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type</label>
                <select
                  value={formData.cargo_type}
                  onChange={(e) => handleInputChange('cargo_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {cargoTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin Address</label>
              <textarea
                value={formData.origin_address}
                onChange={(e) => handleInputChange('origin_address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin Contact Name</label>
                <input
                  type="text"
                  value={formData.origin_contact_name}
                  onChange={(e) => handleInputChange('origin_contact_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin Contact Email</label>
                <input
                  type="email"
                  value={formData.origin_contact_email}
                  onChange={(e) => handleInputChange('origin_contact_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin Contact Phone</label>
                <input
                  type="tel"
                  value={formData.origin_contact_phone}
                  onChange={(e) => handleInputChange('origin_contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Address</label>
              <textarea
                value={formData.destination_address}
                onChange={(e) => handleInputChange('destination_address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Contact Name</label>
                <input
                  type="text"
                  value={formData.destination_contact_name}
                  onChange={(e) => handleInputChange('destination_contact_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Contact Email</label>
                <input
                  type="email"
                  value={formData.destination_contact_email}
                  onChange={(e) => handleInputChange('destination_contact_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Contact Phone</label>
                <input
                  type="tel"
                  value={formData.destination_contact_phone}
                  onChange={(e) => handleInputChange('destination_contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">📦 Cargo Specifications</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (tons)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 25.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Total weight in metric tons</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volume (m³)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.volume}
                    onChange={(e) => handleInputChange('volume', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 12.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Total volume in cubic meters</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📐 Cargo Dimensions</label>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Length</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.dimensions?.length || ''}
                      onChange={(e) => {
                        const newDimensions = { ...formData.dimensions, length: parseFloat(e.target.value) || 0 };
                        handleInputChange('dimensions', newDimensions);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12.0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.dimensions?.width || ''}
                      onChange={(e) => {
                        const newDimensions = { ...formData.dimensions, width: parseFloat(e.target.value) || 0 };
                        handleInputChange('dimensions', newDimensions);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.dimensions?.height || ''}
                      onChange={(e) => {
                        const newDimensions = { ...formData.dimensions, height: parseFloat(e.target.value) || 0 };
                        handleInputChange('dimensions', newDimensions);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3.0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                    <select
                      value={formData.dimensions?.unit || 'meters'}
                      onChange={(e) => {
                        const newDimensions = { ...formData.dimensions, unit: e.target.value };
                        handleInputChange('dimensions', newDimensions);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="meters">Meters</option>
                      <option value="feet">Feet</option>
                      <option value="inches">Inches</option>
                    </select>
                  </div>
                </div>
                <div className="mt-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <strong>📏 Dimensions:</strong> {formData.dimensions?.length || 0} × {formData.dimensions?.width || 0} × {formData.dimensions?.height || 0} {formData.dimensions?.unit || 'meters'}
                  {formData.dimensions?.length && formData.dimensions?.width && formData.dimensions?.height && (
                    <span className="ml-2">
                      | <strong>Calculated Volume:</strong> {(formData.dimensions.length * formData.dimensions.width * formData.dimensions.height).toFixed(3)} {formData.dimensions.unit === 'meters' ? 'm³' : formData.dimensions.unit === 'feet' ? 'ft³' : 'in³'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date Requested</label>
                <input
                  type="datetime-local"
                  value={formData.pickup_date_requested}
                  onChange={(e) => handleInputChange('pickup_date_requested', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date Requested</label>
                <input
                  type="datetime-local"
                  value={formData.delivery_date_requested}
                  onChange={(e) => handleInputChange('delivery_date_requested', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <CurrencyPicker
                value={formData.currency}
                onChange={(code) => handleInputChange('currency', code)}
              />
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.allow_bids}
                    onChange={(e) => handleInputChange('allow_bids', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Allow Bids</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Min</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.budget_min}
                  onChange={(e) => handleInputChange('budget_min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Max</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.budget_max}
                  onChange={(e) => handleInputChange('budget_max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
              <textarea
                value={formData.special_requirements}
                onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Any special handling instructions, insurance requirements, etc..."
              />
            </div>
          </div>
        );

      case 'shipments':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request ID</label>
                <input
                  type="text"
                  value={formData.request}
                  onChange={(e) => handleInputChange('request', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ShipmentRequest UUID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider ID</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="LogisticsProvider UUID"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Tracking number will be auto-generated when the shipment is created.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="preparing">Preparing</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="at_destination">At Destination</option>
                <option value="delivered">Delivered</option>
                <option value="exception">Exception</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Pickup Date</label>
                <input
                  type="datetime-local"
                  value={formData.actual_pickup_date}
                  onChange={(e) => handleInputChange('actual_pickup_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Delivery Date</label>
                <input
                  type="datetime-local"
                  value={formData.actual_delivery_date}
                  onChange={(e) => handleInputChange('actual_delivery_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
              <input
                type="text"
                value={formData.current_location}
                onChange={(e) => handleInputChange('current_location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Current shipment location"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delays Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.delays_count}
                  onChange={(e) => handleInputChange('delays_count', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Delay Hours</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_delay_hours}
                  onChange={(e) => handleInputChange('total_delay_hours', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
              <textarea
                value={formData.delivery_notes}
                onChange={(e) => handleInputChange('delivery_notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Any delivery notes or special instructions..."
              />
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="drilling_equipment">Drilling Equipment</option>
                  <option value="pipe_tubing">Pipes & Tubing</option>
                  <option value="wellhead_equipment">Wellhead Equipment</option>
                  <option value="production_equipment">Production Equipment</option>
                  <option value="safety_equipment">Safety Equipment</option>
                  <option value="maintenance_tools">Maintenance Tools</option>
                  <option value="chemicals">Chemicals & Fluids</option>
                  <option value="valves_fittings">Valves & Fittings</option>
                  <option value="electrical_equipment">Electrical Equipment</option>
                  <option value="instrumentation">Instrumentation</option>
                  <option value="ppe">Personal Protective Equipment</option>
                  <option value="consumables">Consumables</option>
                  <option value="spare_parts">Spare Parts</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.current_stock}
                  onChange={(e) => handleInputChange('current_stock', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pcs">Pieces</option>
                  <option value="ft">Feet</option>
                  <option value="m">Meters</option>
                  <option value="kg">Kilograms</option>
                  <option value="lb">Pounds</option>
                  <option value="gal">Gallons</option>
                  <option value="l">Liters</option>
                  <option value="bbl">Barrels</option>
                  <option value="tons">Tons</option>
                  <option value="set">Sets</option>
                  <option value="roll">Rolls</option>
                  <option value="box">Boxes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => handleInputChange('unit_cost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Purchase Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.last_purchase_price}
                  onChange={(e) => handleInputChange('last_purchase_price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.average_cost}
                  onChange={(e) => handleInputChange('average_cost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="in_use">In Use</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="damaged">Damaged</option>
                  <option value="obsolete">Obsolete</option>
                  <option value="disposed">Disposed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new">New</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                <input
                  type="text"
                  value={formData.warehouse}
                  onChange={(e) => handleInputChange('warehouse', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bin Location</label>
                <input
                  type="text"
                  value={formData.bin_location}
                  onChange={(e) => handleInputChange('bin_location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minimum_stock}
                  onChange={(e) => handleInputChange('minimum_stock', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Stock</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.maximum_stock}
                  onChange={(e) => handleInputChange('maximum_stock', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.reorder_point}
                  onChange={(e) => handleInputChange('reorder_point', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Part Number</label>
                <input
                  type="text"
                  value={formData.supplier_part_number}
                  onChange={(e) => handleInputChange('supplier_part_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer Part Number</label>
                <input
                  type="text"
                  value={formData.manufacturer_part_number}
                  onChange={(e) => handleInputChange('manufacturer_part_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Counted Date</label>
              <input
                type="date"
                value={formData.last_counted}
                onChange={(e) => handleInputChange('last_counted', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Numbers (comma-separated)</label>
              <textarea
                value={Array.isArray(formData.serial_numbers) ? formData.serial_numbers.join(', ') : ''}
                onChange={(e) => handleInputChange('serial_numbers', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                placeholder="SN001, SN002, SN003..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Technical Specifications (JSON)</label>
              <textarea
                value={typeof formData.specifications === 'object' ? JSON.stringify(formData.specifications, null, 2) : formData.specifications}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleInputChange('specifications', parsed);
                  } catch {
                    handleInputChange('specifications', e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                placeholder='{"pressure_rating": "5000 PSI", "material": "Carbon Steel", "temperature_range": "-20°C to 150°C"}'
              />
            </div>
          </div>
        );

      case 'providers':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Type</label>
                <select
                  value={formData.coverage_type}
                  onChange={(e) => handleInputChange('coverage_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="local">Local</option>
                  <option value="regional">Regional</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                  <option value="global">Global</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fleet Size</label>
                <input
                  type="number"
                  min="0"
                  value={formData.fleet_size}
                  onChange={(e) => handleInputChange('fleet_size', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Capacity (m³)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.warehouse_capacity}
                  onChange={(e) => handleInputChange('warehouse_capacity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Coverage (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.insurance_coverage}
                  onChange={(e) => handleInputChange('insurance_coverage', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">On-Time Delivery Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.on_time_delivery_rate}
                  onChange={(e) => handleInputChange('on_time_delivery_rate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Safety Rating (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.safety_rating}
                  onChange={(e) => handleInputChange('safety_rating', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Types</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'trucking', 'marine', 'rail', 'air', 'pipeline', 
                  'warehousing', 'freight_forwarding', 'customs_brokerage', 
                  'project_cargo', 'hazmat'
                ].map(service => (
                  <label key={service} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.service_types.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('service_types', [...formData.service_types, service]);
                        } else {
                          handleInputChange('service_types', formData.service_types.filter(s => s !== service));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{service.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Regions (comma-separated)</label>
              <textarea
                value={Array.isArray(formData.service_regions) ? formData.service_regions.join(', ') : ''}
                onChange={(e) => handleInputChange('service_regions', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                placeholder="e.g., Lagos State, Rivers State, Abuja FCT..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certifications (comma-separated)</label>
              <textarea
                value={Array.isArray(formData.certifications) ? formData.certifications.join(', ') : ''}
                onChange={(e) => handleInputChange('certifications', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                placeholder="e.g., ISO 9001, HAZMAT Certified, DOT Licensed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Types (JSON)</label>
              <textarea
                value={typeof formData.vehicle_types === 'object' ? JSON.stringify(formData.vehicle_types, null, 2) : formData.vehicle_types}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleInputChange('vehicle_types', parsed);
                  } catch {
                    handleInputChange('vehicle_types', e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder='{"trucks": 25, "trailers": 30, "tankers": 10, "cranes": 5}'
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active Provider</span>
              </label>
            </div>
          </div>
        );

      default:
        return <div>Form not available for this type</div>;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderFormFields()}
      
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-custom_yellow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            initialData ? 'Update' : 'Create'
          )}
        </button>
      </div>
    </form>
  );
};

export default AdminLogistics;
