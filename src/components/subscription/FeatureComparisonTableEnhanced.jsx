/**
 * FEATURE COMPARISON TABLE COMPONENT
 * Enhanced feature comparison with visual hierarchy and conversion optimization
 * Part of the Enhanced Subscription Dashboard Implementation Plan
 */

import React, { useState } from 'react';
import { 
  Check, X, Star, Crown, Shield, Zap, Users, BarChart3,
  FileText, Database, Headphones, Brain, Sparkles, Target,
  ChevronDown, ChevronUp, Info, ExternalLink
} from 'lucide-react';

const FeatureComparisonTable = ({ plans, highlightPlan, currentPlan }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set(['Core Features']));
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const features = [
    {
      category: "Core Features",
      icon: Target,
      items: [
        { 
          key: "max_posts_per_month", 
          label: "Posts per Month", 
          icon: FileText,
          description: "Create and publish posts to reach your audience",
          type: "number"
        },
        { 
          key: "max_storage_gb", 
          label: "Storage", 
          icon: Database,
          description: "Store images, videos, and documents",
          type: "storage"
        },
        { 
          key: "max_team_members", 
          label: "Team Members", 
          icon: Users,
          description: "Collaborate with team members",
          type: "number"
        },
        { 
          key: "max_api_calls_per_month", 
          label: "API Calls", 
          icon: Zap,
          description: "Integrate with external services",
          type: "number"
        }
      ]
    },
    {
      category: "Analytics & Insights",
      icon: BarChart3,
      items: [
        { 
          key: "analytics_enabled", 
          label: "Basic Analytics", 
          icon: BarChart3,
          description: "View basic performance metrics",
          type: "boolean"
        },
        { 
          key: "advanced_analytics", 
          label: "Advanced Analytics", 
          icon: BarChart3,
          description: "Detailed insights and custom reports",
          type: "boolean"
        },
        { 
          key: "ai_insights_enabled", 
          label: "AI Insights", 
          icon: Brain,
          description: "AI-powered recommendations and predictions",
          type: "boolean"
        },
        { 
          key: "ai_predictions_enabled", 
          label: "AI Predictions", 
          icon: Sparkles,
          description: "Forecast trends and performance",
          type: "boolean"
        }
      ]
    },
    {
      category: "Business Features",
      icon: Crown,
      items: [
        { 
          key: "custom_branding", 
          label: "Custom Branding", 
          icon: Star,
          description: "Customize with your brand colors and logo",
          type: "boolean"
        },
        { 
          key: "white_label", 
          label: "White Label", 
          icon: Crown,
          description: "Remove platform branding completely",
          type: "boolean"
        },
        { 
          key: "api_access_enabled", 
          label: "API Access", 
          icon: Zap,
          description: "Full API access for integrations",
          type: "boolean"
        },
        { 
          key: "custom_ai_models", 
          label: "Custom AI Models", 
          icon: Brain,
          description: "Train custom AI models for your business",
          type: "boolean"
        }
      ]
    },
    {
      category: "Support & SLA",
      icon: Shield,
      items: [
        { 
          key: "priority_support", 
          label: "Priority Support", 
          icon: Headphones,
          description: "Get faster response times",
          type: "boolean"
        },
        { 
          key: "dedicated_account_manager", 
          label: "Dedicated Account Manager", 
          icon: Users,
          description: "Personal account manager for Enterprise plans",
          type: "boolean"
        },
        { 
          key: "sla_response_hours", 
          label: "SLA Response Time", 
          icon: Shield,
          description: "Guaranteed response time",
          type: "hours"
        },
        { 
          key: "support_level", 
          label: "Support Channel", 
          icon: Headphones,
          description: "Available support channels",
          type: "text"
        }
      ]
    }
  ];

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const formatFeatureValue = (value, type, planType) => {
    if (value === null || value === undefined) {
      return <X className="w-4 h-4 text-gray-400" />;
    }

    switch (type) {
      case 'boolean':
        return value ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <X className="w-4 h-4 text-gray-400" />
        );
      
      case 'number':
        if (value === -1 || value === 999999) {
          return (
            <span className="text-green-600 font-medium flex items-center">
              Unlimited
              <Crown className="w-3 h-3 ml-1" />
            </span>
          );
        }
        return (
          <span className="font-medium text-gray-900">
            {value.toLocaleString()}
          </span>
        );
      
      case 'storage':
        if (value === -1 || value === 999999) {
          return (
            <span className="text-green-600 font-medium flex items-center">
              Unlimited
              <Crown className="w-3 h-3 ml-1" />
            </span>
          );
        }
        return (
          <span className="font-medium text-gray-900">
            {value >= 1000 ? `${(value/1000).toFixed(1)}TB` : `${value}GB`}
          </span>
        );
      
      case 'hours':
        return (
          <span className="font-medium text-gray-900">
            {value}h
          </span>
        );
      
      case 'text':
        return (
          <span className="font-medium text-gray-900 capitalize">
            {value.replace(/_/g, ' ')}
          </span>
        );
      
      default:
        return <span className="font-medium text-gray-900">{value}</span>;
    }
  };

  const getPlanBadge = (plan) => {
    if (plan.popular) {
      return (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-medium flex items-center">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </span>
        </div>
      );
    }
    
    if (plan.recommended) {
      return (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-medium">
            Recommended
          </span>
        </div>
      );
    }
    
    return null;
  };

  const isCurrentPlan = (plan) => {
    return currentPlan && plan.id === currentPlan.id;
  };

  const isHighlighted = (plan) => {
    return highlightPlan && plan.id === highlightPlan;
  };

  if (!plans || plans.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No plans available for comparison</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Feature Comparison
          </h3>
          
          <button
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            {showAllFeatures ? 'Show Less' : 'Show All Features'}
            {showAllFeatures ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Plan Headers */}
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4 font-medium text-gray-700 min-w-[200px]">
                Features
              </th>
              {plans.map(plan => (
                <th 
                  key={plan.id} 
                  className={`text-center p-4 min-w-[140px] relative ${
                    isHighlighted(plan) ? 'bg-blue-50 border-blue-200' : ''
                  } ${isCurrentPlan(plan) ? 'bg-green-50' : ''}`}
                >
                  {getPlanBadge(plan)}
                  
                  <div className="pt-2">
                    <div className="font-semibold text-gray-900 mb-1 flex items-center justify-center">
                      {plan.name}
                      {isCurrentPlan(plan) && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      ${plan.price}
                      <span className="text-sm font-normal text-gray-500">
                        /{plan.billing_cycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    
                    {plan.tagline && (
                      <p className="text-xs text-gray-600 italic">
                        {plan.tagline}
                      </p>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {features.map(category => {
              const isExpanded = expandedCategories.has(category.category);
              const CategoryIcon = category.icon;
              
              return (
                <React.Fragment key={category.category}>
                  {/* Category Header */}
                  <tr className="bg-gray-100 border-b">
                    <td 
                      colSpan={plans.length + 1} 
                      className="p-4 cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => toggleCategory(category.category)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CategoryIcon className="w-5 h-5 mr-3 text-gray-600" />
                          <span className="font-medium text-gray-800">{category.category}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Category Features */}
                  {(isExpanded || showAllFeatures) && category.items.map(feature => (
                    <tr key={feature.key} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-start">
                          <feature.icon className="w-4 h-4 mr-3 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-800 mb-1">
                              {feature.label}
                            </div>
                            <div className="text-xs text-gray-600">
                              {feature.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {plans.map(plan => (
                        <td 
                          key={plan.id} 
                          className={`p-4 text-center ${
                            isHighlighted(plan) ? 'bg-blue-50' : ''
                          } ${isCurrentPlan(plan) ? 'bg-green-50' : ''}`}
                        >
                          {formatFeatureValue(plan[feature.key], feature.type, plan.plan_type)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Call to Action Footer */}
      <div className="p-6 bg-gray-50 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className="text-center">
              <button 
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  isCurrentPlan(plan)
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : isHighlighted(plan) || plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                disabled={isCurrentPlan(plan)}
              >
                {isCurrentPlan(plan) ? 'Current Plan' : 'Choose Plan'}
              </button>
              
              {!isCurrentPlan(plan) && (
                <div className="mt-2">
                  <a 
                    href={`/subscriptions/plans/${plan.id}`}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center justify-center"
                  >
                    View Details
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureComparisonTable;
