import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Warehouse, MapPin, Package,
  Thermometer, Shield, Award, Clock, Mail, Phone, Building
} from 'lucide-react';
import { inventoryWarehouseService, warehouseOptionService } from '../../api-services/inventory';
import { webRoutes } from '../../lib/webRoutes';
import { toast } from 'sonner';

const WarehouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [warehouseTypeLabel, setWarehouseTypeLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadWarehouse();
  }, [id]);

  const loadWarehouse = async () => {
    try {
      setLoading(true);
      const [data, types] = await Promise.all([
        inventoryWarehouseService.getById(id),
        warehouseOptionService.getByCategory('warehouse_type'),
      ]);
      setWarehouse(data);
      const typeList = Array.isArray(types) ? types : types?.results || [];
      const match = typeList.find((t) => t.value === data.warehouse_type);
      setWarehouseTypeLabel(match ? match.label : data.warehouse_type);
    } catch (error) {
      console.error('Error loading warehouse:', error);
      toast.error('Failed to load warehouse');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      setDeleting(true);
      await inventoryWarehouseService.delete(id);
      toast.success('Warehouse deleted');
      navigate(webRoutes.inventoryWarehouses);
    } catch (error) {
      toast.error('Failed to delete warehouse');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Warehouse className="h-12 w-12 text-gray-400" />
        <p className="text-gray-600">Warehouse not found</p>
        <button onClick={() => navigate(webRoutes.inventoryWarehouses)} className="text-blue-600 hover:underline">
          Back to Warehouses
        </button>
      </div>
    );
  }

  const capacityUsed = warehouse.total_capacity > 0
    ? (((parseFloat(warehouse.total_capacity) - parseFloat(warehouse.available_capacity)) / parseFloat(warehouse.total_capacity)) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(webRoutes.inventoryWarehouses)}
            className="flex items-center p-2 rounded-lg bg-pale_yellow hover:bg-gold mb-4"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
            <span className="ml-1">Back to Warehouses</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{warehouse.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  warehouse.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {warehouse.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-600 mt-1 capitalize">{warehouseTypeLabel}</p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/inventory/warehouses/${id}/edit`}
                className="flex items-center px-4 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow text-sm"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-2" /> {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">Total Capacity</p>
            <p className="text-2xl font-bold text-gray-900">{parseFloat(warehouse.total_capacity).toLocaleString()} m³</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">Available Capacity</p>
            <p className="text-2xl font-bold text-green-600">{parseFloat(warehouse.available_capacity).toLocaleString()} m³</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">Capacity Used</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-gray-900">{capacityUsed}%</p>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-gold h-2 rounded-full" style={{ width: `${Math.min(capacityUsed, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-600" /> Location
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-gray-900">{warehouse.address}</p>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="text-gray-900">{warehouse.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="text-gray-900">{warehouse.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-blue-600" /> Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${warehouse.contact_email}`} className="text-blue-600 hover:underline">{warehouse.contact_email}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{warehouse.contact_phone}</span>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-purple-600" /> Facilities
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">Climate Controlled: {warehouse.climate_controlled ? 'Yes' : 'No'}</span>
              </div>
              {warehouse.security_features?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Security Features</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {warehouse.security_features.map((f, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {warehouse.certifications?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Certifications</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {warehouse.certifications.map((c, i) => (
                      <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-600" /> Timeline
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-gray-900">{new Date(warehouse.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-900">{new Date(warehouse.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDetail;
