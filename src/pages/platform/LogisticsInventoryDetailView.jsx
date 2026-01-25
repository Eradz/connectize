import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Download, Package, AlertCircle, CheckCircle,
  TrendingUp, Building, MapPin, DollarSign, Calendar, Wrench, Settings,
  Eye, RefreshCw, Plus, Minus, FileText, Truck, User, Hash, AlertTriangle,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsAPI } from '../../api-services/logistics';
import { toast } from 'sonner';
import InventoryModal from './LogisticsInventoryForm';

const GradientCheckIcon = ({ gradientId, startColor, endColor }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.1995 5.53338L7.40754 8.33339L5.91154 6.77339C5.8515 6.70774 5.77893 6.65478 5.69811 6.61762C5.61729 6.58045 5.52985 6.55984 5.44093 6.55699C5.35202 6.55415 5.26344 6.56912 5.18041 6.60104C5.09737 6.63296 5.02156 6.68117 4.95745 6.74283C4.89334 6.8045 4.84221 6.87838 4.80709 6.96011C4.77197 7.04184 4.75356 7.12977 4.75295 7.21872C4.75233 7.30768 4.76953 7.39586 4.80352 7.47806C4.83751 7.56027 4.88761 7.63484 4.95087 7.69739L6.4882 9.29739C6.60285 9.42123 6.74143 9.52052 6.89555 9.58928C7.04967 9.65803 7.21613 9.69481 7.38487 9.69739H7.40687C7.57224 9.69794 7.73607 9.66563 7.88885 9.60234C8.04164 9.53906 8.18033 9.44605 8.29687 9.32873L11.1449 6.48072C11.2071 6.41865 11.2564 6.34493 11.2902 6.26378C11.3239 6.18263 11.3413 6.09563 11.3414 6.00776C11.3415 5.91988 11.3242 5.83285 11.2907 5.75163C11.2572 5.67041 11.2079 5.59659 11.1459 5.53438C11.0838 5.47218 11.0101 5.42281 10.9289 5.3891C10.8478 5.35538 10.7608 5.33798 10.6729 5.33789C10.585 5.3378 10.498 5.35501 10.4168 5.38856C10.3356 5.4221 10.2617 5.47131 10.1995 5.53338V5.53338Z" fill={`url(#${gradientId})`}/>
    <defs>
      <linearGradient id={gradientId} x1="5.0436" y1="7.26995" x2="11.6152" y2="7.5443" gradientUnits="userSpaceOnUse">
        <stop stopColor={startColor}/>
        <stop offset="1" stopColor={endColor}/>
      </linearGradient>
    </defs>
  </svg>
);

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
  const [showEditModal, setShowEditModal] = useState(false);
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

    const [itemRes, movementsRes] = await Promise.all([
      logisticsAPI.getInventoryItem(id),
      logisticsAPI.getInventoryMovements({ item: id })
    ]);

    // Inventory item is mandatory
    if (!itemRes) {
      toast.error('Inventory item not found');
      navigate(webRoutes.logisticsInventory);
      return;
    }

    setItem(itemRes);

    // Movements can be empty but must be real
    const movementList =
      movementsRes?.results ||
      movementsRes?.data ||
      movementsRes ||
      [];

    setMovements(movementList);

  } catch (error) {
    console.error('Error loading inventory item:', error);
    toast.error('Failed to load inventory item');
    navigate(webRoutes.logisticsInventory);
  } finally {
    setLoading(false);
  }
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

      await logisticsAPI.adjustStock(id, {
        quantity,
        reason: adjustmentData.reason,
        notes: adjustmentData.notes
      });

      toast.success('Stock adjusted successfully');
      setShowAdjustStock(false);
      setAdjustmentData({ quantity: 0, type: 'add', reason: '', notes: '' });
      
      await loadItemData();
    } catch (error) {
      toast.error('Failed to adjust stock');
      console.error('Error adjusting stock:', error);
    } finally {
      setAdjusting(false);
    }
  };

 const handleSave = async (formData, isEdit) => {
  try {
    await logisticsAPI.updateInventoryItem(id, formData);
    toast.success('Inventory item updated successfully');
    setShowEditModal(false);
    await loadItemData(); // Reload the data
  } catch (error) {
    toast.error('Failed to update item');
    console.error('Error:', error);
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
          await logisticsAPI.deleteInventoryItem(id);
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
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
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
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <div className="flex items-center space-x-4">
    <button
      onClick={() => navigate(webRoutes.logisticsInventory)}
      className="p-2 rounded-lg bg-amber-400 hover:bg-amber-500 transition-colors"
    >
      <ArrowLeft className="w-5 h-5 text-white" />
    </button>
    <div>
      <h1 className="text-xl font-semibold text-gray-900">{item.name}</h1>
      <p className="text-sm text-gray-500 mt-0.5">SKU: {item.sku}</p>
    </div>
  </div>
  <div className="flex items-center space-x-2 pl-14 sm:pl-0">
    <button
  onClick={() => setShowAdjustStock(true)}
  className="px-3 py-2 sm:px-4 sm:bg-gray-100 bg-white border border-gray-300 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center text-xs sm:text-sm font-medium transition-colors"
>
  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
  Adjust Stock
</button>
    <button
      onClick={() => setShowEditModal(true)}
      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg flex items-center text-sm font-medium transition-colors"
    >
      <Edit className="w-4 h-4 mr-2" />
      Edit
    </button>
    <button
      onClick={handleDelete}
      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center text-sm font-medium transition-colors"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Delete
    </button>
  </div>
</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Item Details */}
            <div className="bg-white rounded-lg border">
              <div className="px-5 py-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Package className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base font-semibold text-gray-900">Item Details</h3>
                </div>
              
                <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                      <p className="text-sm text-gray-900">{item.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                        <p className="text-sm text-gray-900">{categoryConfig?.label || item.category}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Unit of Measurement</label>
                        <p className="text-sm text-gray-900">{item.unit}</p>
                      </div>
                     <div>
  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
  <span className="inline-flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-full border-2" style={{
    borderColor: '#4EB608',
    background: 'linear-gradient(to right, #4EB608, #094300)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }}>
    <span style={{
      background: 'linear-gradient(to right, #4EB608, #094300)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    }}>{statusOptions.find(s => s.value === item.status)?.label || item.status}</span>
    <div className="flex items-center space-x-1 ml-2">
      <GradientCheckIcon gradientId="status-gradient" startColor="#4EB608" endColor="#094300" />
      
    </div>
  </span>
</div>
                     <div>
  <label className="block text-xs font-medium text-gray-500 mb-1">Condition</label>
  <span className="inline-flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-full border-2" style={{
    borderColor: '#FFC000',
    background: 'linear-gradient(to right, #FFC000, #FF8400)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }}>
    <span style={{
      background: 'linear-gradient(to right, #FFC000, #FF8400)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    }}>{conditionOptions.find(c => c.value === item.condition)?.label || item.condition}</span>
    <div className="flex items-center space-x-1 ml-2">
      <GradientCheckIcon gradientId="condition-gradient" startColor="#FFC000" endColor="#FF8400" />
    </div>
  </span>
</div>
                      {item.model_number && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Model Number</label>
                          <p className="text-sm text-gray-900">{item.model_number}</p>
                        </div>
                      )}
                      {item.serial_number && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Serial Number</label>
                          <p className="text-sm text-gray-900 font-mono">{item.serial_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </div>

            {/* Location & Supply Chain */}
            <div className="bg-white rounded-lg border">
              <div className="px-5 py-4">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base font-semibold text-gray-900">Location & Supply Chain</h3>
                </div>
              
                <div className="grid grid-cols-2 gap-4">
                    {item.warehouse && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Warehouse</label>
                        <p className="text-sm text-gray-900">{item.warehouse}</p>
                      </div>
                    )}
                    {item.location && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Location/Bay</label>
                        <p className="text-sm text-gray-900">{item.location}</p>
                      </div>
                    )}
                    {item.supplier && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Supplier</label>
                        <p className="text-sm text-gray-900">{item.supplier}</p>
                      </div>
                    )}
                    {item.manufacturer && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Manufacturer</label>
                        <p className="text-sm text-gray-900">{item.manufacturer}</p>
                      </div>
                    )}
                  </div>
              </div>
            </div>

            {/* Technical Specifications */}
            {item.specifications && Object.keys(item.specifications).length > 0 && (
              <div className="bg-white rounded-lg border">
                <div className="px-5 py-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base font-semibold text-gray-900">Technical Specifications</h3>
                  </div>
                
                  <div className="space-y-3">
                      {Object.entries(item.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500">{key}</span>
                          <span className="text-sm text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="bg-white rounded-lg border">
              <div className="px-5 py-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base font-semibold text-gray-900">Dates</h3>
                </div>
              
                <div className="space-y-3">
                    {item.purchase_date && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Purchase Date</span>
                        <span className="text-sm text-gray-900">{formatDate(item.purchase_date)}</span>
                      </div>
                    )}
                    {item.warranty_expiry && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Warranty Expiry</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${new Date(item.warranty_expiry) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatDate(item.warranty_expiry)}
                          </span>
                          {new Date(item.warranty_expiry) < new Date() && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Expired</span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">Last Updated</span>
                      <span className="text-sm text-gray-900">{formatDate(item.updated_at)}</span>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Notes */}
            {item.notes && (
              <div className="bg-white rounded-lg border p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.notes}</p>
              </div>
            )}

            {/* Stock Information */}
            <div className="bg-white rounded-lg border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Stock Information</h3>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  {stockIndicator.label.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Current Stock</span>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-900">{item.current_stock}</span>
                    <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Min Stock</span>
                  <span className="text-sm text-gray-900">{item.minimum_stock || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Max Stock</span>
                  <span className="text-sm text-gray-900">{item.maximum_stock || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Reorder</span>
                  <span className="text-sm text-gray-900">{item.reorder_point || 0}</span>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-white rounded-lg border p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Financial Details</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Unit Cost</span>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(item.unit_cost)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Total Value</span>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(item.total_value || (item.current_stock * item.unit_cost))}
                  </p>
                </div>
                <p className="text-xs text-gray-400 pt-2 border-t">
                  Based on current stock of {item.current_stock} {item.unit}
                </p>
              </div>
            </div>

            {/* Recent Movements */}
            <div className="bg-white rounded-lg border p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Movements</h3>
              
              <div className="space-y-3">
                {movements.length > 0 ? (
                  movements.slice(0, 5).map((movement) => (
                    <div key={movement.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-xs font-medium text-gray-900">
                          {movement.type === 'receipt' ? 'Received' : 
                           movement.type === 'issue' ? 'Issued' :
                           movement.type === 'adjustment' ? 'Adjusted' : movement.type}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(movement.date)}</p>
                        {movement.reference && (
                          <p className="text-xs text-gray-400 mt-0.5">{movement.reference}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">No recent movements</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

{/* Stock Adjustment Modal */}
      {showAdjustStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Adjust Stock</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={adjustmentData.type}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                  <select
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAdjustStock(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStockAdjustment}
                  disabled={adjusting || !adjustmentData.quantity || !adjustmentData.reason}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium transition-colors"
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

      {/* Edit Modal - ADD THIS ENTIRE SECTION */}
      <InventoryModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        itemId={id}
        currentData={item}
        onSave={handleSave}
      />
    </div>
  );
};

export default LogisticsInventoryDetailView