import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Package, Edit, RefreshCw, Plus, Minus, Trash2, 
  AlertTriangle, Clock, MapPin, FileText, Settings, TrendingUp,
  Activity, Tag, Wrench, Truck, Building
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsInventoryService } from '../../api-services/oilgas';
import { toast } from 'sonner';

export default function LogisticsInventoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustQty, setAdjustQty] = useState(1);
  const [movementType, setMovementType] = useState('adjustment');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [movements, setMovements] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await logisticsInventoryService.getById(id);
      setItem(data);
      
      // Load recent movements
      if (data.recent_movements) {
        setMovements(data.recent_movements);
      }
    } catch (err) {
      console.warn('Inventory detail API failed, falling back');
      toast.error('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-100';
      case 'overstocked': return 'text-orange-600 bg-orange-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'new': return 'text-green-600 bg-green-100';
      case 'excellent': return 'text-blue-600 bg-blue-100';
      case 'good': return 'text-gray-600 bg-gray-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-orange-600 bg-orange-100';
      case 'damaged': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const adjustStock = async () => {
    if (!adjustQty || adjustQty === 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      setAdjusting(true);
      await logisticsInventoryService.adjustStock(id, {
        quantity: movementType === 'issue' ? -Math.abs(adjustQty) : Math.abs(adjustQty),
        movement_type: movementType,
        reference: reference,
        notes: notes
      });
      
      toast.success(`Stock ${movementType === 'issue' ? 'decreased' : 'increased'} successfully`);
      setReference('');
      setNotes('');
      await load();
    } catch (e) {
      toast.error('Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  if (!item && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen ">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(webRoutes.logisticsInventory)} className="p-2 rounded-lg hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                <p className="text-gray-600 mt-1">SKU: {item.sku}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={load} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => {
                  if (deleting) return;
                  // Toast-confirm: show a confirmation toast with an action button
                  const idRef = toast(
                    'Delete this item?',
                    {
                      description: 'This action cannot be undone.',
                      duration: 8000,
                      action: {
                        label: 'Confirm',
                        onClick: async () => {
                          try {
                            setDeleting(true);
                            await logisticsInventoryService.delete(id);
                            toast.success('Inventory item deleted');
                            navigate(webRoutes.logisticsInventory);
                          } catch (e) {
                            toast.error('Failed to delete item');
                          } finally {
                            setDeleting(false);
                            // Best-effort dismiss
                            try { toast.dismiss?.(idRef); } catch {}
                          }
                        },
                      },
                    }
                  );
                }}
                className={`px-4 py-2 rounded-lg flex items-center border ${deleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50'} text-red-600 border-red-200`}
                disabled={deleting}
                title="Delete"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
              <button onClick={() => navigate(webRoutes.logisticsInventoryEdit.replace(':id', id))} className="bg-blue-600 hover:bg-custom_yellow text-white px-4 py-2 rounded-lg flex items-center">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">{item.current_stock} {item.unit}</p>
                {item.stock_status && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStockStatusColor(item.stock_status)}`}>
                    {item.stock_status === 'low' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {item.stock_status.charAt(0).toUpperCase() + item.stock_status.slice(1)} Stock
                  </span>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unit Cost</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(item.unit_cost)}</p>
                {item.last_purchase_price && (
                  <p className="text-xs text-gray-500 mt-1">Last: {formatCurrency(item.last_purchase_price)}</p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(item.total_value)}</p>
                <p className="text-xs text-gray-500 mt-1">Reorder at: {item.reorder_point} {item.unit}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Condition</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getConditionColor(item.condition)}`}>
                  {item.condition?.charAt(0).toUpperCase() + item.condition?.slice(1)}
                </span>
                <p className="text-xs text-gray-500 mt-2">Status: {item.status}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Settings className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Package },
                { id: 'specifications', label: 'Specifications', icon: FileText },
                { id: 'movements', label: 'Stock Movements', icon: Activity },
                { id: 'adjust', label: 'Adjust Stock', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Basic Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium">{item.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{item.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit:</span>
                      <span className="font-medium">{item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Counted:</span>
                      <span className="font-medium">{formatDate(item.last_counted)}</span>
                    </div>
                    {item.description && (
                      <div className="pt-3 border-t">
                        <span className="text-gray-600 block mb-2">Description:</span>
                        <span className="font-medium">{item.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location & Supply
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Warehouse:</span>
                      <span className="font-medium">{item.warehouse || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{item.location || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bin Location:</span>
                      <span className="font-medium">{item.bin_location || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier:</span>
                      <span className="font-medium">{item.supplier || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier Part #:</span>
                      <span className="font-medium">{item.supplier_part_number || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manufacturer:</span>
                      <span className="font-medium">{item.manufacturer || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mfg Part #:</span>
                      <span className="font-medium">{item.manufacturer_part_number || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  Technical Specifications
                </h3>
                {item.specifications && Object.keys(item.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(item.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No specifications recorded</p>
                )}

                {item.serial_numbers && item.serial_numbers.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Serial Numbers</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.serial_numbers.map((serial, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-mono">
                          {serial}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'movements' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Stock Movements
                </h3>
                {movements && movements.length > 0 ? (
                  <div className="space-y-3">
                    {movements.map((movement) => (
                      <div key={movement.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            movement.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {movement.movement_type?.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(movement.created_at)}</span>
                        </div>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>Quantity:</span>
                            <span className={`font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {movement.quantity > 0 ? '+' : ''}{movement.quantity} {item.unit}
                            </span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Balance After:</span>
                            <span className="font-medium">{movement.balance_after} {item.unit}</span>
                          </div>
                          {movement.reference && (
                            <div className="flex justify-between mb-1">
                              <span>Reference:</span>
                              <span className="font-medium">{movement.reference}</span>
                            </div>
                          )}
                          {movement.notes && (
                            <div className="mt-2 text-gray-600">
                              <span className="font-medium">Notes:</span> {movement.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No movements recorded</p>
                )}
              </div>
            )}

            {activeTab === 'adjust' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Adjust Stock Levels
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 max-w-md">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type</label>
                      <select 
                        value={movementType} 
                        onChange={(e) => setMovementType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="receipt">Receipt (Incoming)</option>
                        <option value="issue">Issue (Outgoing)</option>
                        <option value="adjustment">Adjustment</option>
                        <option value="return">Return</option>
                        <option value="transfer">Transfer</option>
                        <option value="cycle_count">Cycle Count</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={adjustQty}
                        onChange={(e) => setAdjustQty(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter quantity"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="PO#, WO#, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Additional notes..."
                      />
                    </div>

                    <button
                      onClick={adjustStock}
                      disabled={adjusting || !adjustQty}
                      className="w-full bg-blue-600 hover:bg-custom_yellow disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      {adjusting ? 'Adjusting...' : `${movementType === 'issue' ? 'Decrease' : 'Increase'} Stock`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
