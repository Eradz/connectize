import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, TrendingUp, AlertTriangle, AlertCircle, Eye, Plus,
  DollarSign, Boxes, RefreshCw, ArrowRight, Wrench, Building
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsInventoryService } from '../../api-services/oilgas';

const InventoryDashboardWidget = ({ className = "" }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [summaryData, alertsData, movementsData] = await Promise.allSettled([
        logisticsInventoryService.getSummary(),
        logisticsInventoryService.getLowStockAlerts(),
        logisticsInventoryService.getRecentMovements()
      ]);

      // Handle summary data
      if (summaryData.status === 'fulfilled') {
        setSummary(summaryData.value);
      } else {
        setSummary(generateMockSummary());
      }

      // Handle low stock alerts
      if (alertsData.status === 'fulfilled') {
        setLowStockItems(alertsData.value?.slice(0, 5) || []);
      } else {
        setLowStockItems(generateMockLowStockItems());
      }

      // Handle recent movements
      if (movementsData.status === 'fulfilled') {
        setRecentMovements(movementsData.value?.slice(0, 3) || []);
      } else {
        setRecentMovements(generateMockMovements());
      }

    } catch (error) {
      console.warn('Failed to load inventory dashboard data, using fallbacks');
      setSummary(generateMockSummary());
      setLowStockItems(generateMockLowStockItems());
      setRecentMovements(generateMockMovements());
    } finally {
      setLoading(false);
    }
  };

  const generateMockSummary = () => ({
    total_items: 1247,
    total_value: 15420000,
    low_stock_count: 23,
    out_of_stock_count: 5,
    categories_count: 14,
    recent_movements_count: 156
  });

  const generateMockLowStockItems = () => [
    {
      id: 'inv_1',
      name: 'Safety Harnesses - Full Body',
      sku: 'SAF-002',
      category: 'safety_equipment',
      current_stock: 2,
      reorder_point: 10,
      unit: 'pieces'
    },
    {
      id: 'inv_2', 
      name: 'Drilling Mud - Bentonite',
      sku: 'MUD-003',
      category: 'chemicals',
      current_stock: 15,
      reorder_point: 50,
      unit: 'barrels'
    },
    {
      id: 'inv_3',
      name: 'Ball Valves 6" API',
      sku: 'VLV-008',
      category: 'valves_fittings',
      current_stock: 3,
      reorder_point: 8,
      unit: 'pieces'
    }
  ];

  const generateMockMovements = () => [
    {
      id: 'mov_1',
      item_name: 'Drilling Bit - PDC 8.5"',
      type: 'issue',
      quantity: -2,
      date: new Date().toISOString()
    },
    {
      id: 'mov_2',
      item_name: 'Safety Equipment Kit',
      type: 'receipt',
      quantity: 25,
      date: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'mov_3',
      item_name: 'Pipe Joints 4"',
      type: 'adjustment',
      quantity: -5,
      date: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'drilling_equipment': Wrench,
      'pipe_tubing': Building,
      'safety_equipment': AlertTriangle,
      'chemicals': Package,
      'valves_fittings': Package,
      'default': Package
    };
    return iconMap[category] || iconMap.default;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Inventory Overview</h3>
              <p className="text-sm text-gray-500">Oil & gas equipment and supplies</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadDashboardData}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(webRoutes.logisticsInventory)}
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-900">
                  {(summary?.total_items || 0).toLocaleString()}
                </p>
              </div>
              <Boxes className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Value</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(summary?.total_value || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-900">
                  {summary?.low_stock_count || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-900">
                  {summary?.out_of_stock_count || 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                Low Stock Alerts
              </h4>
              {lowStockItems.length > 0 && (
                <button
                  onClick={() => navigate(webRoutes.logisticsInventory + '?low_stock=true')}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  View All
                </button>
              )}
            </div>

            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => {
                  const CategoryIcon = getCategoryIcon(item.category);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 cursor-pointer transition-colors"
                      onClick={() => navigate(webRoutes.logisticsInventoryDetail.replace(':id', item.id))}
                    >
                      <div className="flex items-center">
                        <CategoryIcon className="w-5 h-5 text-orange-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-orange-600">
                          {item.current_stock} / {item.reorder_point}
                        </p>
                        <p className="text-xs text-gray-500">{item.unit}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No low stock alerts</p>
                  <p className="text-sm text-gray-400">All items are above reorder levels</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                Recent Activity
              </h4>
              <button
                onClick={() => navigate(webRoutes.logisticsInventory)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentMovements.length > 0 ? (
                recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        movement.type === 'receipt' ? 'bg-green-500' :
                        movement.type === 'issue' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{movement.item_name}</p>
                        <p className="text-xs text-gray-500">
                          {movement.type === 'receipt' ? 'Received' :
                           movement.type === 'issue' ? 'Issued' :
                           movement.type === 'adjustment' ? 'Adjusted' : movement.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(movement.date)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Inventory movements will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate(webRoutes.logisticsInventoryCreate)}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </button>
            
            <button
              onClick={() => navigate(webRoutes.logisticsInventory + '?low_stock=true')}
              className="flex items-center justify-center px-4 py-3 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium transition-colors"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Low Stock
            </button>
            
            <button
              onClick={() => navigate(webRoutes.logisticsInventory)}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              View All
            </button>
            
            <button
              onClick={() => navigate(webRoutes.logisticsInventory + '?export=true')}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboardWidget;
