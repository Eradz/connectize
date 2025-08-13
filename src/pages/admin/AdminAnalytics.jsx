import React, { useState } from "react";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CubeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import StatsCard from "../../components/admin/dashboard/StatsCard";
import ChartCard from "../../components/admin/dashboard/ChartCard";

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState("30d");

  // Mock data - replace with real API calls
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
      title: "User Growth Rate",
      value: "8.2%",
      change: "+2.1%",
      changeType: "increase",
      icon: TrendingUpIcon,
      color: "green",
    },
    {
      title: "Companies Verified",
      value: "1,234",
      change: "+8%",
      changeType: "increase",
      icon: BuildingOfficeIcon,
      color: "purple",
    },
    {
      title: "Active Companies",
      value: "95.6%",
      change: "+1.2%",
      changeType: "increase",
      icon: ChartBarIcon,
      color: "emerald",
    },
    {
      title: "Products Listed",
      value: "5,678",
      change: "+15%",
      changeType: "increase",
      icon: CubeIcon,
      color: "orange",
    },
    {
      title: "Content Published",
      value: "8,901",
      change: "+18%",
      changeType: "increase",
      icon: DocumentTextIcon,
      color: "indigo",
    },
  ];

  const userGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Users",
        data: [1200, 1900, 3000, 5000, 4200, 6200],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: "Active Users",
        data: [800, 1200, 2100, 3800, 3200, 4800],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue ($)",
        data: [12000, 19000, 30000, 50000, 42000, 62000],
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  const contentDistribution = {
    labels: ["Products", "Services", "Posts", "Documents"],
    datasets: [
      {
        data: [40, 30, 25, 5],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(34, 197, 94)",
          "rgb(168, 85, 247)",
          "rgb(245, 158, 11)",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your platform performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-auto">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="User Growth Trends"
          subtitle="New vs Active users over time"
          type="line"
          data={userGrowthData}
        />
        <ChartCard
          title="Revenue Analytics"
          subtitle="Monthly revenue breakdown"
          type="bar"
          data={revenueData}
        />
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Content Distribution"
          subtitle="Platform content breakdown"
          type="doughnut"
          data={contentDistribution}
        />
        
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Platform Performance Metrics
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Session Duration</span>
                <span className="text-blue-600 font-semibold">8m 32s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Page Views per Session</span>
                <span className="text-green-600 font-semibold">4.2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bounce Rate</span>
                <span className="text-orange-600 font-semibold">23.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="text-purple-600 font-semibold">3.8%</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Response Time</span>
                <span className="text-blue-600 font-semibold">125ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Error Rate</span>
                <span className="text-red-600 font-semibold">0.12%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Server Uptime</span>
                <span className="text-green-600 font-semibold">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cache Hit Rate</span>
                <span className="text-purple-600 font-semibold">94.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Content */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Content
          </h3>
          <div className="space-y-3">
            {[
              { title: "Industrial Pump Model X200", views: 2453, type: "Product" },
              { title: "Equipment Maintenance Service", views: 1876, type: "Service" },
              { title: "Oil & Gas Industry Trends", views: 1654, type: "Post" },
              { title: "Safety Equipment Guide", views: 1432, type: "Document" },
              { title: "Pipeline Inspection Tools", views: 1298, type: "Product" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">{item.views.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">views</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Engagement Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Daily Active Users</span>
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-semibold">3,245</span>
                <TrendingUpIcon className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Weekly Active Users</span>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-semibold">8,934</span>
                <TrendingUpIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Monthly Active Users</span>
              <div className="flex items-center space-x-2">
                <span className="text-purple-600 font-semibold">12,453</span>
                <TrendingUpIcon className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">User Retention Rate</span>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 font-semibold">76.8%</span>
                <TrendingDownIcon className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New User Registration</span>
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-semibold">234</span>
                <span className="text-xs text-gray-500">today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
            <p className="text-gray-600">Download detailed analytics reports</p>
          </div>
          <div className="flex space-x-3">
            <Button>Export PDF</Button>
            <Button variant="secondary">Export CSV</Button>
            <Button variant="ghost">Schedule Report</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
