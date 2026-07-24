import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Warehouse,
  MapPin,
  Package,
  Users,
  ArrowLeft
} from 'lucide-react';
import { inventoryWarehouseService } from '../../api-services/inventory';
import { webRoutes } from '../../lib/webRoutes';
import { toast } from 'sonner';

const InventoryWarehouses = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const response = await inventoryWarehouseService.getAll();
      setWarehouses(response.results || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (warehouseId) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      await inventoryWarehouseService.delete(warehouseId);
      toast.success('Warehouse deleted');
      loadWarehouses();
    } catch (error) {
      toast.error('Failed to delete warehouse');
    }
  };

  const filteredWarehouses = warehouses.filter(warehouse => 
    (warehouse.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (warehouse.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(webRoutes.logisticsInventory || '/logistics/inventory')}
            className="flex items-center p-2 rounded-lg bg-pale_yellow hover:bg-gold mb-4"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
            <span className="ml-1">Back</span>
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
              <p className="mt-2 text-gray-600">Manage warehouse locations and capacity</p>
            </div>
            <Link
              to="/inventory/warehouses/create"
              className="bg-gold hover:bg-custom_yellow text-dark px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Warehouse</span>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search warehouses by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Warehouse className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Warehouses</p>
                <p className="text-2xl font-bold text-gray-900">{warehouses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Warehouses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warehouses.filter(w => w.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MapPin className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(warehouses.map(w => w.city)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warehouses.reduce((sum, w) => sum + (parseFloat(w.total_capacity) || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warehouses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map((warehouse) => (
            <div key={warehouse.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Warehouse className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{warehouse.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{warehouse.warehouse_type?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    warehouse.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {warehouse.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{warehouse.city}, {warehouse.country}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    <span>Capacity: {parseFloat(warehouse.total_capacity)?.toLocaleString() || 'N/A'} m³</span>
                  </div>

                  {warehouse.climate_controlled && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Filter className="h-4 w-4 mr-2" />
                      <span>Climate Controlled</span>
                    </div>
                  )}
                </div>

                {warehouse.address && (
                  <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                    {warehouse.address}
                  </p>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Created: {new Date(warehouse.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/inventory/warehouses/${warehouse.id}`}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/inventory/warehouses/${warehouse.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(warehouse.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredWarehouses.length === 0 && (
          <div className="text-center py-12">
            <Warehouse className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No warehouses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new warehouse location.
            </p>
            <div className="mt-6">
              <Link
                to="/inventory/warehouses/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-dark bg-gold hover:bg-custom_yellow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Warehouse
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryWarehouses;
