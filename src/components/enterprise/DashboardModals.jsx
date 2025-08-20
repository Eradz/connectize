/**
 * ENTERPRISE DASHBOARD MODAL COMPONENTS
 * Fortune 500-Level Modal Interfaces
 * Supervised by: Research & Product Development Team
 */

import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Check, 
  AlertTriangle, 
  Target, 
  Calendar, 
  DollarSign,
  Users,
  Globe,
  Image,
  Settings
} from 'lucide-react';

// =============================================================================
// UPGRADE MODAL COMPONENT
// =============================================================================

const UpgradeModal = ({ plans, currentPlan, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    try {
      // Simulate API call for plan upgrade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would call the actual upgrade API
      // await upgradeSubscription(selectedPlan.id);
      
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Upgrade Your Plan</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanUpgradeCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={plan.id === currentPlan?.id}
                  isSelected={selectedPlan?.id === plan.id}
                  onSelect={() => setSelectedPlan(plan)}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={!selectedPlan || isProcessing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Upgrade Plan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PLAN UPGRADE CARD COMPONENT
// =============================================================================

const PlanUpgradeCard = ({ plan, isCurrentPlan, isSelected, onSelect }) => {
  const features = plan.features ? plan.features.split(',') : [
    'Basic Features',
    'Email Support',
    'Standard Analytics'
  ];

  return (
    <div
      className={`border rounded-lg p-6 cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' :
        isCurrentPlan ? 'border-green-500 bg-green-50' :
        'border-gray-200 hover:border-gray-300'
      }`}
      onClick={!isCurrentPlan ? onSelect : undefined}
    >
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
        <div className="mt-2">
          <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
          <span className="text-gray-500">/month</span>
        </div>

        {isCurrentPlan && (
          <div className="mt-3">
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full">
              <Check className="h-4 w-4 mr-1" />
              Current Plan
            </span>
          </div>
        )}

        {isSelected && !isCurrentPlan && (
          <div className="mt-3">
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
              <Check className="h-4 w-4 mr-1" />
              Selected
            </span>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {feature.trim()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// CREATE CAMPAIGN MODAL COMPONENT
// =============================================================================

const CreateCampaignModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    target_audience: '',
    start_date: '',
    end_date: '',
    campaign_type: 'featured'
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // Simulate API call for campaign creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would call the actual create campaign API
      // await createCampaign(formData);
      
      onClose();
    } catch (error) {
      console.error('Campaign creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Create New Campaign</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <form className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter campaign name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your campaign"
                />
              </div>

              {/* Budget and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Type
                  </label>
                  <select
                    name="campaign_type"
                    value={formData.campaign_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="featured">Featured Ad</option>
                    <option value="banner">Banner Ad</option>
                    <option value="sponsored">Sponsored Content</option>
                    <option value="video">Video Ad</option>
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Young professionals, Tech enthusiasts"
                />
              </div>
            </form>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.name || !formData.budget || isCreating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// USAGE BREAKDOWN COMPONENT
// =============================================================================

const UsageBreakdown = ({ analytics, currentSubscription }) => {
  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500">
        No usage analytics available
      </div>
    );
  }

  // Get actual limits from current subscription plan, fallback to analytics or defaults
  const planLimits = currentSubscription?.plan?.features || {};
  const technicalLimits = planLimits.technical_limits || {};
  
  // Use realistic usage values for demonstration
  const usageMetrics = [
    {
      label: 'API Calls',
      value: analytics.api_calls || 45000, // Sample: 22.5% of 200k limit
      limit: technicalLimits.api_calls_per_month || analytics.api_limit || 200000,
      color: 'blue'
    },
    {
      label: 'Storage Used',
      value: analytics.storage_used || 85, // Sample: 42.5% of 200GB limit  
      limit: technicalLimits.storage_gb || analytics.storage_limit || 200,
      color: 'green',
      unit: 'GB'
    },
    {
      label: 'Team Members',
      value: analytics.team_members_used || 12, // Sample: 24% of 50 member limit
      limit: technicalLimits.team_members || analytics.team_limit || 50,
      color: 'purple',
      unit: 'members'
    }
  ];

  return (
    <div className="space-y-6">
      {usageMetrics.map((metric, index) => (
        <UsageMetric key={index} metric={metric} />
      ))}
    </div>
  );
};

// =============================================================================
// USAGE METRIC COMPONENT
// =============================================================================

const UsageMetric = ({ metric }) => {
  const percentage = Math.min((metric.value / metric.limit) * 100, 100);
  const isNearLimit = percentage > 80;
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{metric.label}</span>
        <span className="text-sm text-gray-500">
          {metric.value.toLocaleString()}{metric.unit || ''} / {metric.limit.toLocaleString()}{metric.unit || ''}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isNearLimit ? 'bg-red-600' : colorClasses[metric.color]
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {isNearLimit && (
        <div className="flex items-center text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Approaching limit ({percentage.toFixed(1)}%)
        </div>
      )}
    </div>
  );
};

// =============================================================================
// AD METRIC CARD COMPONENT
// =============================================================================

const AdMetricCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

// =============================================================================
// ANALYTICS TABLE COMPONENT
// =============================================================================

const AnalyticsTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No detailed analytics data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Metric
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Change
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trend
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.metric}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.value}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={item.change > 0 ? 'text-green-600' : 'text-red-600'}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Export individual components as named exports
export {
  UpgradeModal,
  CreateCampaignModal,
  UsageBreakdown,
  AdMetricCard,
  AnalyticsTable
};
