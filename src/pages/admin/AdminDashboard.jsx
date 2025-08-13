import React from "react";
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  BanknotesIcon,
  TrendingUpIcon,
} from "@heroicons/react/24/outline";
import StatsCard from "../../components/admin/dashboard/StatsCard";
import ChartCardSimple from "../../components/admin/dashboard/ChartCardSimple";
import RecentActivityCard from "../../components/admin/dashboard/RecentActivityCard";
import QuickActionsCard from "../../components/admin/dashboard/QuickActionsCard";

const AdminDashboard = () => {
  // Mock data - Replace with real API calls
  const stats = [
    {
      title: "Total Users",
      value: "12,453",
      change: "+12%",
      changeType: "increase",
      icon: UsersIcon,
      color: "blue",
    },
    {
      title: "Active Companies",
      value: "1,234",
      change: "+8%",
      changeType: "increase",
      icon: BuildingOfficeIcon,
      color: "green",
    },
    {
      title: "Total Products",
      value: "5,678",
      change: "+15%",
      changeType: "increase",
      icon: CubeIcon,
      color: "purple",
    },
    {
      title: "Active Services",
      value: "2,345",
      change: "+6%",
      changeType: "increase",
      icon: WrenchScrewdriverIcon,
      color: "orange",
    },
    {
      title: "Monthly Revenue",
      value: "$89,234",
      change: "+23%",
      changeType: "increase",
      icon: BanknotesIcon,
      color: "emerald",
    },
    {
      title: "Posts Created",
      value: "8,901",
      change: "+18%",
      changeType: "increase",
      icon: DocumentTextIcon,
      color: "indigo",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "user_registration",
      message: "New user John Doe registered",
      timestamp: "2 minutes ago",
      avatar: null,
    },
    {
      id: 2,
      type: "company_verification",
      message: "Company 'Oil Tech Solutions' verification completed",
      timestamp: "15 minutes ago",
      avatar: null,
    },
    {
      id: 3,
      type: "product_approval",
      message: "Product 'Industrial Valve' approved",
      timestamp: "32 minutes ago",
      avatar: null,
    },
    {
      id: 4,
      type: "service_posting",
      message: "New service 'Equipment Maintenance' posted",
      timestamp: "1 hour ago",
      avatar: null,
    },
    {
      id: 5,
      type: "user_report",
      message: "User content reported - requires review",
      timestamp: "2 hours ago",
      avatar: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCardSimple
          title="User Growth"
          subtitle="Monthly user registrations"
          type="line"
        />
        <ChartCardSimple
          title="Revenue Trend"
          subtitle="Monthly revenue breakdown"
          type="bar"
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - spans 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivityCard activities={recentActivities} />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActionsCard />
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Platform Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Server Uptime</span>
              <span className="text-green-600 font-semibold">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Response Time</span>
              <span className="text-blue-600 font-semibold">125ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Sessions</span>
              <span className="text-purple-600 font-semibold">2,453</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Storage Used</span>
              <span className="text-orange-600 font-semibold">67%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Content
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Most Viewed Product</span>
              <span className="text-blue-600 font-semibold">Industrial Pump</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Top Service Provider</span>
              <span className="text-green-600 font-semibold">TechOil Ltd</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Most Active User</span>
              <span className="text-purple-600 font-semibold">John Smith</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Trending Category</span>
              <span className="text-orange-600 font-semibold">Equipment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
