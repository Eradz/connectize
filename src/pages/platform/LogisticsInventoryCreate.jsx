import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsInventoryService } from '../../api-services/oilgas';
import { toast } from 'sonner';

export default function LogisticsInventoryCreate() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', category: 'consumables', unit: 'units',
    status: 'in_stock', location: '', supplier: '',
    current_stock: 0, min_stock: 0, max_stock: 0, unit_cost: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleNumber = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: Number(value) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const created = await logisticsInventoryService.create(form);
      if (created?.id) {
        toast.success('Inventory item created');
        navigate(webRoutes.logisticsInventory);
      } else {
        toast.success('Saved');
        navigate(webRoutes.logisticsInventory);
      }
    } catch (err) {
      toast.error('Failed to create item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(webRoutes.logisticsInventory)} className="p-2 rounded-lg hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Add Inventory Item</h1>
            </div>
            <button disabled={saving} form="inventory-form" type="submit" className="bg-blue-600 hover:bg-custom_yellow text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50">
              <Save className="w-4 h-4 mr-2" /> Save
            </button>
          </div>
        </div>
      </div>

      <form id="inventory-form" onSubmit={onSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input name="sku" value={form.sku} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input name="category" value={form.category} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <input name="unit" value={form.unit} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2">
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="on_order">On Order</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier</label>
            <input name="supplier" value={form.supplier} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Stock</label>
            <input type="number" name="current_stock" value={form.current_stock} onChange={handleNumber} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Stock</label>
            <input type="number" name="min_stock" value={form.min_stock} onChange={handleNumber} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Stock</label>
            <input type="number" name="max_stock" value={form.max_stock} onChange={handleNumber} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit Cost</label>
            <input type="number" step="0.01" name="unit_cost" value={form.unit_cost} onChange={handleNumber} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
      </form>
    </div>
  );
}
