import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Search, Plus, Boxes, AlertCircle, TrendingUp,
  DollarSign, Eye, Edit, MoreVertical, Download, RefreshCw,
  AlertTriangle, CheckCircle, Wrench, Truck, Building, Settings,
  MapPin, Trash2,
  Pen,
  Clock,
  MessageCircleWarning,
  CircleAlert
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsAPI } from '../../api-services/logistics';
import { inventoryWarehouseService } from '../../api-services/inventory';
import { toast } from 'sonner';
import { getSession } from '../../lib/session';
import { WarningIcon } from '../../components/ui/ModernIcon';

const LogisticsInventoryEnhanced = () => {
  const navigate = useNavigate();
  
  // Check session for user privileges (server-validated only)
  const session = getSession();
  const userIsStaff = (
    session?.user?.is_staff === true ||
    session?.user?.is_superuser === true ||
    session?.is_staff === true ||
    session?.is_superuser === true
  );
  
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
  const [warehouses, setWarehouses] = useState([]);
  const [fieldChoices, setFieldChoices] = useState({
    categories: [],
    statuses: [],
    conditions: [],
    units: []
  });
  const [loadingChoices, setLoadingChoices] = useState(true);

  // Calculate enhanced inventory statistics with robust error handling
  // (Placed early to avoid temporal dead zone when referenced in effects below)
  const stats = React.useMemo(() => {
    console.log('📊 Calculating stats for inventory:', inventory ? inventory.length : 0, 'items');
    if (!inventory || !Array.isArray(inventory)) {
      console.warn('📊 Invalid inventory data for stats calculation:', inventory);
      return {
        total_items: 0,
        total_value: 0,
        low_stock_count: 0,
        out_of_stock_count: 0
      };
    }
    try {
      const calculatedStats = {
        total_items: inventory.length,
        total_value: inventory.reduce((sum, item) => {
          const itemValue = (
            item.total_value ||
            (parseFloat(item.current_stock || 0) * parseFloat(item.unit_price || item.unit_cost || 0)) ||
            0
          );
          return sum + itemValue;
        }, 0),
        low_stock_count: inventory.filter(item => {
          const currentStock = parseFloat(item.current_stock || 0);
            const minStock = parseFloat(item.minimum_stock || item.reorder_point || 0);
            return item.is_low_stock || item.stock_status === 'low' || (minStock > 0 && currentStock <= minStock && currentStock > 0);
        }).length,
        out_of_stock_count: inventory.filter(item => {
          const currentStock = parseFloat(item.current_stock || 0);
          return currentStock === 0 || item.stock_status === 'out_of_stock';
        }).length
      };
      console.log('📊 Calculated stats:', calculatedStats);
      if (summary && typeof summary === 'object') {
        return { ...calculatedStats, ...summary };
      }
      return calculatedStats;
    } catch (error) {
      console.error('📊 Error calculating stats:', error);
      return {
        total_items: inventory.length || 0,
        total_value: 0,
        low_stock_count: 0,
        out_of_stock_count: 0
      };
    }
  }, [inventory, summary]);

  // Icon mapping for categories (icons stay in frontend for UI)
  const categoryIcons = {
    drilling_equipment: Wrench,
    pipe_tubing: Building,
    wellhead_equipment: Settings,
    production_equipment: TrendingUp,
    safety_equipment: AlertTriangle,
    maintenance_tools: Wrench,
    chemicals: Package,
    valves_fittings: Settings,
    electrical_equipment: TrendingUp,
    instrumentation: Settings,
    ppe: AlertTriangle,
    consumables: Package,
    spare_parts: Settings,
    other: Package
  };

  // Color mapping for statuses and conditions (colors stay in frontend for UI)
  const statusColors = {
    available: 'text-green-600 bg-green-100',
    reserved: 'text-blue-600 bg-blue-100',
    in_use: 'text-purple-600 bg-purple-100',
    maintenance: 'text-orange-600 bg-orange-100',
    damaged: 'text-red-600 bg-red-100',
    obsolete: 'text-gray-600 bg-gray-100',
    disposed: 'text-red-800 bg-red-200'
  };

  const conditionColors = {
    new: 'text-green-600 bg-green-100',
    excellent: 'text-blue-600 bg-blue-100',
    good: 'text-green-500 bg-green-50',
    fair: 'text-yellow-600 bg-yellow-100',
    poor: 'text-orange-600 bg-orange-100',
    damaged: 'text-red-600 bg-red-100'
  };

  // Fallback hard-coded data (only used if API fails)
  const FALLBACK_CATEGORIES = [
    { value: 'drilling_equipment', label: 'Drilling Equipment' },
    { value: 'pipe_tubing', label: 'Pipes & Tubing' },
    { value: 'wellhead_equipment', label: 'Wellhead Equipment' },
    { value: 'production_equipment', label: 'Production Equipment' },
    { value: 'safety_equipment', label: 'Safety Equipment' },
    { value: 'maintenance_tools', label: 'Maintenance Tools' },
    { value: 'chemicals', label: 'Chemicals & Fluids' },
    { value: 'valves_fittings', label: 'Valves & Fittings' },
    { value: 'electrical_equipment', label: 'Electrical Equipment' },
    { value: 'instrumentation', label: 'Instrumentation' },
    { value: 'ppe', label: 'Personal Protective Equipment' },
    { value: 'consumables', label: 'Consumables' },
    { value: 'spare_parts', label: 'Spare Parts' },
    { value: 'other', label: 'Other' }
  ];

  const FALLBACK_STATUSES = [
    { value: 'available', label: 'Available' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'in_use', label: 'In Use' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'obsolete', label: 'Obsolete' },
    { value: 'disposed', label: 'Disposed' }
  ];

  const FALLBACK_CONDITIONS = [
    { value: 'new', label: 'New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'damaged', label: 'Damaged' }
  ];

  // Get options with icons and colors
  const industryCategories = fieldChoices.categories.map(cat => ({
    ...cat,
    icon: categoryIcons[cat.value] || Package
  }));

  const statusOptions = fieldChoices.statuses.map(status => ({
    ...status,
    color: statusColors[status.value] || 'text-gray-600 bg-gray-100'
  }));

  const conditionOptions = fieldChoices.conditions.map(condition => ({
    ...condition,
    color: conditionColors[condition.value] || 'text-gray-600 bg-gray-100'
  }));

  // Load field choices from API
  const loadFieldChoices = async () => {
    try {
      setLoadingChoices(true);
      console.log('📋 Loading field choices from API...');
      const choices = await logisticsAPI.getInventoryFieldChoices();
      console.log('📋 Field choices loaded:', choices);
      
      setFieldChoices({
        categories: choices.categories || FALLBACK_CATEGORIES,
        statuses: choices.statuses || FALLBACK_STATUSES,
        conditions: choices.conditions || FALLBACK_CONDITIONS,
        units: choices.units || []
      });
    } catch (error) {
      console.error('❌ Failed to load field choices, using fallback:', error);
      setFieldChoices({
        categories: FALLBACK_CATEGORIES,
        statuses: FALLBACK_STATUSES,
        conditions: FALLBACK_CONDITIONS,
        units: []
      });
      toast.error('Some dropdown options may be limited');
    } finally {
      setLoadingChoices(false);
    }
  };

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      
      const currentSession = getSession();
      if (!currentSession) {
        toast.error('Please log in to access inventory data');
        navigate('/auth/login');
        return;
      }

      // Determine scope based on user privileges
      const isUserStaff = userIsStaff || 
        currentSession?.user?.is_staff === true || 
        currentSession?.user?.is_superuser === true ||
        currentSession?.is_staff === true ||
        currentSession?.is_superuser === true;
        
      const scopeParams = isUserStaff ? { scope: 'all' } : {};

      // Load inventory + supporting data in parallel
      const [inventoryResult, categoriesResult] = await Promise.allSettled([
        logisticsAPI.getInventoryItems(scopeParams),
        logisticsAPI.getInventoryCategories ? logisticsAPI.getInventoryCategories() : Promise.resolve([]),
      ]);

      // Handle inventory data
      if (inventoryResult.status === 'fulfilled' && inventoryResult.value) {
        const data = inventoryResult.value;
        const items = Array.isArray(data) ? data
          : Array.isArray(data.results) ? data.results
          : Array.isArray(data.data?.results) ? data.data.results
          : Array.isArray(data.data) ? data.data
          : [];
        
        setInventory(items);
      } else {
        const errMsg = inventoryResult.reason?.message || 'Unknown error';
        if (errMsg.includes('Authentication required') || inventoryResult.reason?.status === 401) {
          toast.error('Authentication expired. Please log in again.');
          navigate('/auth/login');
          return;
        }
        toast.error(`Failed to load inventory: ${errMsg}`);
        setInventory([]);
      }

      // Handle categories
      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value || []);
      }

    } catch (error) {
      console.error('Error loading inventory:', error);
      if (error.message?.includes('Authentication required')) {
        toast.error('Please log in to access inventory data');
        navigate('/auth/login');
      } else {
        toast.error(`Failed to load inventory data: ${error.message}`);
        setInventory([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debug logging for component state changes
    console.log('🔍 Component state update:', {
      inventoryLength: inventory?.length || 0,
      loading,
      session: !!session,
      userIsStaff,
      stats
    });
  }, [inventory, loading, session, userIsStaff, stats]);

  useEffect(() => {
    // Check authentication before loading data
    const session = getSession();
    console.log('🔍 Initial session check:', session ? 'Found session' : 'No session');
    
    if (!session) {
      console.warn('❌ No session found, redirecting to login');
      navigate('/auth/login');
      return;
    }
    
    // Load field choices and inventory data
    loadFieldChoices();
    loadInventoryData();
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const response = await inventoryWarehouseService.getAll();
      setWarehouses(response.results || response || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
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

  const handleExport = async () => {
    try {
      console.log('📥 Starting export...');
      toast.info('Preparing export...');

      // Build filter parameters matching current view
      const filters = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedCondition !== 'all') filters.condition = selectedCondition;
      if (selectedWarehouse !== 'all') filters.warehouse = selectedWarehouse;
      if (searchTerm) filters.search = searchTerm;
      if (showLowStockOnly) filters.low_stock = 'true';

      // Call API to get CSV blob
      const blob = await logisticsAPI.exportInventoryItems(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported ${filteredInventory.length} items successfully`);
      console.log('✅ Export completed');
    } catch (error) {
      console.error('❌ Export failed:', error);
      toast.error('Failed to export inventory. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-6">
              <button
                onClick={() => navigate(webRoutes.logistics)}
                className="w-fit mb-2 flex items-center p-2 rounded-lg bg-pale_yellow hover:bg-gold"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <span className='ml-1'>Back</span>
              </button>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between lg:space-x-4">
              <div>
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-900">Enhanced Inventory Management</h1>
                </div>
                <p className="text-gray-600 mt-1">Oil & Gas equipment and supplies tracking</p>
                {/* Debug session indicator removed as requested */}
              </div>
              <div className="flex flex-wrap mt-2 md:mt-0 lg:items-center justify-between md:gap-3 w-full lg:w-max">
              <button
                onClick={() => navigate(webRoutes.inventoryWarehouseCreate)}
                className="w-[50%] md:w-[50%] lg:w-fit justify-center bg-white border border-gray-300 hover:bg-gray-50 px-0 lg:px-4 py-2 rounded-lg flex items-center text-sm"
              >
                <Building className="w-4 h-4 mr-2" />
                Add Warehouse
              </button>
              <button
                onClick={() => navigate(webRoutes.logisticsInventoryCreate)}
                className="w-[45%] md:w-[50%] lg:w-fit justify-center bg-gold hover:bg-custom_yellow px-0 lg:px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
              <button 
                  onClick={handleExport}
                  disabled={loading || filteredInventory.length === 0}
                  className="w-full md:w-[50%] lg:w-fit mt-2 md:mt-0 justify-center flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={filteredInventory.length === 0 ? 'No items to export' : 'Export to CSV'}
                >
                  {/* <Download className="w-4 h-4 mr-2" /> */}
                  Export Csv
              </button>
              </div>
            </div>
            
              {/* <button
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
              </button> */}
            
          </div>
        </div>

      <div className="max-w-7xl mx-auto ">
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4 sm:px-6 lg:px-8">
          {/* Total Items Card */}
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-pale_yellow rounded-lg">
                <Settings className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Items</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {(stats.total_items || 0).toLocaleString()}
              {process.env.NODE_ENV === 'development' && (
                <span className="text-xs text-gray-500 ml-2">
                  (Array: {Array.isArray(inventory) ? inventory.length : 'Not Array'})
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">Across all categories</p>
          </div>

          {/* Total Value Card */}
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-pale_yellow rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(stats.total_value || 0)}</p>
            <p className="text-xs text-gray-500">Current inventory worth</p>
          </div>

          {/* Low Stock Alerts Card */}
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-pale_yellow rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{stats.low_stock_count || 0}</p>
            <p className="text-xs text-gray-500">Items need reordering</p>
          </div>

          {/* Out of Stock Card */}
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-pale_yellow rounded-lg">
                <CircleAlert className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Out Of Stock</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.out_of_stock_count || 0}</p>
            <p className="text-xs text-gray-500">Items unavailable</p>
          </div>
        </div>
          <div className='bg-white space-y-2 p-5'>
            {/* Enhanced Filters and Search */}
            <div className=" ">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className='col-span-6'>
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
                  <div className='flex flex-wrap md:flex-row gap-2 col-span-6'>
                    <div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        {industryCategories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={selectedCondition}
                        onChange={(e) => setSelectedCondition(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Conditions</option>
                        {conditionOptions.map(condition => (
                          <option key={condition.value} value={condition.value}>{condition.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Warehouses</option>
                        {warehouses.map(wh => (
                          <option key={wh.id} value={wh.name}>{wh.name} — {wh.city}</option>
                        ))}
                        {[...new Set(inventory.map(item => item.warehouse).filter(Boolean))]
                          .filter(w => !warehouses.some(wh => wh.name === w))
                          .map(warehouse => (
                            <option key={warehouse} value={warehouse}>{warehouse}</option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [field, order] = e.target.value.split('-');
                          setSortBy(field);
                          setSortOrder(order);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>

            {/* Enhanced Inventory Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Inventory Items ({filteredInventory.length})
                </h3>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No inventory items found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {filteredInventory.map((item) => {
                    const stockIndicator = getStockStatusIndicator(item);
                    const StatusIcon = stockIndicator.icon;
                    
                    return (
                      <div key={item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ">
                        <div className="p-6 ">
                          {/* Header with Title and Edit Button */}
                          <div className="flex items-start justify-between mb-4 truncate">
                            <div className="flex-1 pr-3">
                              <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                                <div className="text-xs text-gray-600 mt-2 truncate ">{item.description}</div>
                            </div>
                            <button
                              onClick={() => navigate(webRoutes.logisticsInventoryEdit.replace(':id', item.id))}
                              className="flex-shrink-0 bg-pale_yellow px-3 py-1.5 rounded-lg hover:bg-gold text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <Pen className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          </div>

                          {/* Two Column Info Layout */}
                          <div className="grid grid-cols-2 gap-4 mb-4 pr-[30%] ">
                            {/* Top Row */}
                            <div className='flex justify-between col-span-2'>
                              <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Status</p>
                                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full mb-1 ${getStatusColor(item.status)}`}>
                                  {statusOptions.find(s => s.value === item.status)?.label || item.status}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <StatusIcon className={`w-4 h-4 ${stockIndicator.color}`} />
                                  <span className="text-sm text-gray-900">
                                    {item.current_stock} / {item.reorder_point || item.min_stock || 0} {item.unit || 'units'}
                                  </span>
                                </div>
                              </div>

                              <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Condition</p>
                                {item.condition && (
                              <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getConditionColor(item.condition)}`}>
                                {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                              </span>
                            )}
                                {/* <p className="text-sm text-gray-900">
                                  {item.condition ? item.condition.charAt(0).toUpperCase() + item.condition.slice(1) : 'N/A'}
                                </p> */}
                              </div>
                              
                            </div>

                            {/* Bottom Row */}
                            <div className='flex justify-between col-span-2'>
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">Financial</p>
                                <div className="text-sm font-medium text-gray-900">{formatCurrency(item.unit_cost)}</div>
                                <div className="text-xs text-gray-500">Total: {formatCurrency(item.total_value || (item.current_stock * item.unit_cost))}</div>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">Last Activity</p>
                                <p className="text-sm text-gray-900">
                                  {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 
                                  item.last_updated ? new Date(item.last_updated).toLocaleDateString() : '-'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Category & Warehouse Section */}
                          <div className="border-t border-gray-200 pt-4 mb-4 space-y-3 pr-[25%]">
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">Category</p>
                              <p className="text-sm text-gray-600">
                                {industryCategories.find(c => c.value === item.category)?.label || item.category}
                              </p>
                            </div>
                            <div className='flex justify-between'>
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">Warehouse</p>
                                <p className="text-sm text-gray-600 line-clamp-1">{item.warehouse || 'Not specified'}</p>
                              </div>

                              {item.location && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 mb-1">Location/Bay</p>
                                  <p className="text-sm text-gray-600 line-clamp-1">{item.location}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Supplier & Manufacturer Section */}
                          <div className="flex justify-between pt-4 space-y-3 pr-[25%]">
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">Supplier</p>
                              <p className="text-sm text-gray-600">{item.supplier || 'Not specified'}</p>
                            </div>

                            {item.manufacturer && (
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">Manufacturer</p>
                                <p className="text-sm text-gray-600">{item.manufacturer}</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="w-full md:w-[70%] flex items-center gap-3 pt-4 border-t border-gray-200">
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
                                        await logisticsAPI.deleteInventoryItem(item.id);
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
                              className={`flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1 ${deletingId === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>

                            <button
                              onClick={() => navigate(webRoutes.logisticsInventoryDetail.replace(':id', item.id))}
                              className="flex-1 bg-pale_yellow hover:bg-gold px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default LogisticsInventoryEnhanced;
