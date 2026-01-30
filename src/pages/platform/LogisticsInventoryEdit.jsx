import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Loader2, Package, Wrench, Building, Settings,
  TrendingUp, AlertTriangle, Truck, MapPin, DollarSign, Hash,
  FileText, Calendar, User, Plus, Trash2
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsInventoryService } from '../../api-services/oilgas';
import { toast } from 'sonner';

export default function LogisticsInventoryEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    current_stock: 0,
    reorder_point: 0,
    maximum_stock: 0,
    minimum_stock: 0,
    unit: 'pcs',
    unit_cost: 0,
    status: 'available',
    condition: 'new',
    warehouse: '',
    location: '',
    supplier: '',
    manufacturer: '',
    model_number: '',
    serial_number: '',
    purchase_date: '',
    warranty_expiry: '',
    specifications: {},
    notes: ''
  });

  // Oil & gas industry categories
  const industryCategories = [
  { id: 1, value: "drilling_equipment", label: "Drilling Equipment" },
  { id: 2, value: "pipe_tubing", label: "Pipes & Tubing" },
  { id: 3, value: "wellhead_equipment", label: "Wellhead Equipment" },
  { id: 4, value: "production_equipment", label: "Production Equipment" },
  { id: 5, value: "safety_equipment", label: "Safety Equipment" },
  { id: 6, value: "maintenance_tools", label: "Maintenance Tools" },
  { id: 7, value: "chemicals", label: "Chemicals & Fluids" },
  { id: 8, value: "valves_fittings", label: "Valves & Fittings" },
  { id: 9, value: "electrical_equipment", label: "Electrical Equipment" },
  { id: 10, value: "instrumentation", label: "Instrumentation" },
  { id: 11, value: "ppe", label: "Personal Protective Equipment" },
  { id: 12, value: "consumables", label: "Consumables" },
  { id: 13, value: "spare_parts", label: "Spare Parts" },
  { id: 14, value: "other", label: "Other" }
]

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'in_use', label: 'In Use' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'obsolete', label: 'Obsolete' },
    { value: 'disposed', label: 'Disposed' }
  ];

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'damaged', label: 'Damaged' }
  ];

  const unitOptions = [
  { id: 1, value: "pcs", label: "Pieces" },
  { id: 2, value: "ft", label: "Feet" },
  { id: 3, value: "m", label: "Meters" },
  { id: 4, value: "kg", label: "Kilograms" },
  { id: 5, value: "lb", label: "Pounds" },
  { id: 6, value: "gal", label: "Gallons" },
  { id: 7, value: "l", label: "Liters" },
  { id: 8, value: "bbl", label: "Barrels" },
  { id: 9, value: "tons", label: "Tons" },
  { id: 10, value: "set", label: "Sets" },
  { id: 11, value: "roll", label: "Rolls" },
  { id: 12, value: "box", label: "Boxes" }
]

  useEffect(() => {
    loadInventoryItem();
  }, [id]);

  const loadInventoryItem = async () => {
    try {
      setLoading(true);
      const data = await logisticsInventoryService.getById(id);
      
      setForm({
        ...data,
        purchase_date: data.purchase_date ? data.purchase_date.split('T')[0] : '',
        warranty_expiry: data.warranty_expiry ? data.warranty_expiry.split('T')[0] : ''
      });

      // Load specifications
      if (data.specifications && typeof data.specifications === 'object') {
        const specs = Object.entries(data.specifications).map(([key, value]) => ({ key, value }));
        setSpecifications(specs.length > 0 ? specs : [{ key: '', value: '' }]);
      }
    } catch (error) {
      toast.error('Failed to load inventory item');
      console.error('Error loading item:', error);
      navigate(webRoutes.logisticsInventory);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const addSpecification = () => {
    setSpecifications(prev => [...prev, { key: '', value: '' }]);
  };

  const removeSpecification = (index) => {
    if (specifications.length > 1) {
      setSpecifications(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.sku || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      // Convert specifications array to object
      const specs = specifications.reduce((acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value;
        }
        return acc;
      }, {});

      const payload = {
        ...form,
        specifications: specs
      };

      await logisticsInventoryService.update(id, payload);
      toast.success('Inventory item updated successfully');
      navigate(webRoutes.logisticsInventoryDetail.replace(':id', id));
    } catch (error) {
      toast.error('Failed to update item');
      console.error('Error saving item:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto ">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(webRoutes.logisticsInventoryDetail.replace(':id', id))}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Inventory Item</h1>
                <p className="text-gray-600 mt-1">Update item details and specifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gold" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Drilling Bit - PDC 8.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., DRL-001"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Detailed description of the item..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {industryCategories.map(cat => (
                    <option key={cat.id} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit of Measurement
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                >
                  {unitOptions.map(unit => (
                    <option key={unit.id} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Stock Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock
                </label>
                <input
                  type="number"
                  name="current_stock"
                  value={form.current_stock}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  name="minimum_stock"
                  value={form.minimum_stock}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reorder Point
                </label>
                <input
                  type="number"
                  name="reorder_point"
                  value={form.reorder_point}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Stock
                </label>
                <input
                  type="number"
                  name="maximum_stock"
                  value={form.maximum_stock}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Status and Condition */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Status & Condition
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                >
                  {conditionOptions.map(condition => (
                    <option key={condition.value} value={condition.value}>{condition.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location and Supplier */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-600" />
              Location & Supplier
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="warehouse"
                    value={form.warehouse}
                    onChange={handleInputChange}
                    placeholder="e.g., Houston Main"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location/Bay
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Bay 3-A"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="supplier"
                    value={form.supplier}
                    onChange={handleInputChange}
                    placeholder="e.g., Baker Hughes"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="manufacturer"
                    value={form.manufacturer}
                    onChange={handleInputChange}
                    placeholder="e.g., Baker Hughes"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Financial Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Cost ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="unit_cost"
                    value={form.unit_cost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Value (Read-only)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={`${((form.current_stock || 0) * (form.unit_cost || 0)).toFixed(2)}`}
                    disabled
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-gold" />
              Technical Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Number
                </label>
                <input
                  type="text"
                  name="model_number"
                  value={form.model_number}
                  onChange={handleInputChange}
                  placeholder="e.g., PDC-85"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serial_number"
                  value={form.serial_number}
                  onChange={handleInputChange}
                  placeholder="e.g., SN123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="purchase_date"
                    value={form.purchase_date}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Expiry
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="warranty_expiry"
                    value={form.warranty_expiry}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-indigo-600" />
                Specifications
              </h3>
              <button
                type="button"
                onClick={addSpecification}
                className="flex items-center px-3 py-2 text-sm border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Spec
              </button>
            </div>
            
            <div className="space-y-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                      placeholder="Property name (e.g., Diameter)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      placeholder="Value (e.g., 8.5 inches)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                    />
                  </div>
                  {specifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-600" />
              Additional Notes
            </h3>
            
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Any additional notes or comments about this item..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(webRoutes.logisticsInventoryDetail.replace(':id', id))}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gold hover:bg-pale_yellow text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
