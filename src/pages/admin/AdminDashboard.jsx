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
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-8 shadow-strong">
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white" fillOpacity="0.1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
        </div>
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3 font-display">
                Welcome back, Admin! 👋
              </h1>
              <p className="text-primary-100 text-lg max-w-2xl leading-relaxed">
                Here's what's happening with your platform today. Monitor performance, manage users, and drive growth.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Badge variant="glass" size="md" className="text-white border-white/20">
                  <ClockIcon className="w-4 h-4" />
                  Last updated: 2 min ago
                </Badge>
                <Badge variant="glass" size="md" className="text-white border-white/20">
                  <ShieldCheckIcon className="w-4 h-4" />
                  All systems operational
                </Badge>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="text-right text-white">
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-primary-200 text-sm">Uptime</div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingUpIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Platform Overview
          </h2>
          <Button variant="outline" size="sm">
            <ChartBarIcon className="w-4 h-4" />
            View Details
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} variant="gradient" />
          ))}
        </div>
      </div>

      {/* Charts and Analytics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display mb-6">
          Analytics & Trends
        </h2>
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
      </div>

      {/* Activity and Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display mb-6">
          Recent Activity & Quick Actions
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - spans 2 columns */}
          <div className="lg:col-span-2">
            <Card variant="glass" padding="none">
              <CardHeader variant="glass">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent padding="sm">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                      <Avatar 
                        src={activity.avatar} 
                        alt={activity.type} 
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                      <Badge 
                        variant={activity.status} 
                        size="xs"
                        dot
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActionsCard />
          </div>
        </div>
      </div>

      {/* Platform Health & Performance */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display mb-6">
          Platform Health & Performance
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="gradient" color="blue">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <ServerIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Health
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Server Uptime</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
                    <span className="text-success-600 dark:text-success-400 font-semibold">99.9%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">API Response Time</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">125ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Sessions</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">2,453</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Storage Used</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-warning-500 rounded-full"></div>
                    </div>
                    <span className="text-warning-600 dark:text-warning-400 font-semibold">67%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" color="green">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40">
                  <GlobeAltIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Performers
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Most Viewed Product</span>
                  <Badge variant="primary" size="sm">Industrial Pump</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Top Service Provider</span>
                  <Badge variant="success" size="sm">TechOil Ltd</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Most Active User</span>
                  <div className="flex items-center gap-2">
                    <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=john" size="xs" />
                    <Badge variant="outline" size="sm">John Smith</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Trending Category</span>
                  <Badge variant="warning" size="sm">Equipment</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
