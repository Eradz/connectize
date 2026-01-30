import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const InventoryModal = ({ isOpen, onClose, itemId = null, onSave, currentData = null }) => {
  const isEdit = Boolean(itemId);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit: 'PCS',
    status: 'in_stock',
    location: '',
    supplier: '',
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    unit_cost: 0
  });

  // Populate form with current data when editing
  useEffect(() => {
    if (isEdit && currentData && isOpen) {
      setFormData({
        name: currentData.name || '',
        sku: currentData.sku || '',
        category: currentData.category || '',
        unit: currentData.unit || 'PCS',
        status: currentData.status || 'in_stock',
        location: currentData.location || '',
        supplier: currentData.supplier || '',
        current_stock: currentData.current_stock || 0,
        minimum_stock: currentData.minimum_stock || 0,
        maximum_stock: currentData.maximum_stock || 0,
        unit_cost: currentData.unit_cost || 0
      });
    }
  }, [isEdit, currentData, isOpen]);

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'in_use', label: 'In Use' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'obsolete', label: 'Obsolete' },
    { value: 'disposed', label: 'Disposed' }
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

  const categoryOptions = [
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

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (onSave) {
      onSave(formData, isEdit);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </h2>
          <button
  onClick={onClose}
  className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm px-3 py-1.5 rounded-md transition-colors"
  style={{ backgroundColor: '#F8F9FA' }}
>
  <X className="w-4 h-4" />
  <span>Close</span>
</button>
        </div>

        {/* Form */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g drilling  bits - PDC 8.5 inch"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="DRL-001-USER1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {unitOptions.map(unit => (
                    <option key={unit.id} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Bay A-3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  placeholder="e.g baker's Hughes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Current Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock
                </label>
                <input
                  type="number"
                  name="current_stock"
                  value={formData.current_stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Min Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Stock
                </label>
                <input
                  type="number"
                  name="minimum_stock"
                  value={formData.minimum_stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Max Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Stock
                </label>
                <input
                  type="number"
                  name="maximum_stock"
                  value={formData.maximum_stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Unit Cost */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit cost
                </label>
                <input
                  type="number"
                  name="unit_cost"
                  value={formData.unit_cost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="15000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 mt-8">
                            <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: '#FFE7A4', color: '#000', border: 'none' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryModal;