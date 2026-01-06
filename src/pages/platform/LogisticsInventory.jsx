import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Search, Plus, Boxes, AlertCircle, TrendingUp,
  DollarSign, Eye, Edit, MoreVertical, Download, RefreshCw,
  AlertTriangle, CheckCircle, Wrench, Truck, Building, Settings,
  MapPin, Trash2
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsAPI } from '../../api-services/logistics';
import { toast } from 'sonner';
import { getSession } from '../../lib/session';

const LogisticsInventoryEnhanced = () => {
  const navigate = useNavigate();
  
  // Check session for user privileges
  const session = getSession();
  const userIsStaff = (
    session?.user?.is_staff === true ||
    session?.user?.is_superuser === true ||
    session?.is_staff === true ||
    session?.is_superuser === true ||
    localStorage.getItem('user_is_staff') === 'true' ||
    localStorage.getItem('user_is_admin') === 'true' ||
    localStorage.getItem('force_inventory_scope_all') === '1'
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
      
      // Recheck session before API call
      const currentSession = getSession();
      if (!currentSession) {
        console.error('❌ No session available for API call');
        toast.error('Please log in to access inventory data');
        navigate('/auth/login');
        return;
      }
      
      console.log('🔍 Loading inventory data...');
      console.log('🔑 Session user:', currentSession?.user);
      console.log('🔑 User privileges:', { userIsStaff, session: currentSession?.user });

      // Determine scope parameters - try both staff and regular user scopes
      const isUserStaff = userIsStaff || 
        currentSession?.user?.is_staff === true || 
        currentSession?.user?.is_superuser === true ||
        currentSession?.is_staff === true ||
        currentSession?.is_superuser === true;
        
      const scopeParams = isUserStaff ? { scope: 'all' } : {};
      console.log('🔧 Inventory API scope params:', scopeParams);
      console.log('🔧 User staff check details:', {
        userIsStaff,
        isUserStaff,
        sessionUserIsStaff: currentSession?.user?.is_staff,
        sessionUserIsSuperuser: currentSession?.user?.is_superuser,
        sessionIsStaff: currentSession?.is_staff,
        sessionIsSuperuser: currentSession?.is_superuser,
        localStorageStaff: localStorage.getItem('user_is_staff'),
        localStorageAdmin: localStorage.getItem('user_is_admin'),
        forceScope: localStorage.getItem('force_inventory_scope_all')
      });
      
      // Try multiple API calls with different parameters as fallback
      const fallbackParams = [
        scopeParams, // Primary attempt with calculated scope
        { scope: 'all' }, // Force scope=all for staff users
        {} // Fallback to no scope (user's own data)
      ];

      // Test direct API call first to verify authentication
      console.log('🧪 Testing direct API authentication...');
      try {
        const testResponse = await fetch('/api/v1/logistics/inventory-items/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentSession.tokens.access}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('🧪 Direct API test response:', testResponse.status, testResponse.statusText);
        
        if (!testResponse.ok) {
          const errorData = await testResponse.json();
          console.error('🧪 Direct API test failed:', errorData);
          
          if (testResponse.status === 401) {
            toast.error('Authentication expired. Please log in again.');
            navigate('/auth/login');
            return;
          }
        } else {
          const testData = await testResponse.json();
          console.log('🧪 Direct API test success:', testData);
        }
      } catch (directError) {
        console.error('🧪 Direct API test error:', directError);
      }

      // Try multiple API calls with fallback mechanisms
      let inventoryData = null;
      let lastError = null;
      
      for (let i = 0; i < fallbackParams.length; i++) {
        const params = fallbackParams[i];
        console.log(`🔄 Attempting inventory API call ${i + 1}/${fallbackParams.length} with params:`, params);
        
        try {
          const result = await Promise.resolve(logisticsAPI.getInventoryItems(params));
          if (result && (result.results || result.data || Array.isArray(result))) {
            inventoryData = { status: 'fulfilled', value: result };
            console.log(`✅ Inventory API call ${i + 1} successful:`, result);
            break;
          } else {
            console.warn(`⚠️ Inventory API call ${i + 1} returned empty result:`, result);
          }
        } catch (error) {
          console.warn(`❌ Inventory API call ${i + 1} failed:`, error);
          lastError = error;
          if (i === fallbackParams.length - 1) {
            inventoryData = { status: 'rejected', reason: error };
          }
        }
      }
      
      // Load other data in parallel (keep this simple for now)
      const [summaryData, categoriesData, alertsData] = await Promise.allSettled([
        Promise.resolve({}), // getSummary not available in API yet
        logisticsAPI.getInventoryCategories ? logisticsAPI.getInventoryCategories() : Promise.resolve([]),
        Promise.resolve([])  // getLowStockAlerts not available in API yet
      ]);

      console.log('📦 Inventory API response:', inventoryData);
      console.log('📦 Inventory API full details:', JSON.stringify(inventoryData, null, 2));

      // Handle inventory data with multiple fallback strategies
      if (inventoryData && inventoryData.status === 'fulfilled' && inventoryData.value) {
        console.log('🔍 Raw inventory data value:', inventoryData.value);
        console.log('🔍 Data structure check:', {
          hasData: !!inventoryData.value.data,
          hasResults: !!inventoryData.value.results,
          hasCount: !!inventoryData.value.count,
          isArray: Array.isArray(inventoryData.value),
          keys: Object.keys(inventoryData.value),
          valueType: typeof inventoryData.value
        });
        
        // Try multiple strategies to extract the inventory array
        let inventoryResults = [];
        
        // Strategy 1: Standard DRF paginated response
        if (inventoryData.value.results && Array.isArray(inventoryData.value.results)) {
          inventoryResults = inventoryData.value.results;
          console.log('✅ Using strategy 1 (DRF paginated): results array');
        }
        // Strategy 2: Direct array response
        else if (Array.isArray(inventoryData.value)) {
          inventoryResults = inventoryData.value;
          console.log('✅ Using strategy 2 (direct array): root array');
        }
        // Strategy 3: Nested data.results
        else if (inventoryData.value.data && inventoryData.value.data.results && Array.isArray(inventoryData.value.data.results)) {
          inventoryResults = inventoryData.value.data.results;
          console.log('✅ Using strategy 3 (nested): data.results array');
        }
        // Strategy 4: Just data property
        else if (inventoryData.value.data && Array.isArray(inventoryData.value.data)) {
          inventoryResults = inventoryData.value.data;
          console.log('✅ Using strategy 4 (data array): data property');
        }
        else {
          console.warn('⚠️ Could not extract inventory results from response:', inventoryData.value);
          inventoryResults = [];
        }
        
        console.log('✅ Inventory data loaded:', inventoryResults.length, 'items');
        if (inventoryResults.length > 0) {
          console.log('🔍 First item sample:', inventoryResults[0]);
          console.log('🔍 Item fields:', Object.keys(inventoryResults[0] || {}));
        }
        
        setInventory(inventoryResults);
        
        if (inventoryResults.length === 0) {
          console.warn('⚠️ No inventory items returned from API');
          console.warn('⚠️ Full API response debug:', inventoryData.value);
          
          // Try one more direct API call as absolute fallback
          console.log('🔄 Attempting direct fallback API call...');
          try {
            const directResponse = await fetch('/api/v1/logistics/inventory-items/', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${currentSession.tokens.access}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (directResponse.ok) {
              const directData = await directResponse.json();
              console.log('🔄 Direct fallback API response:', directData);
              const directResults = directData.results || directData || [];
              if (directResults.length > 0) {
                console.log('✅ Direct fallback successful, using direct results');
                setInventory(directResults);
              } else {
                toast.info('No inventory items found for your account.');
              }
            } else {
              console.error('❌ Direct fallback API failed:', directResponse.status);
              toast.error('Unable to load inventory data. Please try refreshing the page.');
            }
          } catch (directError) {
            console.error('❌ Direct fallback error:', directError);
            toast.error('Network error loading inventory. Please check your connection.');
          }
        }
      } else {
        console.warn('❌ Inventory API failed:', inventoryData?.reason || 'Unknown error');
        console.warn('❌ Full error details:', inventoryData);
        toast.error(`Failed to load inventory: ${inventoryData?.reason?.message || lastError?.message || 'Unknown error'}`);
        setInventory([]);
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
      console.error('❌ Error loading inventory:', error);
      
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
  }, []);

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
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-900">Enhanced Inventory Management</h1>
                </div>
                <p className="text-gray-600 mt-1">Oil & Gas equipment and supplies tracking</p>
                {/* Debug session indicator removed as requested */}
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
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.total_items || 0).toLocaleString()}
                  {process.env.NODE_ENV === 'development' && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Array: {Array.isArray(inventory) ? inventory.length : 'Not Array'})
                    </span>
                  )}
                </p>
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
              <button 
                onClick={handleExport}
                disabled={loading || filteredInventory.length === 0}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={filteredInventory.length === 0 ? 'No items to export' : 'Export to CSV'}
              >
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
