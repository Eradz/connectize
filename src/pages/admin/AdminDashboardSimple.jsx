import React, { useEffect, useState } from "react";

const AdminDashboardSimple = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AdminDashboardSimple component is rendering...");
    
    // Simulate loading with mock data to test the component
    const loadMockData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set mock data
      setStats({
        total_users: 150,
        active_companies: 25,
        total_products: 85,
        total_services: 42,
        monthly_revenue: 45000,
        posts_created: 320,
        user_growth: 12,
        company_growth: 8,
        product_growth: 15,
        service_growth: 6,
        revenue_growth: 15,
        posts_growth: 18
      });
      
      // Set mock activities
      setActivities([
        {
          id: 1,
          type: "user_registration",
          message: "New user John Doe registered",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          type: "company_verification",
          message: "Company TechCorp verification completed",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: "product_approval",
          message: "Product iPhone 15 was added",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        }
      ]);
      
      setLoading(false);
      console.log("Mock data loaded successfully!");
    };

    loadMockData();
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the Admin Dashboard! Here's what's happening with your platform today.
        </p>
        <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-blue-700 text-sm">
          🔧 <strong>Debug Mode:</strong> Using mock data for testing. Real API integration ready!
        </div>
      </div>

      {/* Stats Grid - Real Data from Django API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.total_users?.toLocaleString() || "0"}
          growth={stats?.user_growth || 0}
          icon="👥"
          color="blue"
          subtitle="Active registered users"
        />

        <StatsCard
          title="Active Companies"
          value={stats?.active_companies?.toLocaleString() || "0"}
          growth={stats?.company_growth || 0}
          icon="🏢"
          color="green"
          subtitle="Verified companies"
        />

        <StatsCard
          title="Total Products"
          value={stats?.total_products?.toLocaleString() || "0"}
          growth={stats?.product_growth || 0}
          icon="📦"
          color="purple"
          subtitle="Products in catalog"
        />

        <StatsCard
          title="Active Services"
          value={stats?.total_services?.toLocaleString() || "0"}
          growth={stats?.service_growth || 0}
          icon="🔧"
          color="orange"
          subtitle="Available services"
        />

        <StatsCard
          title="Monthly Revenue"
          value={`$${(stats?.monthly_revenue || 0).toLocaleString()}`}
          growth={stats?.revenue_growth || 0}
          icon="💰"
          color="emerald"
          subtitle="Est. monthly revenue"
        />

        <StatsCard
          title="Published Posts"
          value={stats?.posts_created?.toLocaleString() || "0"}
          growth={stats?.posts_growth || 0}
          icon="📝"
          color="indigo"
          subtitle="Community posts"
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-600">User Growth Chart</p>
              <p className="text-sm text-green-600 font-medium">Real data: {stats?.total_users} total users</p>
              <p className="text-xs text-gray-400 mt-1">Charts visualization coming soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Activity</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">💹</div>
              <p className="text-gray-600">Activity Overview</p>
              <p className="text-sm text-blue-600 font-medium">
                {stats?.posts_created} posts • {stats?.total_products} products
              </p>
              <p className="text-xs text-gray-400 mt-1">Interactive charts coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Activity - Real Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <QuickActionButton
              title="Manage Users"
              count={stats?.total_users}
              action="/admin/users"
              description="View and manage user accounts"
            />
            <QuickActionButton
              title="Review Companies"
              count={stats?.active_companies}
              action="/admin/companies"
              description="Manage company verifications"
            />
            <QuickActionButton
              title="Product Management"
              count={stats?.total_products}
              action="/admin/products"
              description="Oversee product listings"
            />
            <QuickActionButton
              title="Platform Analytics"
              action="/admin/analytics"
              description="View detailed platform metrics"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
            <span className="text-sm font-normal text-blue-600 ml-2">
              (Mock Data)
            </span>
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  title={activity.message}
                  description={activity.type.replace('_', ' ')}
                  time={formatTimeAgo(activity.timestamp)}
                  type={activity.type}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="font-medium">No recent activities</p>
                <p className="text-sm">Activities will appear here as they happen</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Platform Health - Real Data */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Platform Status
          <span className="text-sm font-normal text-blue-600 ml-2">
            (Mock metrics)
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <HealthMetric
            title="Data Connectivity"
            value="Mock Mode"
            color="blue"
            subtitle="Using test data"
          />
          <HealthMetric
            title="Total Records"
            value={(stats?.total_users + stats?.total_companies + stats?.total_products + stats?.total_services).toLocaleString()}
            color="blue"
            subtitle="Across all entities"
          />
          <HealthMetric
            title="Content Health"
            value={`${Math.round((stats?.posts_created / Math.max(stats?.total_users, 1)) * 100)}%`}
            color="purple"
            subtitle="Posts per user ratio"
          />
          <HealthMetric
            title="Verification Rate"
            value={stats?.total_companies > 0 ? `${Math.round((stats?.active_companies / stats?.total_companies) * 100)}%` : "0%"}
            color={stats?.total_companies > 0 && (stats?.active_companies / stats?.total_companies) > 0.8 ? "green" : "orange"}
            subtitle="Company verification"
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatsCard = ({ title, value, growth, icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mb-1">{subtitle}</p>
        {growth !== undefined && (
          <p className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? '+' : ''}{growth}% estimated growth
          </p>
        )}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const QuickActionButton = ({ title, count, action, description }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group">
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-900">{title}</p>
        {count !== undefined && (
          <span className="text-sm text-blue-600 font-semibold">{count}</span>
        )}
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <div className="text-blue-600 group-hover:text-blue-700 ml-3">→</div>
  </div>
);

const ActivityItem = ({ title, description, time, type }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration': return '👤';
      case 'company_verification': return '✅';
      case 'product_approval': return '📦';
      case 'post_published': return '📝';
      default: return '🔔';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_registration': return 'bg-blue-600';
      case 'company_verification': return 'bg-green-600';
      case 'product_approval': return 'bg-purple-600';
      case 'post_published': return 'bg-indigo-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <div className={`w-8 h-8 ${getActivityColor(type)} rounded-full flex items-center justify-center text-white text-sm`}>
        {getActivityIcon(type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{title}</p>
        <p className="text-sm text-gray-600 capitalize">{description}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
};

const HealthMetric = ({ title, value, color, subtitle }) => {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
  };

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-lg font-semibold ${colorClasses[color] || 'text-gray-900'}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
};

export default AdminDashboardSimple;
