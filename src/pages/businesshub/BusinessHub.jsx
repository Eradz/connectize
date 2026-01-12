import React, { useState, useEffect } from 'react';
import { 
  dealRoomService, 
  workforceJobService, 
  dealActivityService,
  aiOpportunityService,
  aiComplianceService, 
  workforceEventService
} from '../../api-services/oilgas';
import { listingService } from '../../api-services/marketplace';
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
    marketplace: { count: 0, data: [] },
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
        adsSummaryRes,
        marketplaceRes
      ] = await Promise.all([
        dealRoomService.getAll(1, 5),
        workforceJobService.getAll(1, 5),
        dealActivityService.getRecentActivities(10),
        aiOpportunityService.getOpportunities(),
        aiComplianceService.getComplianceAlerts(),
        workforceEventService.getAll(1, 5),
        listingService.getListings({ page_size: 5 }).catch(() => ({ count: 0, results: [] }))
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
        marketplace: {
          count: marketplaceRes?.count || 0,
          data: marketplaceRes?.results || []
        },
        analytics: {
          revenue: totalDealValue,
          growth: 0, // Mock data
          activeUsers: 1248, // Mock data
          completedDeals: 23 // Mock data
        },
        // ads: {
        //   active: adsSummaryRes?.active_campaigns || 0,
        //   impressions: adsSummaryRes?.impressions || 0,
        //   clicks: adsSummaryRes?.clicks || 0,
        //   spent: adsSummaryRes?.spent || 0,
        // },
        events: {
          count: adsSummaryRes?.count || 0,
          data: adsSummaryRes?.results || []
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
    <div className='px-6 md:px-0'>
      {/* Header */}
      <BusinessHubHeader dashboardData={dashboardData} />
      

      <div className="">

        {/* Platform Modules */}
        <div className="flex flex-col md:flex-row gap-6 h-fit ">
          <h2 className="text-lg font-semibold text-gray-900 md:hidden">Platform Modules</h2>
          <PlatformModules dashboardData={dashboardData} />
          <div className="w-full md:w-[30%]">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 md:hidden">Recent Activities</h2>
            <RecentActivities dashboardData={dashboardData} />
          </div>
        </div>

        {/* Recent Deal Rooms */}
        <div className="py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 md:hidden">Recent Deal Rooms</h2>
          <RecentDealRooms dashboardData={dashboardData} />
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
