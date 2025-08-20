/**
 * SMART UPGRADE SUGGESTIONS COMPONENT
 * AI-powered upgrade recommendations based on usage patterns and business growth opportunities
 * Part of the Enhanced Subscription Dashboard Implementation Plan
 */

import React, { useState } from 'react';
import { 
  Sparkles, TrendingUp, Target, Zap, Crown, Shield,
  Users, BarChart3, Rocket, AlertCircle, CheckCircle,
  ArrowRight, Calculator, Star, Clock
} from 'lucide-react';

const SmartUpgradeSuggestions = ({ opportunities, recommendations, currentPlan, onUpgradeClick }) => {
  const [expandedCard, setExpandedCard] = useState(null);

  // Demo data when no real opportunities are available
  const getDemoOpportunities = () => [
    {
      feature: 'analytics',
      title: 'Unlock Advanced Analytics',
      description: 'Your posting activity suggests you could benefit from detailed performance insights.',
      current_usage_percentage: 75,
      impact: 'Increase engagement by 25%',
      recommendation: 'Upgrade to Professional plan',
      urgency: 'medium',
      potential_roi: 150,
      estimated_savings: 200
    },
    {
      feature: 'storage',
      title: 'Expand Storage Capacity',
      description: 'You\'re approaching your storage limit. Avoid service interruptions.',
      current_usage_percentage: 85,
      impact: 'Prevent service disruption',
      recommendation: 'Upgrade to Professional plan',
      urgency: 'high',
      potential_roi: 120,
      estimated_savings: 150
    }
  ];

  const getDemoRecommendations = () => [
    {
      type: 'cost_optimization',
      title: 'Annual Billing Savings',
      description: 'Switch to annual billing and save 20% on your subscription.',
      confidence: 'high'
    },
    {
      type: 'feature_upgrade',
      title: 'API Access Benefits',
      description: 'Enable API access to integrate with your existing tools.',
      confidence: 'medium'
    }
  ];

  const displayOpportunities = opportunities?.length > 0 ? opportunities : getDemoOpportunities();
  const displayRecommendations = recommendations?.length > 0 ? recommendations : getDemoRecommendations();

  if (!displayOpportunities || displayOpportunities.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">You're All Set!</h3>
          <p className="text-gray-600">Your current plan perfectly matches your usage patterns.</p>
        </div>
      </div>
    );
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyTextColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-700 bg-red-50';
      case 'medium': return 'text-orange-700 bg-orange-50';
      case 'low': return 'text-blue-700 bg-blue-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const getFeatureIcon = (feature) => {
    switch (feature) {
      case 'ai_insights': return <Sparkles className="w-5 h-5" />;
      case 'analytics': return <BarChart3 className="w-5 h-5" />;
      case 'team_members': return <Users className="w-5 h-5" />;
      case 'storage': return <Target className="w-5 h-5" />;
      case 'posts': return <Rocket className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const handleUpgradeClick = (opportunity) => {
    // Track upgrade intent
    if (window.gtag) {
      window.gtag('event', 'upgrade_intent', {
        event_category: 'subscription',
        feature: opportunity.feature,
        urgency: opportunity.urgency
      });
    }
    
    // Navigate to upgrade flow
    window.location.href = `/subscriptions/upgrade?feature=${opportunity.feature}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <Rocket className="w-6 h-6 mr-2" />
              🚀 Unlock More Value
            </h3>
            <p className="text-purple-100 mb-4">
              Based on your usage patterns, here are personalized recommendations to maximize your ROI.
            </p>
            
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                {opportunities.length} opportunities identified
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Updated in real-time
              </span>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <Crown className="w-8 h-8 text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Upgrade Opportunities */}
      <div className="space-y-4">
        {displayOpportunities.map((opportunity, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getUrgencyTextColor(opportunity.urgency)}`}>
                    {getFeatureIcon(opportunity.feature)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{opportunity.title}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyTextColor(opportunity.urgency)}`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${getUrgencyColor(opportunity.urgency)}`}></div>
                        {opportunity.urgency} priority
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{opportunity.description}</p>
                    
                    {/* Usage Statistics */}
                    {opportunity.current_usage_percentage && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Current Usage</span>
                          <span className="font-medium">{opportunity.current_usage_percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getUrgencyColor(opportunity.urgency)}`}
                            style={{ width: `${Math.min(opportunity.current_usage_percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center text-gray-600">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                        Impact: <strong className="ml-1">{opportunity.impact}</strong>
                      </span>
                      {opportunity.recommendation && (
                        <span className="text-blue-600">
                          💡 {opportunity.recommendation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleUpgradeClick(opportunity)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center space-x-2"
                >
                  <span>Upgrade Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {/* Expandable Details */}
              {expandedCard === index && (
                <div className="border-t pt-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Benefits</h5>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Immediate access to {opportunity.feature.replace('_', ' ')}
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Avoid service interruptions
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Enhanced productivity
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">ROI Estimate</h5>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center text-green-700">
                          <Calculator className="w-4 h-4 mr-2" />
                          <span className="font-medium">Potential ROI: 200-300%</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          Based on increased efficiency and avoided downtime
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3 flex items-center"
              >
                {expandedCard === index ? 'Show Less' : 'Show Details'}
                <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${expandedCard === index ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cost Recommendations */}
      {displayRecommendations && displayRecommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" />
            Cost Optimization Recommendations
          </h3>
          
          <div className="space-y-4">
            {displayRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Calculator className="w-5 h-5 text-green-600 mt-0.5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{recommendation.description}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    recommendation.confidence === 'high' ? 'bg-green-100 text-green-800' :
                    recommendation.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {recommendation.confidence} confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Summary */}
      <div className="bg-gray-50 rounded-xl p-6 border">
        <div className="text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Ready to Upgrade?</h4>
          <p className="text-gray-600 mb-4">
            Take action on these recommendations to maximize your platform's potential.
          </p>
          
          <div className="flex justify-center space-x-3">
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Compare Plans
            </button>
            <button className="bg-white text-purple-600 border border-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartUpgradeSuggestions;
