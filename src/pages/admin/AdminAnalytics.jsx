import React, { useState, useMemo } from "react";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CubeIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import StatsCard from "../../components/admin/dashboard/StatsCard";
import ChartCard from "../../components/admin/dashboard/ChartCard";
import PageHeader from "../../components/admin/PageHeader";
import { useTheme } from "../../context/ThemeContext";

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState("30d");
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Mock data - replace with real API calls
  const stats = [
    { title: "Total Users", value: "12,453", change: "+12%", changeType: "increase", icon: UsersIcon, color: "blue" },
    { title: "User Growth Rate", value: "8.2%", change: "+2.1%", changeType: "increase", icon: ArrowUpIcon, color: "green" },
    { title: "Verified Companies", value: "1,234", change: "+8%", changeType: "increase", icon: BuildingOfficeIcon, color: "purple" },
    { title: "Active Companies", value: "95.6%", change: "+1.2%", changeType: "increase", icon: ChartBarIcon, color: "emerald" },
    { title: "Products Listed", value: "5,678", change: "+15%", changeType: "increase", icon: CubeIcon, color: "orange" },
    { title: "Content Published", value: "8,901", change: "+18%", changeType: "increase", icon: DocumentTextIcon, color: "indigo" },
  ];

  const chartData = useMemo(() => {
    const basePrimaryColor = isDarkMode ? '96, 165, 250' : '59, 130, 246'; // blue-400, blue-500
    const baseSecondaryColor = isDarkMode ? '74, 222, 128' : '34, 197, 94'; // green-400, green-500
    const baseTertiaryColor = isDarkMode ? '192, 132, 252' : '168, 85, 247'; // purple-400, purple-500
    const baseWarningColor = isDarkMode ? '251, 191, 36' : '245, 158, 11'; // amber-400, amber-600

    return {
      userGrowth: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          { label: "New Users", data: [1200, 1900, 3000, 5000, 4200, 6200], borderColor: `rgb(${basePrimaryColor})`, backgroundColor: `rgba(${basePrimaryColor}, 0.2)`, tension: 0.4, fill: true },
          { label: "Active Users", data: [800, 1200, 2100, 3800, 3200, 4800], borderColor: `rgb(${baseSecondaryColor})`, backgroundColor: `rgba(${baseSecondaryColor}, 0.2)`, tension: 0.4, fill: true },
        ],
      },
      revenue: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{ label: "Revenue ($)", data: [12000, 19000, 30000, 50000, 42000, 62000], backgroundColor: `rgba(${baseSecondaryColor}, 0.8)`, borderColor: `rgb(${baseSecondaryColor})`, borderWidth: 1 }],
      },
      contentDistribution: {
        labels: ["Products", "Services", "Posts", "Documents"],
        datasets: [{ data: [40, 30, 25, 5], backgroundColor: [`rgba(${basePrimaryColor}, 0.8)`, `rgba(${baseSecondaryColor}, 0.8)`, `rgba(${baseTertiaryColor}, 0.8)`, `rgba(${baseWarningColor}, 0.8)`], borderWidth: 0 }],
      },
    };
  }, [isDarkMode]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Comprehensive insights into your platform performance."
        actions={
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-auto">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => <StatsCard key={index} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ChartCard title="User Growth Trends" subtitle="New vs Active users over time" type="line" data={chartData.userGrowth} />
        </div>
        <div className="lg:col-span-2">
          <ChartCard title="Revenue Analytics" subtitle="Monthly revenue breakdown" type="bar" data={chartData.revenue} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Content Distribution" subtitle="Platform content breakdown" type="doughnut" data={chartData.contentDistribution} />
        
        <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Platform Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {[
              { label: "Avg. Session Duration", value: "8m 32s", color: "text-blue-600 dark:text-blue-400" },
              { label: "API Response Time", value: "125ms", color: "text-blue-600 dark:text-blue-400" },
              { label: "Page Views / Session", value: "4.2", color: "text-green-600 dark:text-green-400" },
              { label: "Error Rate", value: "0.12%", color: "text-red-600 dark:text-red-400" },
              { label: "Bounce Rate", value: "23.5%", color: "text-orange-600 dark:text-orange-400" },
              { label: "Server Uptime", value: "99.98%", color: "text-green-600 dark:text-green-400" },
              { label: "Conversion Rate", value: "3.8%", color: "text-purple-600 dark:text-purple-400" },
              { label: "Cache Hit Rate", value: "94.2%", color: "text-purple-600 dark:text-purple-400" },
            ].map(metric => (
              <div key={metric.label} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                <span className={`font-semibold ${metric.color}`}>{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Performing Content</h3>
          <div className="space-y-3">
            {[
              { title: "Industrial Pump Model X200", views: 2453, type: "Product" },
              { title: "Equipment Maintenance Service", views: 1876, type: "Service" },
              { title: "Oil & Gas Industry Trends", views: 1654, type: "Post" },
              { title: "Safety Equipment Guide", views: 1432, type: "Document" },
              { title: "Pipeline Inspection Tools", views: 1298, type: "Product" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{item.views.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">User Engagement</h3>
          <div className="space-y-4">
            {[
              { label: "Daily Active Users", value: "3,245", trend: "increase", color: "text-green-600 dark:text-green-400" },
              { label: "Weekly Active Users", value: "8,934", trend: "increase", color: "text-blue-600 dark:text-blue-400" },
              { label: "Monthly Active Users", value: "12,453", trend: "increase", color: "text-purple-600 dark:text-purple-400" },
              { label: "User Retention Rate", value: "76.8%", trend: "decrease", color: "text-orange-600 dark:text-orange-400" },
              { label: "New Users Today", value: "234", trend: "increase", color: "text-green-600 dark:text-green-400" },
            ].map(metric => (
              <div key={metric.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${metric.color}`}>{metric.value}</span>
                  {metric.trend === 'increase' ? <ArrowUpIcon className={`h-4 w-4 ${metric.color}`} /> : <ArrowDownIcon className={`h-4 w-4 ${metric.color}`} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Export Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Download detailed analytics reports for offline analysis.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" icon={ArrowDownTrayIcon}>Export PDF</Button>
            <Button variant="primary" icon={ClockIcon}>Schedule Report</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
