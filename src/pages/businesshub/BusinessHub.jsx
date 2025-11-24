import React, { useState, useEffect } from 'react';
import { 
  dealRoomService, 
  workforceJobService, 
  dealActivityService,
  aiOpportunityService,
  aiComplianceService 
} from '../../api-services/oilgas';
import BusinessHubHeader from '../../components/admin/businesshub/BusinessHubHeader';
import PlatformModules from '../../components/admin/businesshub/PlatformModules';
import RecentActivities from '../../components/admin/businesshub/RecentActivities';
import RecentDealRooms from '../../components/admin/businesshub/RecentDealRooms';

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
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div >
      {/* Header */}
      <BusinessHubHeader dashboardData={dashboardData} />
      

      <div className="">

        {/* Platform Modules */}
        <div className="flex flex-col md:flex-row gap-6 h-fit md:h-[510px]">
          <PlatformModules dashboardData={dashboardData} />
          <div className="w-full md:w-[30%]">
            <RecentActivities dashboardData={dashboardData} />
          </div>
        </div>

        {/* Recent Deal Rooms */}
        <div className="py-4">
          <RecentDealRooms dashboardData={dashboardData} />
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
