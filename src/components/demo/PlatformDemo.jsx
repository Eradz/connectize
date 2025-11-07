import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/userContext';
import { useFeatureFlags } from '../../context/featureFlagContext';
import Button from '../ui/Button';
import { 
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  SparklesIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CogIcon,
  BoltIcon,
  GlobeAltIcon,
  TruckIcon,
  AcademicCapIcon,
  BuildingOfficeIcon
} from '../ui/ModernIcon';

const PlatformDemo = () => {
  const { user } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const demoSections = [
    {
      id: 'ai_features',
      title: 'AI-Powered Intelligence',
      subtitle: 'Smart Connections & Insights',
      description: 'Experience how AI transforms your business connections with intelligent matchmaking, opportunity detection, and predictive analytics.',
      icon: <SparklesIcon className="h-8 w-8" />,
      color: 'purple',
      features: [
        'AI Matchmaking finds perfect business partners',
        'Opportunity Radar detects market opportunities',
        'Predictive Analytics forecasts market trends',
        'Compliance Assistant ensures regulatory adherence'
      ],
      mockData: {
        matches: 47,
        opportunities: 12,
        accuracy: '94.2%',
        timeToMatch: '2.3s'
      }
    },
    {
      id: 'deal_flow',
      title: 'Deal Flow Management',
      subtitle: 'From Discovery to Completion',
      description: 'Streamline your entire transaction process with virtual deal rooms, e-invoicing, and logistics coordination.',
      icon: <ChartBarIcon className="h-8 w-8" />,
      color: 'blue',
      features: [
        'Virtual Deal Rooms for secure negotiations',
        'E-Invoicing system with payment tracking',
        'Logistics Hub for supply chain management',
        'Contract management with digital signatures'
      ],
      mockData: {
        activeDeals: 23,
        avgCloseTime: '14 days',
        successRate: '89%',
        volume: '$2.4M'
      }
    },
    {
      id: 'community',
      title: 'Professional Community',
      subtitle: 'Network & Collaborate',
      description: 'Connect with industry professionals through forums, events, workforce marketplace, and exclusive councils.',
      icon: <UserGroupIcon className="h-8 w-8" />,
      color: 'green',
      features: [
        'Industry forums with expert discussions',
        'Professional event management',
        'Workforce marketplace for hiring',
        'Exclusive industry councils'
      ],
      mockData: {
        members: '12,485',
        activeDiscussions: 89,
        upcomingEvents: 15,
        skillsAvailable: 247
      }
    },
    {
      id: 'monetization',
      title: 'Monetization Tools',
      subtitle: 'Grow Your Revenue',
      description: 'Leverage featured advertising, knowledge hub, data licensing, and subscription models to maximize your platform value.',
      icon: <CurrencyDollarIcon className="h-8 w-8" />,
      color: 'yellow',
      features: [
        'Featured ads with targeted campaigns',
        'Premium knowledge hub access',
        'Data licensing for market insights',
        'Flexible subscription plans'
      ],
      mockData: {
        monthlyRevenue: '$45,782',
        adRevenue: '$8,945',
        conversionRate: '12.8%',
        avgRevenuePerUser: '$89.45'
      }
    },
    {
      id: 'trust_security',
      title: 'Trust & Security',
      subtitle: 'Verified & Secure',
      description: 'Build trust with comprehensive identity verification, reputation systems, and advanced security measures.',
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      color: 'red',
      features: [
        'Professional identity verification',
        'Reputation scoring system',
        'HSE compliance management',
        'Comprehensive audit trails'
      ],
      mockData: {
        verifiedUsers: '8,942',
        avgReputation: '4.7/5',
        securityIncidents: '0',
        uptime: '99.97%'
      }
    },
    {
      id: 'specialized_tools',
      title: 'Specialized Tools',
      subtitle: 'Industry-Specific Solutions',
      description: 'Access specialized tools for equipment sharing, HSE management, supply chain optimization, and regulatory compliance.',
      icon: <CogIcon className="h-8 w-8" />,
      color: 'indigo',
      features: [
        'Equipment sharing marketplace',
        'HSE management dashboard',
        'Supply chain optimization',
        'Regulatory compliance tracking'
      ],
      mockData: {
        equipmentListed: 456,
        safetyScore: '98.5%',
        supplierNetwork: 289,
        complianceRate: '100%'
      }
    }
  ];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setCurrentDemo(curr => (curr + 1) % demoSections.length);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, demoSections.length]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const goToDemo = (index) => {
    setCurrentDemo(index);
    setProgress(0);
  };

  const nextDemo = () => {
    setCurrentDemo((prev) => (prev + 1) % demoSections.length);
    setProgress(0);
  };

  const currentSection = demoSections[currentDemo];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Platform Demo
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Explore the comprehensive features that make Connectize the leading platform for oil & gas professionals
        </p>
        
        {/* Demo Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button 
            onClick={togglePlayback}
            variant="primary"
            size="sm"
            className="flex items-center space-x-2"
          >
            {isPlaying ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            <span>{isPlaying ? 'Pause' : 'Play'} Demo</span>
          </Button>
          
          <Button 
            onClick={nextDemo}
            variant="minimal"
            size="sm"
            className="flex items-center space-x-2"
          >
            <span>Next Section</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-12">
        {demoSections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => goToDemo(index)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              currentDemo === index
                ? `border-${section.color}-500 bg-${section.color}-50`
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              currentDemo === index
                ? `bg-${section.color}-100 text-${section.color}-600`
                : 'bg-gray-100 text-gray-600'
            }`}>
              {section.icon}
            </div>
            <h3 className={`text-sm font-medium ${
              currentDemo === index ? `text-${section.color}-900` : 'text-gray-900'
            }`}>
              {section.title}
            </h3>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div 
          className={`bg-${currentSection.color}-500 h-2 rounded-full transition-all duration-100`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main Demo Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className={`bg-gradient-to-r from-${currentSection.color}-600 to-${currentSection.color}-700 text-white p-8`}>
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-16 h-16 bg-${currentSection.color}-500 rounded-xl flex items-center justify-center`}>
              {currentSection.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{currentSection.title}</h2>
              <p className={`text-${currentSection.color}-100 text-lg`}>{currentSection.subtitle}</p>
            </div>
          </div>
          <p className={`text-${currentSection.color}-100 text-lg max-w-3xl`}>
            {currentSection.description}
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Features List */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h3>
              <div className="space-y-4">
                {currentSection.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-6 h-6 bg-${currentSection.color}-100 rounded-full flex items-center justify-center mt-0.5`}>
                      <div className={`w-2 h-2 bg-${currentSection.color}-500 rounded-full`}></div>
                    </div>
                    <span className="text-gray-700 text-lg">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Button 
                  variant="primary" 
                  className={`bg-${currentSection.color}-600 hover:bg-${currentSection.color}-700`}
                >
                  Try This Feature
                </Button>
              </div>
            </div>

            {/* Mock Data Visualization */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Live Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(currentSection.mockData).map(([key, value], index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <div className={`text-2xl font-bold text-${currentSection.color}-600 mb-2`}>
                      {value}
                    </div>
                    <p className="text-gray-600 text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Feature Status Indicators */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Feature Status</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Core Features', enabled: true },
                    { name: 'AI Integration', enabled: isEnabled('ai_matchmaking') },
                    { name: 'Premium Tools', enabled: isEnabled('featured_ads') },
                    { name: 'Advanced Analytics', enabled: isEnabled('predictive_analytics') }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          item.enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <span className={`text-sm ${
                          item.enabled ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {item.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <GlobeAltIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Interactive Tutorials
          </h3>
          <p className="text-gray-600 mb-4">
            Step-by-step guides to help you master each feature
          </p>
          <Button variant="minimal" size="sm">
            Start Tutorial
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <AcademicCapIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Learning Resources
          </h3>
          <p className="text-gray-600 mb-4">
            Comprehensive documentation and video guides
          </p>
          <Button variant="minimal" size="sm">
            View Resources
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Schedule Demo
          </h3>
          <p className="text-gray-600 mb-4">
            Get a personalized demo with our experts
          </p>
          <Button variant="minimal" size="sm">
            Book Meeting
          </Button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">
          Ready to Transform Your Business?
        </h3>
        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of oil & gas professionals who are already using Connectize to grow their business and streamline operations.
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
  );
};

export default PlatformDemo;
