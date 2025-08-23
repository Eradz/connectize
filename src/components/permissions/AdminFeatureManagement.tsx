import React, { useState, useEffect } from 'react';

interface Feature {
  feature_code: string;
  feature_name: string;
  description: string;
  feature_category: string;
  access_level: string;
  minimum_plan: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FeatureFormData {
  feature_code: string;
  feature_name: string;
  description: string;
  feature_category: string;
  access_level: string;
  minimum_plan: string;
  is_active: boolean;
}

const FEATURE_CATEGORIES = [
  'analytics',
  'automation',
  'customization',
  'data_management',
  'integration',
  'reporting',
  'security',
  'user_management',
];

const ACCESS_LEVELS = [
  'basic',
  'standard',
  'premium',
  'enterprise',
];

const PLAN_TYPES = [
  'free',
  'basic',
  'standard',
  'premium',
  'enterprise',
];

// Feature Management Component
export const AdminFeatureManagement: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [filteredFeatures, setFilteredFeatures] = useState<Feature[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatures();
  }, []);

  useEffect(() => {
    filterFeatures();
  }, [features, selectedCategory, searchTerm]);

  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/permissions/admin/features/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeatures(data.results || data);
        setError(null);
      } else {
        setError('Failed to fetch features');
      }
    } catch (err) {
      console.error('Failed to fetch features:', err);
      setError('Failed to fetch features');
    } finally {
      setIsLoading(false);
    }
  };

  const filterFeatures = () => {
    let filtered = features;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(feature => feature.feature_category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(feature =>
        feature.feature_name.toLowerCase().includes(term) ||
        feature.feature_code.toLowerCase().includes(term) ||
        feature.description.toLowerCase().includes(term)
      );
    }

    setFilteredFeatures(filtered);
  };

  const handleCreateFeature = async (formData: FeatureFormData) => {
    try {
      const response = await fetch('/api/permissions/admin/features/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchFeatures();
        setShowCreateModal(false);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create feature');
      }
    } catch (err) {
      console.error('Failed to create feature:', err);
      setError(err instanceof Error ? err.message : 'Failed to create feature');
      return false;
    }
  };

  const handleUpdateFeature = async (featureCode: string, formData: Partial<FeatureFormData>) => {
    try {
      const response = await fetch(`/api/permissions/admin/features/${featureCode}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchFeatures();
        setShowEditModal(false);
        setSelectedFeature(null);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update feature');
      }
    } catch (err) {
      console.error('Failed to update feature:', err);
      setError(err instanceof Error ? err.message : 'Failed to update feature');
      return false;
    }
  };

  const handleDeleteFeature = async (featureCode: string) => {
    if (!confirm('Are you sure you want to delete this feature? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/permissions/admin/features/${featureCode}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        fetchFeatures();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete feature');
      }
    } catch (err) {
      console.error('Failed to delete feature:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete feature');
    }
  };

  const handleToggleFeature = async (feature: Feature) => {
    await handleUpdateFeature(feature.feature_code, {
      is_active: !feature.is_active,
    });
  };

  return (
    <div className="admin-feature-management">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Feature Management</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Feature
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {FEATURE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
            <div className="text-red-800">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Features List */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredFeatures.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No features found
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFeatures.map((feature) => (
                <FeatureCard
                  key={feature.feature_code}
                  feature={feature}
                  onEdit={(feature) => {
                    setSelectedFeature(feature);
                    setShowEditModal(true);
                  }}
                  onDelete={handleDeleteFeature}
                  onToggle={handleToggleFeature}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Feature Modal */}
      {showCreateModal && (
        <FeatureFormModal
          title="Create New Feature"
          initialData={{
            feature_code: '',
            feature_name: '',
            description: '',
            feature_category: FEATURE_CATEGORIES[0],
            access_level: ACCESS_LEVELS[0],
            minimum_plan: PLAN_TYPES[0],
            is_active: true,
          }}
          onSubmit={handleCreateFeature}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Feature Modal */}
      {showEditModal && selectedFeature && (
        <FeatureFormModal
          title="Edit Feature"
          initialData={selectedFeature}
          onSubmit={(data) => handleUpdateFeature(selectedFeature.feature_code, data)}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedFeature(null);
          }}
          isEdit
        />
      )}
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  feature: Feature;
  onEdit: (feature: Feature) => void;
  onDelete: (featureCode: string) => void;
  onToggle: (feature: Feature) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onEdit, onDelete, onToggle }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-medium text-gray-900">{feature.feature_name}</h3>
            <span className={`px-2 py-1 text-xs rounded ${
              feature.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {feature.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <p className="text-gray-600 mb-3">{feature.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Code:</span>
              <span className="ml-2 font-mono text-gray-900">{feature.feature_code}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Category:</span>
              <span className="ml-2 text-gray-900 capitalize">
                {feature.feature_category.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Access Level:</span>
              <span className="ml-2 text-gray-900 capitalize">{feature.access_level}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Minimum Plan:</span>
              <span className="ml-2 text-gray-900 capitalize">{feature.minimum_plan}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onToggle(feature)}
            className={`px-3 py-1 text-sm rounded ${
              feature.is_active
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-green-200 text-green-700 hover:bg-green-300'
            }`}
          >
            {feature.is_active ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => onEdit(feature)}
            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(feature.feature_code)}
            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Feature Form Modal
interface FeatureFormModalProps {
  title: string;
  initialData: FeatureFormData;
  onSubmit: (data: FeatureFormData) => Promise<boolean>;
  onCancel: () => void;
  isEdit?: boolean;
}

const FeatureFormModal: React.FC<FeatureFormModalProps> = ({
  title,
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<FeatureFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.feature_code.trim()) {
      newErrors.feature_code = 'Feature code is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.feature_code)) {
      newErrors.feature_code = 'Feature code must contain only lowercase letters, numbers, and underscores';
    }

    if (!formData.feature_name.trim()) {
      newErrors.feature_name = 'Feature name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    const success = await onSubmit(formData);
    setIsSubmitting(false);

    if (success) {
      onCancel();
    }
  };

  const handleInputChange = (field: keyof FeatureFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-6">{title}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feature Code *
              </label>
              <input
                type="text"
                value={formData.feature_code}
                onChange={(e) => handleInputChange('feature_code', e.target.value)}
                disabled={isEdit}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.feature_code ? 'border-red-300' : 'border-gray-300'
                } ${isEdit ? 'bg-gray-100' : ''}`}
                placeholder="e.g., advanced_analytics"
              />
              {errors.feature_code && (
                <p className="text-red-600 text-sm mt-1">{errors.feature_code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feature Name *
              </label>
              <input
                type="text"
                value={formData.feature_name}
                onChange={(e) => handleInputChange('feature_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.feature_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Advanced Analytics"
              />
              {errors.feature_name && (
                <p className="text-red-600 text-sm mt-1">{errors.feature_name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Describe what this feature does..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.feature_category}
                onChange={(e) => handleInputChange('feature_category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FEATURE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Level
              </label>
              <select
                value={formData.access_level}
                onChange={(e) => handleInputChange('access_level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ACCESS_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Plan
              </label>
              <select
                value={formData.minimum_plan}
                onChange={(e) => handleInputChange('minimum_plan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PLAN_TYPES.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Feature is active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Feature'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminFeatureManagement;
