import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Inventory Management | Connectize",
    description: "Manage your inventory, track stock levels, and receive alerts across warehouses on Connectize.",
  keywords: "inventory management, warehouse, stock tracking, supply management, oil and gas",
  });

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  BarChart3
} from 'lucide-react';
import SEO from '../../components/SEO';
import { getSEOConfig } from '../../lib/seoConfig';
import { webRoutes } from '../../lib/webRoutes';
import {
  inventoryItemService,
  inventoryWarehouseService,
  inventoryAlertService,
  inventoryCategoryService
} from '../../api-services/oilgas';
import { toast } from 'sonner';

const InventoryDashboard = () => {
  const seoData = getSEOConfig("inventoryDashboard");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Data states
  const [summary, setSummary] = useState({
    total_items: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    by_category: [],
    by_warehouse: []
  });
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Quick stats
  const [quickStats, setQuickStats] = useState({
    totalValue: 0,
    lowStockItems: 0,
    recentTransactions: 0,
    warehouseUtilization: 85
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, itemsRes, warehousesRes, categoriesRes, alertsRes] = await Promise.all([
        inventoryItemService.getSummary(),
        inventoryItemService.getAll({ page_size: 20 }),
        inventoryWarehouseService.getAll(),
        inventoryCategoryService.getAll(),
        inventoryAlertService.getAll({ status: 'active', page_size: 10 })
      ]);

      setSummary(summaryRes?.data || summaryRes || {});
      setItems(itemsRes?.results || itemsRes?.data || []);
      setWarehouses(warehousesRes?.results || warehousesRes?.data || []);
      setCategories(categoriesRes?.results || categoriesRes?.data || []);
      setAlerts(alertsRes?.results || alertsRes?.data || []);

      // Calculate quick stats
      const totalValue = (itemsRes?.results || []).reduce((sum, item) => 
        sum + (parseFloat(item.unit_cost || 0) * parseFloat(item.quantity_available || 0)), 0
      );
      
      setQuickStats({
        totalValue,
        lowStockItems: summaryRes?.low_stock_count || 0,
        recentTransactions: 25, // This would come from transactions API
        warehouseUtilization: 85
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadDashboardData();
      return;
    }

    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        warehouse: selectedWarehouse,
        category: selectedCategory,
        ...(selectedFilter === 'low_stock' && { low_stock: true }),
        ...(selectedFilter === 'available' && { is_available: true }),
        ...(selectedFilter === 'unavailable' && { is_available: false })
      };

      const response = await inventoryItemService.getAll(params);
      setItems(response?.results || response?.data || []);
    } catch (error) {
      console.error('Error searching items:', error);
      toast.error('Failed to search items');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await inventoryAlertService.acknowledge(alertId);
      toast.success('Alert acknowledged');
      loadDashboardData();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStockStatusColor = (item) => {
    if (item.quantity_available === 0) return 'text-red-600 bg-red-50';
    if (item.is_low_stock) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockStatusText = (item) => {
    if (item.quantity_available === 0) return 'Out of Stock';
    if (item.is_low_stock) return 'Low Stock';
    return 'In Stock';
  };

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'low_stock':
      case 'out_of_stock':
        return <Package className="w-4 h-4" />;
      case 'expiring_soon':
      case 'expired':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
      />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-1">Manage your warehouse inventory and stock levels</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={webRoutes.inventoryItemCreate}
                className="bg-gold text-dark px-4 py-2 rounded-lg hover:bg-custom_yellow flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </Link>
              <Link
                to={webRoutes.inventoryWarehouseCreate}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Warehouse className="w-4 h-4" />
                <span>Add Warehouse</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_items}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+5.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(quickStats.totalValue)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.1%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{summary.low_stock_count}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600">-2.3%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warehouses</p>
                <p className="text-2xl font-bold text-gray-900">{warehouses.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Warehouse className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">{quickStats.warehouseUtilization}% utilization</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search items by name, SKU, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500/30 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500/30 focus:border-primary-500"
                  >
                    <option value="">All Warehouses</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                    ))}
                  </select>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500/30 focus:border-primary-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500/30 focus:border-primary-500"
                  >
                    <option value="all">All Items</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                  <button
                    onClick={handleSearch}
                    className="bg-gold text-dark px-4 py-2 rounded-lg hover:bg-custom_yellow flex items-center space-x-2"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Inventory Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.category_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.warehouse_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity_available} {item.unit_type}</div>
                          {item.quantity_reserved > 0 && (
                            <div className="text-xs text-gray-500">({item.quantity_reserved} reserved)</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(item)}`}>
                            {getStockStatusText(item)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.unit_cost * item.quantity_available)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => navigate(webRoutes.inventoryItemDetail.replace(':id', item.id))}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(webRoutes.inventoryItemEdit.replace(':id', item.id))}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {items.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first inventory item.</p>
                    <div className="mt-6">
                      <Link
                        to={webRoutes.inventoryItemCreate}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-dark bg-gold hover:bg-custom_yellow"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
                  <Link to={webRoutes.inventoryAlerts} className="text-sm text-blue-600 hover:text-blue-700">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {alerts.length > 0 ? (
                  alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getAlertIcon(alert.alert_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{alert.item_name}</p>
                          <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                        </div>
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <AlertTriangle className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No active alerts</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to={webRoutes.inventoryItems}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">View All Items</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to={webRoutes.inventoryWarehouses}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Warehouse className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Manage Warehouses</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to={webRoutes.inventoryReports}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Generate Reports</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to={webRoutes.inventoryTransactions}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <ArrowDownRight className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium">Transaction History</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
