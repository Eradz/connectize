import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dealRoomService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';
import { toast as notify } from 'sonner';
import { useAuth } from '../../context/userContext';
import CurrencyPicker from '../CurrencyPicker';
import { getMyActionableCompanies } from '../../api-services/representatives';

export default function DealRoomEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deal, setDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deal_type: 'exploration_rights',
    status: 'draft',
    estimated_value: '',
    currency: 'USD',
    target_close_date: '',
    location: '',
    is_confidential: false,
    requires_nda: false,
    tags: [],
    company: ''
  });

  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  // Fetch the current user's companies from the API
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchCompanies = async () => {
      try {
        setCompaniesLoading(true);
        const result = await getMyActionableCompanies();
        if (!cancelled && Array.isArray(result)) {
          setCompanies(result);
        }
      } catch (err) {
        console.error('Failed to fetch user companies:', err);
      } finally {
        if (!cancelled) setCompaniesLoading(false);
      }
    };
    fetchCompanies();
    return () => { cancelled = true; };
  }, [user]);

  const dealStatuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'due_diligence', label: 'Due Diligence' },
    { value: 'closing', label: 'Closing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const dealTypes = [
    { value: 'acquisition', label: 'Acquisition',},
    { value: 'joint_venture', label: 'Joint Venture',},
    { value: 'service_contract', label: 'Service Contract',},
    { value: 'equipment_lease', label: 'Equipment Lease',},
    { value: 'exploration_rights', label: 'Exploration Rights',},
    { value: 'drilling_contract', label: 'Drilling Contract',},
    { value: 'supply_agreement', label: 'Supply Agreement',},
    { value: 'other', label: 'Other',},
  ];

  useEffect(() => {
    loadDeal();
  }, [id]);

  const loadDeal = async () => {
    try {
      setLoading(true);
      const response = await dealRoomService.getById(id);
      
      const dealData = response?.data || response;
      
      if (!dealData) {
        notify.error('Deal not found');
        navigate(webRoutes.dealRooms);
        return;
      }

      setDeal(dealData);
      setFormData({
        title: dealData.title || '',
        description: dealData.description || '',
        deal_type: dealData.deal_type || 'exploration_rights',
        status: dealData.status || 'draft',
        estimated_value: dealData.estimated_value ? parseFloat(dealData.estimated_value).toString() : '',
        currency: dealData.currency || 'USD',
        target_close_date: dealData.target_close_date ? dealData.target_close_date.split('T')[0] : '',
        location: dealData.location || '',
        is_confidential: dealData.is_confidential || false,
        requires_nda: dealData.requires_nda || false,
        tags: dealData.tags || [],
        company: dealData.company || dealData.company_id || ''
      });
    } catch (error) {
      console.error('Error loading deal:', error);
      notify.error('Failed to load deal details');
      navigate(webRoutes.dealRooms);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      notify.error('Deal title is required');
      return;
    }

    // Validate estimated_value if provided
    if (formData.estimated_value && isNaN(parseFloat(formData.estimated_value))) {
      notify.error('Please enter a valid estimated value');
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        ...formData,
        estimated_value: formData.estimated_value && formData.estimated_value.trim() !== '' 
          ? parseFloat(formData.estimated_value) 
          : null,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        company: formData.company || null
      };


      const result = await dealRoomService.update(id, updateData);
      notify.success('Deal updated successfully');
      navigate(webRoutes.dealRoomDetail.replace(':id', id));
    } catch (error) {
      console.error('Error updating deal:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      let errorMessage = 'Unknown error';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.errors) {
          errorMessage = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      notify.error('Failed to update deal: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Special handling for estimated_value to ensure it's a valid number
    if (field === 'estimated_value') {
      // Allow empty string or valid numbers
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deal details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Deal Room</h1>
              <p className="text-gray-600 mt-1">Update deal room information and settings</p>
            </div>
            <div className="flex space-x-2">
              <Link 
                to={webRoutes.dealRoomDetail.replace(':id', id)} 
                className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-gold text-dark text-sm hover:bg-custom_yellow disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                {companiesLoading ? (
                  <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    Loading companies...
                  </div>
                ) : companies.length === 0 ? (
                  <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    You don’t have a company yet. Create one before assigning this deal room.
                  </div>
                ) : (
                  <select
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500/30 focus:border-transparent bg-white"
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name || company.company_name || company.title || `Company #${company.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                  placeholder="Enter deal title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                  placeholder="Describe the deal, its objectives, and key details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deal Type
                </label>
                <select
                  value={formData.deal_type}
                  onChange={(e) => handleInputChange('deal_type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                >
                  {dealTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deal Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                >
                  {dealStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Set to "Active" to make the deal visible to participants
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                  placeholder="Location or region"
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Value
                  </label>
                  <input
                    type="text"
                    value={formData.estimated_value}
                    onChange={(e) => handleInputChange('estimated_value', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                    placeholder="0"
                    inputMode="decimal"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the estimated value without currency symbols or commas
                  </p>
                </div>

                <CurrencyPicker
                  value={formData.currency}
                  onChange={(code) => handleInputChange('currency', code)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Close Date
                  </label>
                  <input
                    type="date"
                    value={formData.target_close_date}
                    onChange={(e) => handleInputChange('target_close_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security & Access</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_confidential"
                    checked={formData.is_confidential}
                    onChange={(e) => handleInputChange('is_confidential', e.target.checked)}
                    className="h-4 w-4 text-gold focus:ring-primary-500/30 border-gray-300 rounded"
                  />
                  <label htmlFor="is_confidential" className="ml-2 block text-sm text-gray-900">
                    Mark as confidential deal
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requires_nda"
                    checked={formData.requires_nda}
                    onChange={(e) => handleInputChange('requires_nda', e.target.checked)}
                    className="h-4 w-4 text-gold focus:ring-primary-500/30 border-gray-300 rounded"
                  />
                  <label htmlFor="requires_nda" className="ml-2 block text-sm text-gray-900">
                    Require NDA for participants
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6 flex justify-end space-x-3">
              <Link 
                to={webRoutes.dealRoomDetail.replace(':id', id)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={(companies.length === 0)  || saving}
                className="px-6 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
