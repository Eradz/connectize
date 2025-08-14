import React, { useState } from 'react';
import { useAuth } from '../../context/userContext';
import { useFeatureFlags } from '../../context/featureFlagContext';
import Button from '../ui/Button';
import { 
  CrownIcon, 
  BrainIcon, 
  TrendingUpIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  GlobeAltIcon,
  ChartBarIcon,
  DocumentTextIcon,
  HandshakeIcon,
  LightbulbIcon,
  SecurityIcon
} from '../ui/ModernIcon';

const FeatureOverview = () => {
  const { user } = useAuth();
  const { flags, isEnabled } = useFeatureFlags();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const featureCategories = [
    {
      id: 'monetization',
      name: 'Monetization & Content',
      icon: CrownIcon,
      color: 'yellow',
      description: 'Revenue generation and content management'
    },
    {
      id: 'dealflow',
      name: 'Deal Flow & Execution',
      icon: HandshakeIcon,
      color: 'green',
      description: 'Cross-border business execution'
    },
    {
      id: 'ai',
      name: 'AI Intelligence',
      icon: BrainIcon,
      color: 'purple',
      description: 'AI-powered business insights'
    },
    {
      id: 'trust',
      name: 'Trust & Verification',
      icon: ShieldCheckIcon,
      color: 'blue',
      description: 'Reputation and verification systems'
    },
    {
      id: 'community',
      name: 'Workforce & Community',
      icon: UserGroupIcon,
      color: 'indigo',
      description: 'Professional networking and collaboration'
    },
    {
      id: 'tools',
      name: 'O&G Specialized Tools',
      icon: CogIcon,
      color: 'orange',
      description: 'Industry-specific tooling'
    }
  ];

  const allFeatures = [
    // A. Core monetization & content
    {
      id: 'subscriptions',
      name: 'Subscription Plans',
      category: 'monetization',
      description: 'Tiered subscription plans with feature access control',
      status: isEnabled('subscriptions') ? 'enabled' : 'disabled',
      plan_required: 'trial',
      component: '/subscriptions'
    },
    {
      id: 'featured_ads',
      name: 'Featured Ads',
      category: 'monetization',
      description: 'Promote posts, products, and services with targeted advertising',
      status: isEnabled('featured_ads') ? 'enabled' : 'disabled',
      plan_required: 'standard',
      component: '/featured-ads'
    },
    {
      id: 'knowledge_hub',
      name: 'Knowledge Hub',
      category: 'monetization',
      description: 'News, insights, forums with moderation and content management',
      status: isEnabled('knowledge_hub') ? 'enabled' : 'disabled',
      plan_required: 'trial',
      component: '/knowledge-hub'
    },
    {
      id: 'data_licensing',
      name: 'Data Licensing',
      category: 'monetization',
      description: 'Monetize aggregated industry data and analytics',
      status: isEnabled('data_licensing') ? 'enabled' : 'disabled',
      plan_required: 'premium',
      component: '/data-licensing'
    },

    // B. Deal flow & cross-border execution
    {
      id: 'virtual_deal_rooms',
      name: 'Virtual Deal Rooms',
      category: 'dealflow',
      description: 'Secure collaboration spaces with file vault and e-signatures',
      status: isEnabled('virtual_deal_rooms') ? 'enabled' : 'disabled',
      plan_required: 'standard',
      component: '/deal-rooms'
    },
    {
      id: 'e_invoicing',
      name: 'E-Invoicing & Fintech',
      category: 'dealflow',
      description: 'Multi-currency invoicing with trade finance integration',
      status: isEnabled('e_invoicing') ? 'enabled' : 'disabled',
      plan_required: 'standard',
      component: '/invoicing'
    },
    {
      id: 'logistics_hub',
      name: 'Logistics & Cross-Border',
      category: 'dealflow',
      description: 'Logistics integration, customs docs, and compliance content',
      status: isEnabled('logistics_hub') ? 'enabled' : 'disabled',
      plan_required: 'trial',
      component: '/logistics'
    },

    // C. AI-powered intelligence
    {
      id: 'ai_matchmaking',
      name: 'Smart B2B Matchmaking',
      category: 'ai',
      description: 'AI-powered business partner matching with compatibility scoring',
      status: isEnabled('ai_matchmaking') ? 'enabled' : 'disabled',
      plan_required: 'premium',
      component: '/ai/matchmaking'
    },
    {
      id: 'opportunity_radar',
      name: 'Opportunity Radar',
      category: 'ai',
      description: 'Automated tender and RFQ discovery with intelligent matching',
      status: isEnabled('opportunity_radar') ? 'enabled' : 'disabled',
      plan_required: 'standard',
      component: '/ai/opportunities'
    },
    {
      id: 'ai_compliance',
      name: 'AI Compliance Assistant',
      category: 'ai',
      description: 'Automated compliance checking and certification management',
      status: isEnabled('ai_compliance') ? 'enabled' : 'disabled',
      plan_required: 'standard',
      component: '/ai/compliance'
    },
    {
      id: 'predictive_analytics',
      name: 'Predictive Analytics',
      category: 'ai',
      description: 'Market trends and business intelligence forecasting',
      status: isEnabled('predictive_analytics') ? 'enabled' : 'disabled',
      plan_required: 'premium',
      component: '/ai/analytics'
    },

    // D. Trust & verification
    {
      id: 'reputation_system',
      name: 'Reputation System',
      category: 'trust',
      description: 'Partner reliability scoring based on performance metrics',
      status: isEnabled('reputation_system') ? 'enabled' : 'disabled',
      plan_required: 'trial',
      component: '/reputation'
    },
    {
      id: 'verification_system',
      name: 'Verification System',
      category: 'trust',
      description: 'Document verification and credential management',
      status: isEnabled('verification_system') ? 'enabled' : 'disabled',
      plan_required: 'trial',
      component: '/verification'
    },

    // E. Workforce & community
    {
      id: 'workforce_marketplace',
      name: 'Borderless Workforce',
      category: 'community',
      description: 'Global talent marketplace for oil & gas professionals',
      status: isEnabled('workforce_marketplace') ? 'enabled' : 'disabled',
      plan_required: 'trial',
      component: '/workforce'
    },
    {
      id: 'events_platform',
      name: 'Events Platform',
      category: 'community',
      description: 'Virtual events, webinars, and industry conferences',
      status: isEnabled('events_platform') ? 'enabled' : 'disabled',
      plan_required: 'standard',
      component: '/events'
    },
    {
      id: 'industry_councils',
      name: 'Industry Councils',
      category: 'community',
      description: 'Specialized working groups and regional chapters',
      status: isEnabled('industry_councils') ? 'enabled' : 'disabled',
      plan_required: 'standard',
      component: '/councils'
    },

    // F. Specialized oil & gas tooling
    {
      id: 'equipment_sharing',
      name: 'Equipment & Asset Sharing',
      category: 'tools',
      description: 'Equipment rental marketplace with maintenance tracking',
      status: isEnabled('equipment_sharing') ? 'enabled' : 'disabled',
      plan_required: 'standard',
      component: '/equipment'
    },
    {
      id: 'hse_collaboration',
      name: 'HSE Collaboration Hub',
      category: 'tools',
      description: 'Safety incident reporting and compliance workflows',
      status: isEnabled('hse_collaboration') ? 'enabled' : 'disabled',
      plan_required: 'standard',
      component: '/hse'
    },
    {
      id: 'supply_chain_visibility',
      name: 'Supply Chain Visibility',
      category: 'tools',
      description: 'End-to-end supply chain tracking and vendor management',
      status: isEnabled('supply_chain_visibility') ? 'enabled' : 'disabled',
      plan_required: 'premium',
      component: '/supply-chain'
    }
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? allFeatures 
    : allFeatures.filter(f => f.category === selectedCategory);

  const enabledCount = allFeatures.filter(f => f.status === 'enabled').length;
  const totalCount = allFeatures.length;

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case 'trial': return 'bg-gray-100 text-gray-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (categoryId) => {
    const category = featureCategories.find(c => c.id === categoryId);
    return category?.color || 'gray';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Platform Features Overview
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Comprehensive oil & gas industry platform with AI-powered insights, 
          deal flow management, and specialized tooling
        </p>
        
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Enabled: {enabledCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span>Total: {totalCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CrownIcon className="h-4 w-4 text-yellow-500" />
            <span>Plan: {user?.subscription?.plan_type || 'Trial'}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Feature Activation</span>
          <span className="text-sm text-gray-500">
            {enabledCount} of {totalCount} features enabled
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(enabledCount / totalCount) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Features ({allFeatures.length})
          </button>
          
          {featureCategories.map((category) => {
            const count = allFeatures.filter(f => f.category === category.id).length;
            const IconComponent = category.icon;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-600 text-white`
                    : `bg-${category.color}-100 text-${category.color}-700 hover:bg-${category.color}-200`
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{category.name} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredFeatures.map((feature) => {
          const isEnabled = feature.status === 'enabled';
          const categoryColor = getCategoryColor(feature.category);
          
          return (
            <div
              key={feature.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 ${
                isEnabled 
                  ? `border-${categoryColor}-200 hover:border-${categoryColor}-300` 
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isEnabled 
                        ? `bg-${categoryColor}-100`
                        : 'bg-gray-100'
                    }`}>
                      <div className={`w-6 h-6 rounded-full ${
                        isEnabled 
                          ? `bg-${categoryColor}-500`
                          : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {feature.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        getPlanBadgeColor(feature.plan_required)
                      }`}>
                        {feature.plan_required}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`w-3 h-3 rounded-full ${
                    isEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {feature.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    isEnabled ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isEnabled ? 'Available' : 'Requires Upgrade'}
                  </span>
                  
                  {isEnabled ? (
                    <Button 
                      size="sm" 
                      variant="minimal"
                      onClick={() => window.location.href = feature.component}
                    >
                      Open
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="minimal"
                      onClick={() => window.location.href = '/subscriptions'}
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Categories Overview */}
      <div className="bg-gray-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Feature Categories
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCategories.map((category) => {
            const IconComponent = category.icon;
            const categoryFeatures = allFeatures.filter(f => f.category === category.id);
            const enabledInCategory = categoryFeatures.filter(f => f.status === 'enabled').length;
            
            return (
              <div key={category.id} className="bg-white rounded-lg p-6 text-center">
                <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className={`h-6 w-6 text-${category.color}-600`} />
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2">
                  {category.name}
                </h4>
                
                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <span className="text-green-600 font-medium">
                    {enabledInCategory} enabled
                  </span>
                  <span className="text-gray-500">
                    of {categoryFeatures.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-12">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to unlock all features?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Upgrade to Premium and get access to all AI-powered features, 
            advanced analytics, and unlimited usage across the platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary"
              onClick={() => window.location.href = '/subscriptions'}
            >
              View Plans & Pricing
            </Button>
            <Button 
              variant="minimal"
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureOverview;
