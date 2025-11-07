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
    return null;
  };

  const isCurrentPlan = (plan) => currentPlan && plan.id === currentPlan.id;
  const isHighlighted = (plan) => highlightPlan && plan.id === highlightPlan;

export default FeatureComparisonTable;
