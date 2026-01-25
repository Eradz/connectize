import React, { useState } from 'react';
import { toast } from 'sonner';
import { logisticsAPI } from '../../api-services/logistics';

const toISODateTime = (dateStr, endOfDay = false) => {
  if (!dateStr) return null;
  return `${dateStr}T${endOfDay ? '23:59:59' : '00:00:00'}Z`;
};

const ProviderQuoteForm = ({ requestId, onSuccess, onCancel }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    total_cost: '',
    currency: 'USD',
    estimated_pickup_date: '',
    estimated_delivery_date: '',
    service_description: '',
    payment_terms: '',
    insurance_included: false,
    insurance_value: '',
    valid_until: '',
    cost_breakdown: '' // JSON string optional
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      setSubmitting(true);
      if (!form.total_cost || !form.estimated_pickup_date || !form.estimated_delivery_date || !form.service_description || !form.payment_terms || !form.valid_until) {
        toast.error('Please fill all required fields');
        setSubmitting(false);
        return;
      }

      let parsedBreakdown = {};
      if (form.cost_breakdown) {
        try {
          parsedBreakdown = JSON.parse(form.cost_breakdown);
        } catch (err) {
          toast.error('Cost breakdown must be valid JSON');
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        request: requestId,
        total_cost: Number(form.total_cost),
        currency: form.currency || 'USD',
        estimated_pickup_date: toISODateTime(form.estimated_pickup_date),
        estimated_delivery_date: toISODateTime(form.estimated_delivery_date),
        service_description: form.service_description,
        payment_terms: form.payment_terms,
        insurance_included: !!form.insurance_included,
        insurance_value: form.insurance_included && form.insurance_value !== '' ? Number(form.insurance_value) : null,
        valid_until: toISODateTime(form.valid_until, true),
        cost_breakdown: parsedBreakdown,
        is_active: true,
      };

      const resp = await logisticsAPI.createQuote(payload);
      
      // Check if request failed (returns null on error)
      if (!resp || resp.data === null) {
        // Error toast is already shown by makeApiRequest
        return;
      }
      
      // Success
      toast.success('Quote submitted successfully!');
      onSuccess?.(resp.data || resp);
    } catch (err) {
      const msg = err?.response?.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : err.message;
      toast.error('Failed to submit quote', { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost *</label>
          <input type="number" step="0.01" value={form.total_cost} onChange={(e) => handleChange('total_cost', e.target.value)} className="w-full border px-3 py-2 rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} className="w-full border px-3 py-2 rounded-lg">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="NGN">NGN</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Est. Pickup *</label>
          <input type="date" value={form.estimated_pickup_date} onChange={(e) => handleChange('estimated_pickup_date', e.target.value)} className="w-full border px-3 py-2 rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Est. Delivery *</label>
          <input type="date" value={form.estimated_delivery_date} onChange={(e) => handleChange('estimated_delivery_date', e.target.value)} className="w-full border px-3 py-2 rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until *</label>
          <input type="date" value={form.valid_until} onChange={(e) => handleChange('valid_until', e.target.value)} className="w-full border px-3 py-2 rounded-lg" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Description *</label>
        <textarea value={form.service_description} onChange={(e) => handleChange('service_description', e.target.value)} className="w-full border px-3 py-2 rounded-lg" rows={3} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms *</label>
          <input type="text" value={form.payment_terms} onChange={(e) => handleChange('payment_terms', e.target.value)} className="w-full border px-3 py-2 rounded-lg" placeholder="e.g., Net 30" required />
        </div>
        <div className="flex items-center mt-6">
          <input id="insurance_included" type="checkbox" checked={form.insurance_included} onChange={(e) => handleChange('insurance_included', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
          <label htmlFor="insurance_included" className="ml-2 text-sm text-gray-700">Include insurance</label>
        </div>
      </div>

      {form.insurance_included && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Value</label>
          <input type="number" step="0.01" value={form.insurance_value} onChange={(e) => handleChange('insurance_value', e.target.value)} className="w-full border px-3 py-2 rounded-lg" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cost Breakdown (JSON)</label>
        <textarea value={form.cost_breakdown} onChange={(e) => handleChange('cost_breakdown', e.target.value)} className="w-full border px-3 py-2 rounded-lg" rows={3} placeholder='{"base": 1000, "fuel": 100}' />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-custom_yellow disabled:opacity-50">
          {submitting ? 'Submitting…' : 'Submit Quote'}
        </button>
      </div>
    </form>
  );
};

export default ProviderQuoteForm;
