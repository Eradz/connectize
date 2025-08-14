import React, { useState } from 'react';
import { useAuth } from '../../context/userContext';
import { useFeatureFlags } from '../../context/featureFlagContext';
import Button from '../ui/Button';
import { 
  CheckIcon, 
  XMarkIcon, 
  StarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CogIcon,
  ChartBarIcon,
  UserGroupIcon,
  BoltIcon
} from '../ui/ModernIcon';

const FeatureComparisonTable = () => {
  const { user, subscription } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const [selectedPlan, setSelectedPlan] = useState('premium');

  const plans = {
    trial: {
      name: 'Trial',
      price: 'Free',
      duration: '14 days',
      description: 'Perfect for exploring the platform',
      icon: <StarIcon className="h-8 w-8" />,
      color: 'gray',
      popular: false
    },
    standard: {
      name: 'Standard',
      price: '$49',
      duration: '/month',
      description: 'Essential features for growing businesses',
      icon: <CheckIcon className="h-8 w-8" />,
      color: 'blue',
      popular: true
    },
    premium: {
      name: 'Premium',
      price: '$149',
      duration: '/month',
      description: 'Advanced features for enterprise operations',
      icon: <RocketLaunchIcon className="h-8 w-8" />,
      color: 'purple',
      popular: false
    }
  };

  const featureCategories = [
    {
      name: 'Core Platform Access',
      icon: <CogIcon className="h-5 w-5" />,
      features: [
        {
          name: 'User Account & Profile',
          description: 'Basic account management and profile customization',
          trial: true,
          standard: true,
          premium: true
        },
        {
          name: 'Content Publishing',
          description: 'Create and publish posts, products, and services',
          trial: { limit: '5 posts/month' },
          standard: { limit: '50 posts/month' },
          premium: { limit: 'Unlimited' }
        },
        {
          name: 'Search & Discovery',
          description: 'Advanced search across platform content',
          trial: true,
          standard: true,
          premium: true
        },
        {
          name: 'Mobile App Access',
          description: 'Full access to iOS and Android applications',
          trial: true,
          standard: true,
          premium: true
        }
      ]
    },
    {
      name: 'AI-Powered Features',
      icon: <SparklesIcon className="h-5 w-5" />,
      features: [
        {
          name: 'AI Matchmaking',
          description: 'Intelligent business connection recommendations',
          trial: { limit: '3 matches/day' },
          standard: { limit: '20 matches/day' },
          premium: { limit: 'Unlimited' }
        },
        {
          name: 'Opportunity Radar',
          description: 'AI-powered business opportunity detection',
          trial: false,
          standard: { limit: '10 opportunities/week' },
          premium: { limit: 'Unlimited + Real-time alerts' }
        },
        {
          name: 'Predictive Analytics',
          description: 'Advanced analytics and market insights',
          trial: false,
          standard: false,
          premium: true
        },
        {
          name: 'AI Compliance Assistant',
          description: 'Automated compliance monitoring and alerts',
          trial: false,
          standard: false,
          premium: true
        }
      ]
    },
    {
      name: 'Deal Flow & Transactions',
      icon: <ChartBarIcon className="h-5 w-5" />,
      features: [
        {
          name: 'Virtual Deal Rooms',
          description: 'Secure spaces for transaction management',
          trial: false,
          standard: { limit: '2 active rooms' },
          premium: { limit: 'Unlimited rooms' }
        },
        {
          name: 'E-Invoicing System',
          description: 'Digital invoicing and payment processing',
          trial: false,
          standard: { limit: '$10K/month volume' },
          premium: { limit: 'Unlimited volume' }
        },
        {
          name: 'Logistics Hub',
          description: 'Supply chain and logistics management',
          trial: false,
          standard: { limit: 'Basic tracking' },
          premium: { limit: 'Advanced + API access' }
        },
        {
          name: 'Contract Management',
          description: 'Digital contract creation and management',
          trial: false,
          standard: false,
          premium: true
        }
      ]
    },
    {
      name: 'Community & Networking',
      icon: <UserGroupIcon className="h-5 w-5" />,
      features: [
        {
          name: 'Professional Forums',
          description: 'Access to industry discussion forums',
          trial: { limit: 'Read-only' },
          standard: { limit: 'Full participation' },
          premium: { limit: 'Full + Moderator tools' }
        },
        {
          name: 'Event Management',
          description: 'Create and manage professional events',
          trial: false,
          standard: { limit: '2 events/month' },
          premium: { limit: 'Unlimited events' }
        },
        {
          name: 'Workforce Marketplace',
          description: 'Connect with skilled professionals',
          trial: false,
          standard: { limit: 'Basic access' },
          premium: { limit: 'Priority matching' }
        },
        {
          name: 'Industry Councils',
          description: 'Participate in exclusive industry groups',
          trial: false,
          standard: false,
          premium: true
        }
      ]
    },
    {
      name: 'Premium Services',
      icon: <BoltIcon className="h-5 w-5" />,
      features: [
        {
          name: 'Featured Ads',
          description: 'Promote your content with targeted advertising',
          trial: false,
          standard: { limit: '$500/month ad spend' },
          premium: { limit: 'Unlimited ad spend' }
        },
        {
          name: 'Knowledge Hub Access',
          description: 'Premium industry insights and reports',
          trial: { limit: '2 articles/month' },
          standard: { limit: '20 articles/month' },
          premium: { limit: 'Unlimited access' }
        },
        {
          name: 'Data Licensing',
          description: 'Access to premium market data and APIs',
          trial: false,
          standard: false,
          premium: true
        },
        {
          name: 'White-label Solutions',
          description: 'Customize platform for your brand',
          trial: false,
          standard: false,
          premium: true
        }
      ]
    },
    {
      name: 'Trust & Security',
      icon: <ShieldCheckIcon className="h-5 w-5" />,
      features: [
        {
          name: 'Identity Verification',
          description: 'Professional identity verification services',
          trial: false,
          standard: { limit: 'Basic verification' },
          premium: { limit: 'Enhanced + Background check' }
        },
        {
          name: 'Reputation System',
          description: 'Track and display professional reputation',
          trial: { limit: 'View only' },
          standard: true,
          premium: { limit: 'Advanced metrics' }
        },
        {
          name: 'HSE Management',
          description: 'Health, Safety & Environmental tools',
          trial: false,
          standard: false,
          premium: true
        },
        {
          name: 'Audit Trail',
          description: 'Comprehensive activity logging',
          trial: false,
          standard: { limit: '90 days' },
          premium: { limit: 'Unlimited history' }
        }
      ]
    }
  ];

  const renderFeatureValue = (feature, plan) => {
    const value = feature[plan];
    
    if (value === true) {
      return <CheckIcon className="h-5 w-5 text-green-500" />;
    }
    
    if (value === false) {
      return <XMarkIcon className="h-5 w-5 text-gray-300" />;
    }
    
    if (typeof value === 'object' && value.limit) {
      return (
        <div className="text-center">
          <CheckIcon className="h-4 w-4 text-green-500 mx-auto mb-1" />
          <span className="text-xs text-gray-600">{value.limit}</span>
        </div>
      );
    }
    
    return <XMarkIcon className="h-5 w-5 text-gray-300" />;
  };

  const getPlanButtonText = (planKey) => {
    if (subscription?.plan === planKey) {
      return 'Current Plan';
    }
    
    switch (planKey) {
      case 'trial':
        return 'Start Free Trial';
      case 'standard':
        return 'Upgrade to Standard';
      case 'premium':
        return 'Upgrade to Premium';
      default:
        return 'Select Plan';
    }
  };

  const getPlanButtonVariant = (planKey) => {
    if (subscription?.plan === planKey) {
      return 'minimal';
    }
    
    return planKey === 'premium' ? 'gradient' : 'primary';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Compare features across all subscription plans and find the perfect fit for your business needs
        </p>
      </div>

      {/* Plan Headers */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="col-span-1">
          {/* Empty space for feature names */}
        </div>
        
        {Object.entries(plans).map(([planKey, plan]) => (
          <div key={planKey} className="text-center">
            <div className={`bg-white rounded-xl p-6 shadow-sm border-2 ${
              plan.popular ? 'border-blue-500' : 'border-gray-200'
            } relative`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`w-16 h-16 bg-${plan.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <div className={`text-${plan.color}-600`}>
                  {plan.icon}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600">{plan.duration}</span>
              </div>
              <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
              
              <Button 
                variant={getPlanButtonVariant(planKey)}
                size="sm"
                disabled={subscription?.plan === planKey}
                className="w-full"
              >
                {getPlanButtonText(planKey)}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {featureCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            {/* Category Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-4 gap-6 p-6">
                <div className="col-span-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </h3>
                  </div>
                </div>
                <div className="col-span-3"></div>
              </div>
            </div>

            {/* Category Features */}
            {category.features.map((feature, featureIndex) => (
              <div key={featureIndex} className="border-b border-gray-100 last:border-b-0">
                <div className="grid grid-cols-4 gap-6 p-6 hover:bg-gray-50 transition-colors">
                  <div className="col-span-1">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {feature.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center flex items-center justify-center">
                    {renderFeatureValue(feature, 'trial')}
                  </div>
                  
                  <div className="text-center flex items-center justify-center">
                    {renderFeatureValue(feature, 'standard')}
                  </div>
                  
                  <div className="text-center flex items-center justify-center">
                    {renderFeatureValue(feature, 'premium')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to get started?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of oil & gas professionals who are already using Connectize to grow their business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureComparisonTable;
