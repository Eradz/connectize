import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Search, Plus, Boxes, AlertCircle, TrendingUp,
  DollarSign, Eye, Edit, MoreVertical, Download, RefreshCw,
  AlertTriangle, CheckCircle, Wrench, Truck, Building, Settings,
  MapPin, Trash2
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsInventoryService } from '../../api-services/oilgas';
import { toast } from 'sonner';

const LogisticsInventoryEnhanced = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deletingId, setDeletingId] = useState(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  // Oil & gas industry categories
  const industryCategories = [
    { value: 'drilling_equipment', label: 'Drilling Equipment', icon: Wrench },
    { value: 'pipe_tubing', label: 'Pipes & Tubing', icon: Building },
    { value: 'wellhead_equipment', label: 'Wellhead Equipment', icon: Settings },
    { value: 'production_equipment', label: 'Production Equipment', icon: TrendingUp },
    { value: 'safety_equipment', label: 'Safety Equipment', icon: AlertTriangle },
    { value: 'maintenance_tools', label: 'Maintenance Tools', icon: Wrench },
    { value: 'chemicals', label: 'Chemicals & Fluids', icon: Package },
    { value: 'valves_fittings', label: 'Valves & Fittings', icon: Settings },
    { value: 'electrical_equipment', label: 'Electrical Equipment', icon: TrendingUp },
    { value: 'instrumentation', label: 'Instrumentation', icon: Settings },
    { value: 'ppe', label: 'Personal Protective Equipment', icon: AlertTriangle },
    { value: 'consumables', label: 'Consumables', icon: Package },
    { value: 'spare_parts', label: 'Spare Parts', icon: Settings },
    { value: 'other', label: 'Other', icon: Package }
  ];

  const statusOptions = [
    { value: 'available', label: 'Available', color: 'text-green-600 bg-green-100' },
    { value: 'reserved', label: 'Reserved', color: 'text-blue-600 bg-blue-100' },
    { value: 'in_use', label: 'In Use', color: 'text-purple-600 bg-purple-100' },
    { value: 'maintenance', label: 'Under Maintenance', color: 'text-orange-600 bg-orange-100' },
    { value: 'damaged', label: 'Damaged', color: 'text-red-600 bg-red-100' },
    { value: 'obsolete', label: 'Obsolete', color: 'text-gray-600 bg-gray-100' },
    { value: 'disposed', label: 'Disposed', color: 'text-red-800 bg-red-200' }
  ];

  const conditionOptions = [
    { value: 'new', label: 'New', color: 'text-green-600 bg-green-100' },
    { value: 'excellent', label: 'Excellent', color: 'text-blue-600 bg-blue-100' },
    { value: 'good', label: 'Good', color: 'text-green-500 bg-green-50' },
    { value: 'fair', label: 'Fair', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'poor', label: 'Poor', color: 'text-orange-600 bg-orange-100' },
    { value: 'damaged', label: 'Damaged', color: 'text-red-600 bg-red-100' }
  ];

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      
      // Load all inventory data in parallel
      const [inventoryData, summaryData, categoriesData, alertsData] = await Promise.allSettled([
        logisticsInventoryService.getAll(),
        logisticsInventoryService.getSummary(),
        logisticsInventoryService.getCategories(),
        logisticsInventoryService.getLowStockAlerts()
      ]);

      // Handle inventory data
      if (inventoryData.status === 'fulfilled') {
        const items = Array.isArray(inventoryData.value?.results) 
          ? inventoryData.value.results 
          : Array.isArray(inventoryData.value) 
            ? inventoryData.value 
            : [];
        setInventory(items);
      } else {
        console.warn('Inventory API failed, using fallback data');
        setInventory(generateMockInventoryData());
      }

      // Handle summary data
      if (summaryData.status === 'fulfilled') {
        setSummary(summaryData.value);
      }

      // Handle categories data
      if (categoriesData.status === 'fulfilled') {
        setCategories(categoriesData.value);
      }

      // Handle alerts data
      if (alertsData.status === 'fulfilled') {
        setLowStockAlerts(alertsData.value);
      }

    } catch (error) {
      toast.error('Failed to load inventory data');
      console.error('Error loading inventory:', error);
      // Fallback to mock data
      setInventory(generateMockInventoryData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockInventoryData = () => {
    const mockItems = [
      {
        id: 'inv_1',
        name: 'Drilling Bit - PDC 8.5"',
        sku: 'DRL-001',
        description: 'Polycrystalline diamond compact drilling bit for hard formations',
        category: 'drilling_equipment',
        current_stock: 5,
        reorder_point: 2,
        maximum_stock: 10,
        unit: 'pieces',
        unit_cost: 15000,
        status: 'available',
        condition: 'new',
        warehouse: 'Houston Main',
        location: 'Bay 3-A',
        supplier: 'Baker Hughes',
        manufacturer: 'Baker Hughes',
        is_low_stock: false,
        stock_status: 'normal',
        total_value: 75000,
        updated_at: new Date().toISOString(),
        last_movement_type: 'receipt',
        last_movement_quantity: 2
      },
      {
        id: 'inv_2',
        name: 'Safety Harnesses - Full Body',
        sku: 'SAF-002',
        description: 'Full body safety harnesses for high altitude work',
        category: 'safety_equipment',
        current_stock: 1,
        reorder_point: 5,
        maximum_stock: 25,
        unit: 'pieces',
        unit_cost: 150,
        status: 'available',
        condition: 'good',
        warehouse: 'Offshore Platform A',
        location: 'Safety Storage',
        supplier: '3M Safety',
        manufacturer: '3M',
        is_low_stock: true,
        stock_status: 'low',
        total_value: 150,
        updated_at: new Date().toISOString(),
        last_movement_type: 'issue',
        last_movement_quantity: -3
      }
    ];

    return mockItems;
  };

  // Filter and sort inventory with enhanced options
  const filteredInventory = inventory
    .filter(item => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const searchable = [
          item.name, item.sku, item.description, 
          item.manufacturer, item.supplier
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchable.includes(search)) return false;
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (selectedCondition !== 'all' && item.condition !== selectedCondition) return false;
      if (selectedWarehouse !== 'all' && item.warehouse !== selectedWarehouse) return false;
      if (showLowStockOnly && !item.is_low_stock) return false;
      
      return true;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

  // Calculate enhanced inventory statistics
  const stats = summary || {
    total_items: inventory.length,
    total_value: inventory.reduce((sum, item) => sum + (item.total_value || 0), 0),
    low_stock_count: inventory.filter(item => item.is_low_stock || item.stock_status === 'low').length,
    out_of_stock_count: inventory.filter(item => item.current_stock === 0).length
  };

  const getStatusColor = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig?.color || 'text-gray-600 bg-gray-100';
  };

  const getConditionColor = (condition) => {
    const conditionConfig = conditionOptions.find(c => c.value === condition);
    return conditionConfig?.color || 'text-gray-600 bg-gray-100';
  };

  const getStockStatusIndicator = (item) => {
    if (item.current_stock === 0) {
      return { color: 'text-red-600', icon: AlertTriangle, label: 'Out of Stock' };
    } else if (item.is_low_stock || item.stock_status === 'low') {
      return { color: 'text-orange-600', icon: AlertCircle, label: 'Low Stock' };
    } else if (item.stock_status === 'overstocked') {
      return { color: 'text-blue-600', icon: TrendingUp, label: 'Overstocked' };
    } else {
      return { color: 'text-green-600', icon: CheckCircle, label: 'Normal' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(webRoutes.logistics)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enhanced Inventory Management</h1>
                <p className="text-gray-600 mt-1">Oil & Gas equipment and supplies tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadInventoryData}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  showLowStockOnly 
                    ? 'bg-orange-600 text-white' 
                    : 'border border-orange-300 text-orange-600 hover:bg-orange-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Low Stock ({stats.low_stock_count || 0})
              </button>
              <button
                onClick={() => navigate(webRoutes.logisticsInventoryCreate)}
                className="bg-blue-600 hover:bg-custom_yellow text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{(stats.total_items || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Across all categories</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Boxes className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_value || 0)}</p>
                <p className="text-xs text-gray-500 mt-1">Current inventory worth</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{stats.low_stock_count || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Items need reordering</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.out_of_stock_count || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Items unavailable</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search items, SKU, manufacturer..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {industryCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Conditions</option>
                {conditionOptions.map(condition => (
                  <option key={condition.value} value={condition.value}>{condition.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Warehouses</option>
                {[...new Set(inventory.map(item => item.warehouse).filter(Boolean))].map(warehouse => (
                  <option key={warehouse} value={warehouse}>{warehouse}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="current_stock-asc">Stock Low-High</option>
                <option value="current_stock-desc">Stock High-Low</option>
                <option value="unit_cost-asc">Cost Low-High</option>
                <option value="unit_cost-desc">Cost High-Low</option>
                <option value="total_value-desc">Value High-Low</option>
                <option value="updated_at-desc">Recently Updated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Inventory Items ({filteredInventory.length})
              </h3>
              <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category & Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location & Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Financial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item) => {
                    const stockIndicator = getStockStatusIndicator(item);
                    const StatusIcon = stockIndicator.icon;
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                            {item.description && (
                              <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-gray-900">
                                {industryCategories.find(c => c.value === item.category)?.label || item.category}
                              </span>
                            </div>
                            {item.condition && (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition)}`}>
                                {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                {statusOptions.find(s => s.value === item.status)?.label || item.status}
                              </span>
                              <StatusIcon className={`w-4 h-4 ${stockIndicator.color}`} />
                            </div>
                            <div className="text-xs text-gray-500">
                              <div>{item.current_stock} / {item.reorder_point || item.min_stock} {item.unit}</div>
                              {item.is_low_stock && (
                                <div className="text-orange-600 font-medium">Below reorder point</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {item.warehouse && (
                              <div className="flex items-center text-sm text-gray-900">
                                <Building className="w-4 h-4 mr-1 text-gray-400" />
                                {item.warehouse}
                              </div>
                            )}
                            {item.location && (
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="w-3 h-3 mr-1" />
                                {item.location}
                              </div>
                            )}
                            {item.supplier && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Truck className="w-3 h-3 mr-1" />
                                {item.supplier}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.unit_cost)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Total: {formatCurrency(item.total_value || (item.current_stock * item.unit_cost))}
                            </div>
                            {item.last_purchase_price && (
                              <div className="text-xs text-gray-400">
                                Last: {formatCurrency(item.last_purchase_price)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">
                              {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 
                               item.last_updated ? new Date(item.last_updated).toLocaleDateString() : '-'}
                            </div>
                            {item.last_movement_type && (
                              <div className="text-xs text-gray-400">
                                Last: {item.last_movement_type} 
                                {item.last_movement_quantity && ` (${item.last_movement_quantity})`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => navigate(webRoutes.logisticsInventoryDetail.replace(':id', item.id))}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(webRoutes.logisticsInventoryEdit.replace(':id', item.id))}
                              className="text-green-600 hover:text-green-900"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              disabled={deletingId === item.id}
                              onClick={() => {
                                if (deletingId === item.id) return;
                                const tId = toast('Delete this item?', {
                                  description: 'This action cannot be undone.',
                                  duration: 8000,
                                  action: {
                                    label: 'Confirm',
                                    onClick: async () => {
                                      try {
                                        setDeletingId(item.id);
                                        await logisticsInventoryService.delete(item.id);
                                        toast.success('Inventory item deleted');
                                        setInventory((prev) => prev.filter((x) => x.id !== item.id));
                                      } catch (e) {
                                        toast.error('Failed to delete item');
                                      } finally {
                                        setDeletingId(null);
                                        try { toast.dismiss?.(tId); } catch {}
                                      }
                                    },
                                  },
                                });
                              }}
                              className={`text-red-600 hover:text-red-900 ${deletingId === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600" title="More options">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredInventory.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No inventory items found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogisticsInventoryEnhanced;
