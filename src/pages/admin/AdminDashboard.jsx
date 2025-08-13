import React from "react";
import {
  AnalyticsIcon,
  UsersIcon,
  CompanyIcon,
  ProductIcon,
  ServiceIcon,
  PostIcon,
  MoneyIcon,
  TrendingIcon,
  CheckIcon,
  SettingsIcon,
  InfoIcon,
  CalendarIcon,
  SecurityIcon,
  DashboardIcon,
  SystemIcon,
} from "../../components/ui/ModernIcon";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Avatar, { AvatarGroup } from "../../components/ui/Avatar";
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
      icon: CompanyIcon,
      color: "green",
    },
    {
      title: "Total Products",
      value: "5,678",
      change: "+15%",
      changeType: "increase",
      icon: ProductIcon,
      color: "purple",
    },
    {
      title: "Active Services",
      value: "2,345",
      change: "+6%",
      changeType: "increase",
      icon: ServiceIcon,
      color: "orange",
    },
    {
      title: "Monthly Revenue",
      value: "$89,234",
      change: "+23%",
      changeType: "increase",
      icon: MoneyIcon,
      color: "emerald",
    },
    {
      title: "Posts Created",
      value: "8,901",
      change: "+18%",
      changeType: "increase",
      icon: PostIcon,
      color: "indigo",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "user_registration",
      message: "New user John Doe registered",
      timestamp: "2 minutes ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      status: "success",
    },
    {
      id: 2,
      type: "company_verification",
      message: "Company 'Oil Tech Solutions' verification completed",
      timestamp: "15 minutes ago",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company",
      status: "success",
    },
    {
      id: 3,
      type: "product_approval",
      message: "Product 'Industrial Valve' approved",
      timestamp: "32 minutes ago",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=product",
      status: "warning",
    },
    {
      id: 4,
      type: "service_posting",
      message: "New service 'Equipment Maintenance' posted",
      timestamp: "1 hour ago",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=service",
      status: "primary",
    },
    {
      id: 5,
      type: "user_report",
      message: "User content reported - requires review",
      timestamp: "2 hours ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=report",
      status: "error",
    },
  ];

  return (
    <div className="space-y-6 animate-in">
      {/* Modern Hero Header */}
      <div className="relative overflow-hidden glass rounded-3xl p-8 border border-white/20 shadow-large">
        <div className="absolute inset-0 gradient-primary opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 gradient-primary opacity-5 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-3">
                Welcome back, Admin! 👋
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
                Here's what's happening with your platform today. Monitor performance, manage users, and drive growth.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <div className="status-badge status-badge-success">
                  <CalendarIcon size={16} />
                  Last updated: 2 min ago
                </div>
                <div className="status-badge status-badge-primary">
                  <SecurityIcon size={16} />
                  All systems operational
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="glass rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">99.9%</div>
                    <div className="text-gray-500 text-sm font-medium">System Uptime</div>
                  </div>
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-medium">
                    <TrendingIcon size={24} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            Platform Overview
          </h2>
          <Button variant="minimal" size="sm">
            <AnalyticsIcon size={16} />
            View Details
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="glass rounded-2xl p-6 border border-white/20 shadow-soft hover:shadow-medium transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-500 text-sm font-medium mb-2">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-lg ${
                      stat.changeType === 'increase' 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-red-600 bg-red-50'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl shadow-soft group-hover:scale-110 transition-transform duration-300 ${
                  stat.color === 'blue' ? 'gradient-primary' :
                  stat.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  stat.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-violet-500' :
                  stat.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                  stat.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                  'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}>
                  <stat.icon size={20} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Charts Section */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-6">
          Analytics & Trends
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/20 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
                <p className="text-gray-500 text-sm">Monthly user registrations</p>
              </div>
              <div className="p-2 gradient-primary rounded-lg">
                <UsersIcon size={20} className="text-white" />
              </div>
            </div>
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
              <div className="text-center">
                <AnalyticsIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p>Chart component placeholder</p>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6 border border-white/20 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <p className="text-gray-500 text-sm">Monthly revenue breakdown</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <MoneyIcon size={20} className="text-white" />
              </div>
            </div>
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
              <div className="text-center">
                <TrendingIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p>Chart component placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Activity and Actions */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-6">
          Recent Activity & Quick Actions
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 glass rounded-2xl border border-white/20 shadow-soft">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Button variant="minimal" size="sm">
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 hover:bg-white/60 transition-all duration-200 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-medium">
                      {activity.type.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                    <div className={`status-badge ${
                      activity.status === 'success' ? 'status-badge-success' :
                      activity.status === 'error' ? 'status-badge-error' :
                      activity.status === 'warning' ? 'status-badge-warning' :
                      'status-badge-primary'
                    }`}>
                      <CheckIcon size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-2xl border border-white/20 shadow-soft">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Button variant="minimal" className="w-full justify-start" size="lg">
                  <UsersIcon size={18} />
                  Manage Users
                </Button>
                <Button variant="minimal" className="w-full justify-start" size="lg">
                  <CompanyIcon size={18} />
                  Review Companies
                </Button>
                <Button variant="minimal" className="w-full justify-start" size="lg">
                  <ProductIcon size={18} />
                  Approve Products
                </Button>
                <Button variant="minimal" className="w-full justify-start" size="lg">
                  <ServiceIcon size={18} />
                  Check Services
                </Button>
                <Button variant="minimal" className="w-full justify-start" size="lg">
                  <SettingsIcon size={18} />
                  System Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern System Health */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-6">
          System Health & Performance
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/20 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 gradient-primary rounded-lg">
                <SystemIcon size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">System Metrics</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-gray-600 font-medium">Server Uptime</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-green-600 font-semibold">99.9%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-gray-600 font-medium">API Response</span>
                <span className="text-blue-600 font-semibold">125ms</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-gray-600 font-medium">Active Sessions</span>
                <span className="text-purple-600 font-semibold">2,453</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-gray-600 font-medium">Storage Used</span>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                  </div>
                  <span className="text-orange-600 font-semibold">67%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/20 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <TrendingIcon size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-gray-600 font-medium">Most Viewed Product</span>
                <div className="status-badge status-badge-primary">Industrial Pump</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-gray-600 font-medium">Top Service Provider</span>
                <div className="status-badge status-badge-success">TechOil Ltd</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-gray-600 font-medium">Most Active User</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">JS</div>
                  <div className="status-badge status-badge-outline">John Smith</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-gray-600 font-medium">Trending Category</span>
                <div className="status-badge status-badge-warning">Equipment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
