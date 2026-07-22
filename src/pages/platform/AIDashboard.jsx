import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "AI Services | Connectize - Intelligent Solutions",
    description: "Leverage AI-powered tools for deal matching, opportunity discovery, and business intelligence in the oil and gas industry.",
  keywords: "artificial intelligence, AI analytics, deal matching, machine learning, oil and gas AI",
  });

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  Users,
  Target,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Star,
  Lightbulb,
  Activity,
  Globe,
  Database,
  Settings
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { 
  aiMatchingService, 
  aiOpportunityService, 
  aiComplianceService 
} from '../../api-services/oilgas';
import { formatCompactNumber } from "../../utils/formatNumber";

const AIDashboard = () => {
  const [aiData, setAiData] = useState({
    matching: { profiles: 0, matches: 0, data: [] },
    opportunities: { count: 0, value: 0, data: [] },
    compliance: { total: 0, pending: 0, resolved: 0, data: [] },
    analytics: {
      matchAccuracy: 95,
      opportunitySuccess: 78,
      complianceScore: 92,
      aiUtilization: 85
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      setLoading(true);
      
      const [
        matchesRes,
        opportunitiesRes,
        complianceRes,
        profilesRes
      ] = await Promise.all([
        aiMatchingService.getMatches(),
        aiOpportunityService.getOpportunities(),
        aiComplianceService.getComplianceAlerts(),
        aiMatchingService.getMatchProfiles()
      ]);

      const pendingCompliance = complianceRes?.results?.filter(alert => alert.is_active && !alert.is_acknowledged)?.length || 0;
      const resolvedCompliance = complianceRes?.results?.filter(alert => alert.is_acknowledged)?.length || 0;
      
      // Calculate total opportunity value from real data
      const totalOpportunityValue = opportunitiesRes?.results?.reduce((sum, opp) => 
        sum + (parseFloat(opp.estimated_value) || 0), 0) || 0;

      setAiData({
        matching: {
          profiles: profilesRes?.count || profilesRes?.results?.length || 0,
          matches: matchesRes?.count || matchesRes?.results?.length || 0,
          data: matchesRes?.results || matchesRes || []
        },
        opportunities: {
          count: opportunitiesRes?.count || opportunitiesRes?.results?.length || 0,
          value: totalOpportunityValue,
          data: opportunitiesRes?.results || opportunitiesRes || []
        },
        compliance: {
          total: complianceRes?.count || complianceRes?.results?.length || 0,
          pending: pendingCompliance,
          resolved: resolvedCompliance,
          data: complianceRes?.results || complianceRes || []
        },
        analytics: {
          matchAccuracy: 95, // This could come from analytics API
          opportunitySuccess: 78, // This could come from analytics API
          complianceScore: pendingCompliance === 0 ? 100 : Math.max(0, 100 - (pendingCompliance * 10)),
          aiUtilization: 85 // This could come from analytics API
        }
      });
    } catch (error) {
      console.error('Failed to load AI data:', error);
      // Initialize with empty data instead of mock data
      setAiData({
        matching: { profiles: 0, matches: 0, data: [] },
        opportunities: { count: 0, value: 0, data: [] },
        compliance: { total: 0, pending: 0, resolved: 0, data: [] },
        analytics: { matchAccuracy: 0, opportunitySuccess: 0, complianceScore: 0, aiUtilization: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="w-8 h-8 mr-3 text-purple-600" />
                AI Services Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Intelligent insights and automation for oil & gas operations</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={webRoutes.aiAnalytics}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
              <Link
                to={webRoutes.aiInsights}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                AI Insights
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Match Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{aiData.analytics.matchAccuracy}%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +2.5% this week
                </p>
              </div>
              <div className={`p-3 rounded-lg ${getScoreBgColor(aiData.analytics.matchAccuracy)}`}>
                <Target className={`w-6 h-6 ${getScoreColor(aiData.analytics.matchAccuracy)}`} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opportunity Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{aiData.analytics.opportunitySuccess}%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Trending up
                </p>
              </div>
              <div className={`p-3 rounded-lg ${getScoreBgColor(aiData.analytics.opportunitySuccess)}`}>
                <Star className={`w-6 h-6 ${getScoreColor(aiData.analytics.opportunitySuccess)}`} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-gray-900">{aiData.analytics.complianceScore}%</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {aiData.compliance.pending} pending alerts
                </p>
              </div>
              <div className={`p-3 rounded-lg ${getScoreBgColor(aiData.analytics.complianceScore)}`}>
                <Shield className={`w-6 h-6 ${getScoreColor(aiData.analytics.complianceScore)}`} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{aiData.analytics.aiUtilization}%</p>
                <p className="text-sm text-gray-500 mt-1">
                  Platform efficiency
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Matching Service */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Matching</h3>
                  <p className="text-sm text-gray-600">Professional & opportunity matching</p>
                </div>
              </div>
              <Link 
                to={webRoutes.aiMatching}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Profiles</span>
                <span className="font-semibold text-gray-900">{aiData.matching.profiles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Matches</span>
                <span className="font-semibold text-gray-900">{aiData.matching.matches}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">{aiData.analytics.matchAccuracy}%</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                to={webRoutes.aiMatching}
                className="w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-custom_yellow transition-colors text-sm font-medium block"
              >
                Configure Matching
              </Link>
            </div>
          </div>

          {/* Opportunity Radar */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Opportunity Radar</h3>
                  <p className="text-sm text-gray-600">Market intelligence & insights</p>
                </div>
              </div>
              <Link 
                to={webRoutes.aiOpportunities}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Opportunities</span>
                <span className="font-semibold text-gray-900">{aiData.opportunities.count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="font-semibold text-gray-900">{formatCompactNumber(aiData.opportunities.value)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">{aiData.analytics.opportunitySuccess}%</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                to={webRoutes.aiOpportunities}
                className="w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium block"
              >
                Explore Opportunities
              </Link>
            </div>
          </div>

          {/* Compliance Monitoring */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg mr-4">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Compliance Monitor</h3>
                  <p className="text-sm text-gray-600">Automated compliance tracking</p>
                </div>
              </div>
              <Link 
                to={webRoutes.aiCompliance}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Alerts</span>
                <span className="font-semibold text-gray-900">{aiData.compliance.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-orange-600">{aiData.compliance.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resolved</span>
                <span className="font-semibold text-green-600">{aiData.compliance.resolved}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                to={webRoutes.aiCompliance}
                className="w-full bg-orange-600 text-white text-center py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium block"
              >
                Review Compliance
              </Link>
            </div>
          </div>
        </div>

        {/* AI Features Overview */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">AI-Powered Features</h2>
            <Link 
              to={webRoutes.aiInsights}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View insights
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900">Smart Matching</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                AI-powered matching between professionals, companies, and opportunities using advanced algorithms.
              </p>
              <div className="flex items-center text-xs text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                95% accuracy rate
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Market Intelligence</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Real-time market analysis and opportunity identification across global oil & gas markets.
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <Activity className="w-4 h-4 mr-1" />
                Live data feed
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">Predictive Analytics</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Advanced forecasting for deal success, market trends, and risk assessment.
              </p>
              <div className="flex items-center text-xs text-green-600">
                <Star className="w-4 h-4 mr-1" />
                78% success rate
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center mb-3">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-medium text-gray-900">Risk Assessment</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Automated risk analysis for deals, partnerships, and compliance requirements.
              </p>
              <div className="flex items-center text-xs text-orange-600">
                <Shield className="w-4 h-4 mr-1" />
                Real-time monitoring
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center mb-3">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <Database className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-medium text-gray-900">Data Insights</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Deep data analysis and insights generation from platform activities and external sources.
              </p>
              <div className="flex items-center text-xs text-indigo-600">
                <BarChart3 className="w-4 h-4 mr-1" />
                Advanced analytics
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center mb-3">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <Settings className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-medium text-gray-900">Process Automation</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Intelligent automation of routine tasks and workflow optimization.
              </p>
              <div className="flex items-center text-xs text-red-600">
                <Clock className="w-4 h-4 mr-1" />
                85% time savings
              </div>
            </div>
          </div>
        </div>

        {/* Recent AI Activities */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent AI Activities</h2>
            <Link 
              to={webRoutes.aiAnalytics}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View all activities
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">New Matches Generated</h4>
                <p className="text-sm text-gray-600">AI identified 12 new professional matches based on skills and preferences</p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Market Opportunity Detected</h4>
                <p className="text-sm text-gray-600">AI radar identified potential $50M offshore wind partnership opportunity</p>
                <p className="text-xs text-gray-500 mt-1">4 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg">
              <div className="bg-orange-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Compliance Alert Resolved</h4>
                <p className="text-sm text-gray-600">AI monitoring resolved HSE compliance issue automatically</p>
                <p className="text-xs text-gray-500 mt-1">6 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Predictive Analysis Complete</h4>
                <p className="text-sm text-gray-600">Deal success probability analysis completed for 5 active deal rooms</p>
                <p className="text-xs text-gray-500 mt-1">8 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
