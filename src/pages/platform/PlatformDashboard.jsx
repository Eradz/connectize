import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  DollarSign,
  MapPin,
  Activity,
  Zap,
  Shield,
  Truck,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { 
  dealRoomService, 
  workforceJobService, 
  dealActivityService,
  aiOpportunityService,
  aiComplianceService 
} from '../../api-services/oilgas';
import SubscriptionCard from '../../components/dashboard/SubscriptionCard';

const PlatformDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    dealRooms: { count: 0, value: 0, data: [] },
    jobs: { count: 0, data: [] },
    activities: { count: 0, data: [] },
    opportunities: { count: 0, data: [] },
    compliance: { count: 0, alerts: 0, data: [] },
  analytics: {
      revenue: 0,
      growth: 0,
      activeUsers: 0,
      completedDeals: 0
  },
  ads: { active: 0, impressions: 0, clicks: 0, spent: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        dealRoomsRes,
        jobsRes,
        activitiesRes,
        opportunitiesRes,
        complianceRes,
        adsSummaryRes
      ] = await Promise.all([
        dealRoomService.getAll(1, 5),
        workforceJobService.getAll(1, 5),
        dealActivityService.getRecentActivities(10),
        aiOpportunityService.getOpportunities(),
        aiComplianceService.getComplianceAlerts(),
        import('../../api-services/ads').then(m => m.featuredAdsApi.summary()).catch(() => ({ active_campaigns: 0, impressions: 0, clicks: 0, spent: 0 }))
      ]);

      // Calculate total deal value
      const totalDealValue = dealRoomsRes?.results?.reduce((sum, deal) => 
        sum + parseFloat(deal.estimated_value || 0), 0) || 0;

      setDashboardData({
        dealRooms: {
          count: dealRoomsRes?.count || 0,
          value: totalDealValue,
          data: dealRoomsRes?.results || []
        },
        jobs: {
          count: jobsRes?.count || 0,
          data: jobsRes?.results || []
        },
        activities: {
          count: activitiesRes?.count || 0,
          data: activitiesRes?.results || []
        },
        opportunities: {
          count: opportunitiesRes?.count || 0,
          data: opportunitiesRes?.results || []
        },
        compliance: {
          count: complianceRes?.count || 0,
          alerts: complianceRes?.results?.filter(alert => alert.status === 'pending')?.length || 0,
          data: complianceRes?.results || []
        },
        analytics: {
          revenue: totalDealValue,
          growth: 12.5, // Mock data
          activeUsers: 1248, // Mock data
          completedDeals: 23 // Mock data
        },
        ads: {
          active: adsSummaryRes?.active_campaigns || 0,
          impressions: adsSummaryRes?.impressions || 0,
          clicks: adsSummaryRes?.clicks || 0,
          spent: adsSummaryRes?.spent || 0,
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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

  const formatCompactNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Oil & Gas Platform</h1>
              <p className="text-gray-600 mt-1">Comprehensive industry collaboration platform</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={webRoutes.dealRoomCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Deal Room
              </Link>
              <Link
                to={webRoutes.workforceJobCreate}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Job
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deal Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCompactNumber(dashboardData.analytics.revenue)}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +{dashboardData.analytics.growth}%
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deal Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.dealRooms.count}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {dashboardData.dealRooms.data.filter(d => d.status === 'active').length} active
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.jobs.count}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {dashboardData.jobs.data.filter(j => j.status === 'active').length} open positions
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured Ads</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.ads.active} active</p>
                <p className="text-sm text-gray-500 mt-1">
                  {dashboardData.ads.impressions.toLocaleString()} views · {dashboardData.ads.clicks.toLocaleString()} clicks
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <SubscriptionCard />
        </div>

        {/* Platform Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Platform Modules</h2>
                <Link 
                  to={webRoutes.platformOverview}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to={webRoutes.dealRooms}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3 group-hover:bg-blue-200">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Deal Rooms</h3>
                  </div>
                  <p className="text-sm text-gray-600">Secure collaboration spaces for M&A and partnerships</p>
                  <p className="text-xs text-blue-600 mt-2">{dashboardData.dealRooms.count} active</p>
                </Link>

                <Link
                  to={webRoutes.workforceJobs}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 p-2 rounded-lg mr-3 group-hover:bg-green-200">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Workforce</h3>
                  </div>
                  <p className="text-sm text-gray-600">Professional marketplace and talent acquisition</p>
                  <p className="text-xs text-green-600 mt-2">{dashboardData.jobs.count} positions</p>
                </Link>

                <Link
                  to={webRoutes.aiDashboard}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3 group-hover:bg-purple-200">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">AI Services</h3>
                  </div>
                  <p className="text-sm text-gray-600">Intelligent matching and market insights</p>
                  <p className="text-xs text-purple-600 mt-2">{dashboardData.opportunities.count} opportunities</p>
                </Link>

                <Link
                  to={webRoutes.logisticsDashboard}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3 group-hover:bg-orange-200">
                      <Truck className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Logistics Hub</h3>
                  </div>
                  <p className="text-sm text-gray-600">Supply chain and transportation management</p>
                  <p className="text-xs text-orange-600 mt-2">Global network</p>
                </Link>

                <Link
                  to={webRoutes.featuredAds}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3 group-hover:bg-yellow-200">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Featured Ads</h3>
                  </div>
                  <p className="text-sm text-gray-600">Promote your content across the platform</p>
                  <p className="text-xs text-yellow-600 mt-2">{dashboardData.ads.active} active</p>
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                <Link 
                  to={webRoutes.dealRoomActivities}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {dashboardData.activities.data.slice(0, 5).map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start space-x-3">
                    <div className="bg-gray-100 p-1.5 rounded-full">
                      <Activity className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
                {dashboardData.activities.data.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activities</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to={webRoutes.dealRoomCreate}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Create Deal Room</span>
                </Link>
                <Link
                  to={webRoutes.workforceJobCreate}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Post Job Opening</span>
                </Link>
                <Link
                  to={webRoutes.workforceProfileCreate}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Create Profile</span>
                </Link>
                <Link
                  to={webRoutes.trustVerification}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 text-indigo-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Get Verified</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Deal Rooms */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Deal Rooms</h2>
            <Link 
              to={webRoutes.dealRooms}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Deal Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Progress</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.dealRooms.data.map((deal, index) => (
                  <tr key={deal.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <Link 
                        to={webRoutes.dealRoomDetail.replace(':id', deal.id)}
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        {deal.title}
                      </Link>
                      <p className="text-sm text-gray-500">{deal.description}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {deal.deal_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {formatCurrency(deal.estimated_value)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${deal.status === 'active' ? 'bg-green-100 text-green-800' : 
                          deal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                        <span className="text-sm text-gray-600">65%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {dashboardData.dealRooms.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No deal rooms found. <Link to={webRoutes.dealRoomCreate} className="text-blue-600 hover:text-blue-700">Create your first deal room</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
