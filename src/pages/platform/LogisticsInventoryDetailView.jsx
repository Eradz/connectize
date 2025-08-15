import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Download, Package, AlertCircle, CheckCircle,
  TrendingUp, Building, MapPin, DollarSign, Calendar, Wrench, Settings,
  Eye, RefreshCw, Plus, Minus, FileText, Truck, User, Hash, AlertTriangle
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsInventoryService } from '../../api-services/oilgas';
import { toast } from 'sonner';

const LogisticsInventoryDetailView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [movements, setMovements] = useState([]);
  const [showAdjustStock, setShowAdjustStock] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: 0,
    type: 'add',
    reason: '',
    notes: ''
  });
  const [adjusting, setAdjusting] = useState(false);

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
    loadItemData();
  }, [id]);

  const loadItemData = async () => {
    try {
      setLoading(true);
      
      // Load item details and movement history in parallel
      const [itemData, movementsData] = await Promise.allSettled([
        logisticsInventoryService.getById(id),
        logisticsInventoryService.getMovements(id)
      ]);

      if (itemData.status === 'fulfilled') {
        setItem(itemData.value);
      } else {
        // Fallback to mock data for demo
        setItem(generateMockItemData());
      }

      if (movementsData.status === 'fulfilled') {
        setMovements(movementsData.value);
      } else {
        setMovements(generateMockMovements());
      }

    } catch (error) {
      toast.error('Failed to load item details');
      console.error('Error loading item:', error);
      // Use mock data as fallback
      setItem(generateMockItemData());
      setMovements(generateMockMovements());
    } finally {
      setLoading(false);
    }
  };

  const generateMockItemData = () => ({
    id: id,
    name: 'Drilling Bit - PDC 8.5"',
    sku: 'DRL-001',
    description: 'Polycrystalline diamond compact drilling bit for hard formations. Designed for optimal performance in challenging drilling conditions.',
    category: 'drilling_equipment',
    current_stock: 5,
    reorder_point: 2,
    maximum_stock: 10,
    minimum_stock: 1,
    unit: 'pieces',
    unit_cost: 15000,
    status: 'available',
    condition: 'new',
    warehouse: 'Houston Main',
    location: 'Bay 3-A',
    supplier: 'Baker Hughes',
    manufacturer: 'Baker Hughes',
    model_number: 'PDC-85',
    serial_number: 'SN123456',
    purchase_date: '2024-01-15',
    warranty_expiry: '2025-01-15',
    is_low_stock: false,
    stock_status: 'normal',
    total_value: 75000,
    updated_at: new Date().toISOString(),
    specifications: {
      'Diameter': '8.5 inches',
      'Type': 'PDC (Polycrystalline Diamond Compact)',
      'IADC Code': '619',
      'Weight': '45 lbs',
      'Connection': 'API 6-5/8 Reg Pin'
    },
    notes: 'High-performance drilling bit suitable for hard formations. Requires special handling and storage.'
  });

  const generateMockMovements = () => [
    {
      id: 'mov_1',
      date: '2024-01-20',
      type: 'receipt',
      quantity: 5,
      unit_cost: 15000,
      reference: 'PO-2024-001',
      notes: 'Initial stock receipt from Baker Hughes',
      created_by: 'John Smith'
    },
    {
      id: 'mov_2',
      date: '2024-01-25',
      type: 'issue',
      quantity: -2,
      reference: 'WO-2024-005',
      notes: 'Issued for Rig Alpha drilling operation',
      created_by: 'Jane Doe'
    }
  ];

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStockAdjustment = async () => {
    if (!adjustmentData.quantity || !adjustmentData.reason) {
      toast.error('Please provide quantity and reason for adjustment');
      return;
    }

    try {
      setAdjusting(true);
      
      const quantity = adjustmentData.type === 'add' 
        ? Math.abs(adjustmentData.quantity)
        : -Math.abs(adjustmentData.quantity);

      await logisticsInventoryService.adjustStock(id, {
        quantity,
        reason: adjustmentData.reason,
        notes: adjustmentData.notes
      });

      toast.success('Stock adjusted successfully');
      setShowAdjustStock(false);
      setAdjustmentData({ quantity: 0, type: 'add', reason: '', notes: '' });
      
      // Reload data
      await loadItemData();
    } catch (error) {
      toast.error('Failed to adjust stock');
      console.error('Error adjusting stock:', error);
    } finally {
      setAdjusting(false);
    }
  };

  const handleDelete = async () => {
    const tId = toast('Delete this inventory item?', {
      description: 'This action cannot be undone and will remove all associated data.',
      duration: 8000,
      action: {
        label: 'Confirm Delete',
        onClick: async () => {
          try {
            await logisticsInventoryService.delete(id);
            toast.success('Inventory item deleted successfully');
            navigate(webRoutes.logisticsInventory);
          } catch (error) {
            toast.error('Failed to delete item');
            console.error('Error deleting item:', error);
          } finally {
            try { toast.dismiss?.(tId); } catch {}
          }
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Item not found</p>
        </div>
      </div>
    );
  }

  const stockIndicator = getStockStatusIndicator(item);
  const StatusIcon = stockIndicator.icon;
  const categoryConfig = industryCategories.find(c => c.value === item.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(webRoutes.logisticsInventory)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                <p className="text-gray-600 mt-1">SKU: {item.sku}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadItemData}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowAdjustStock(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Adjust Stock
              </button>
              <button
                onClick={() => navigate(webRoutes.logisticsInventoryEdit.replace(':id', item.id))}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Item Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                  <div className="flex items-center">
                    {categoryConfig?.icon && <categoryConfig.icon className="w-4 h-4 mr-2 text-gray-600" />}
                    <span className="text-gray-900">{categoryConfig?.label || item.category}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Unit of Measurement</label>
                  <p className="text-gray-900">{item.unit}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {statusOptions.find(s => s.value === item.status)?.label || item.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Condition</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition)}`}>
                    {conditionOptions.find(c => c.value === item.condition)?.label || item.condition}
                  </span>
                </div>

                {item.model_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Model Number</label>
                    <p className="text-gray-900">{item.model_number}</p>
                  </div>
                )}

                {item.serial_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Serial Number</label>
                    <p className="text-gray-900 font-mono">{item.serial_number}</p>
                  </div>
                )}
              </div>

              {item.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                  <p className="text-gray-900">{item.description}</p>
                </div>
              )}
            </div>

            {/* Location and Supplier */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                Location & Supply Chain
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {item.warehouse && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Warehouse</label>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-gray-900">{item.warehouse}</span>
                    </div>
                  </div>
                )}

                {item.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Location/Bay</label>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-gray-900">{item.location}</span>
                    </div>
                  </div>
                )}

                {item.supplier && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Supplier</label>
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-gray-900">{item.supplier}</span>
                    </div>
                  </div>
                )}

                {item.manufacturer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Manufacturer</label>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-gray-900">{item.manufacturer}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            {item.specifications && Object.keys(item.specifications).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-indigo-600" />
                  Technical Specifications
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(item.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-500">{key}</span>
                      <span className="text-sm text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Important Dates
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {item.purchase_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Purchase Date</label>
                    <p className="text-gray-900">{formatDate(item.purchase_date)}</p>
                  </div>
                )}

                {item.warranty_expiry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Warranty Expiry</label>
                    <p className={`${new Date(item.warranty_expiry) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(item.warranty_expiry)}
                      {new Date(item.warranty_expiry) < new Date() && (
                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Expired</span>
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                  <p className="text-gray-900">{formatDate(item.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {item.notes && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-600" />
                  Notes
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{item.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stock Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Stock Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Current Stock</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900 mr-2">
                      {item.current_stock}
                    </span>
                    <span className="text-sm text-gray-500">{item.unit}</span>
                    <StatusIcon className={`w-5 h-5 ml-2 ${stockIndicator.color}`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Min Stock:</span>
                    <p className="font-medium">{item.minimum_stock || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Reorder:</span>
                    <p className="font-medium">{item.reorder_point || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Stock:</span>
                    <p className="font-medium">{item.maximum_stock || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className={`font-medium ${stockIndicator.color}`}>
                      {stockIndicator.label}
                    </p>
                  </div>
                </div>

                {(item.is_low_stock || item.stock_status === 'low') && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
                      <span className="text-sm font-medium text-orange-600">Low Stock Alert</span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">
                      Current stock is below reorder point. Consider restocking.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Financial Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Unit Cost</span>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(item.unit_cost)}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Total Value</span>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(item.total_value || (item.current_stock * item.unit_cost))}
                  </p>
                </div>

                <div className="text-xs text-gray-500 border-t pt-3">
                  <p>Based on current stock of {item.current_stock} {item.unit}</p>
                </div>
              </div>
            </div>

            {/* Recent Movements */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
                Recent Movements
              </h3>
              
              <div className="space-y-3">
                {movements.length > 0 ? (
                  movements.slice(0, 5).map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {movement.type === 'receipt' ? 'Received' : 
                           movement.type === 'issue' ? 'Issued' :
                           movement.type === 'adjustment' ? 'Adjusted' : movement.type}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(movement.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </p>
                        {movement.reference && (
                          <p className="text-xs text-gray-500">{movement.reference}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent movements</p>
                )}
              </div>

              {movements.length > 5 && (
                <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All Movements
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjust Stock</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={adjustmentData.type}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="add">Add Stock</option>
                    <option value="remove">Remove Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                  <select
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select reason</option>
                    <option value="inventory_count">Physical Inventory Count</option>
                    <option value="damaged_goods">Damaged Goods</option>
                    <option value="theft_loss">Theft/Loss</option>
                    <option value="found_items">Found Items</option>
                    <option value="correction">Data Correction</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={adjustmentData.notes}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Additional details about this adjustment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAdjustStock(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStockAdjustment}
                  disabled={adjusting || !adjustmentData.quantity || !adjustmentData.reason}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {adjusting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4 mr-2" />
                  )}
                  {adjusting ? 'Adjusting...' : 'Adjust Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsInventoryDetailView;
