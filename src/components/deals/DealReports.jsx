import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

const ReportCard = ({ title, value, subtitle, icon, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "border-blue-200 bg-blue-50 text-blue-600",
    green: "border-green-200 bg-green-50 text-green-600", 
    purple: "border-purple-200 bg-purple-50 text-purple-600",
    orange: "border-orange-200 bg-orange-50 text-orange-600",
    red: "border-red-200 bg-red-50 text-red-600"
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all duration-200 hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      {trend && (
        <div className={`text-sm mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.positive ? '↗' : '↘'} {trend.value}
        </div>
      )}
    </div>
  );
};

const ActivityBreakdownChart = ({ activities }) => {
  const activityCounts = activities.reduce((acc, activity) => {
    const type = activity.activity_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(activityCounts).map(([type, count]) => ({
    name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count
  }));

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const ActivityTrendChart = ({ activities }) => {
  // Group activities by date
  const activityByDate = activities.reduce((acc, activity) => {
    try {
      const date = new Date(activity.timestamp).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    } catch (error) {
      return acc;
    }
  }, {});

  // Create data for last 30 days
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last30Days.push({
      date: dateStr,
      activities: activityByDate[dateStr] || 0,
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Trend (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={last30Days}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12 }}
            interval={4}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value) => [value, 'Activities']}
          />
          <Area 
            type="monotone" 
            dataKey="activities" 
            stroke="#3B82F6" 
            fill="#3B82F6"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const ParticipantActivityChart = ({ activities }) => {
  const participantActivity = activities.reduce((acc, activity) => {
    const actor = activity.actor_name || 'Unknown';
    acc[actor] = (acc[actor] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(participantActivity)
    .map(([name, count]) => ({ name, activities: count }))
    .sort((a, b) => b.activities - a.activities)
    .slice(0, 10); // Top 10 most active participants

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Active Participants</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip />
          <Bar dataKey="activities" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DealReports = ({ deal, activities = [], milestones = [], documents = [], participants = [] }) => {
  const [reportType, setReportType] = useState('overview');

  const safeDeal = deal || {};

  // Calculate metrics
  const totalActivities = activities.length || 0;
  const totalMilestones = milestones.length || 0;
  // Robust progress extraction: support alternate field names and strings
  const getProgress = (m) => {
    let raw = m?.progress ?? m?.progress_percent ?? m?.progress_percentage ?? m?.percent_complete ?? m?.percent ?? 0;
    if (typeof raw === 'string') {
      // handle values like "80%" or " 80 % "
      const cleaned = raw.replace(/%/g, '').trim();
      const parsed = parseFloat(cleaned);
      raw = Number.isFinite(parsed) ? parsed : 0;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  };
  const completedMilestones = milestones.filter(m => {
    const status = (m.status || '').toString().toLowerCase();
    const isCompletedStatus = ['completed', 'complete', 'done', 'closed'].includes(status);
    return isCompletedStatus || getProgress(m) >= 100 || m?.is_completed === true;
  }).length || 0;
  // Average progress across all milestones (what users typically expect on a dashboard)
  const avgMilestoneProgress = totalMilestones > 0
    ? Math.round(milestones.reduce((sum, m) => sum + getProgress(m), 0) / totalMilestones)
    : 0;
  // Use average progress for the primary card
  const milestoneProgress = avgMilestoneProgress;
  const documentsUploaded = documents.length || 0;
  const activeParticipants = participants.length || 0;

  // Calculate activity in last 7 days
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const recentActivities = activities.filter(a => {
    try {
      return new Date(a.timestamp) >= last7Days;
    } catch {
      return false;
    }
  }).length;

  // Calculate average activities per day
  const daysSinceCreation = safeDeal.created_at ? 
    Math.max(1, Math.ceil((new Date() - new Date(safeDeal.created_at)) / (1000 * 60 * 60 * 24))) : 1;
  const avgActivitiesPerDay = (totalActivities / daysSinceCreation).toFixed(1);

  const exportReport = (format) => {
    const reportData = {
      dealInfo: {
        title: safeDeal.title || '',
        status: safeDeal.status || '',
        createdAt: safeDeal.created_at || '',
        totalValue: safeDeal.total_value || ''
      },
      metrics: {
        totalActivities,
        completedMilestones,
        totalMilestones,
        milestoneProgress,
        documentsUploaded,
        activeParticipants,
        recentActivities,
        avgActivitiesPerDay
      },
      activities: activities.map(a => ({
        type: a.activity_type,
        description: a.description,
        actor: a.actor_name,
        timestamp: a.timestamp
      }))
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deal-report-${safeDeal.id || 'unknown'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvContent = [
        ['Activity Type', 'Description', 'Actor', 'Timestamp'],
        ...activities.map(a => [a.activity_type, a.description, a.actor_name, a.timestamp])
      ].map(row => row.map(field => `"${field || ''}"`).join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
  a.download = `deal-activities-${safeDeal.id || 'unknown'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Deal Reports & Analytics</h2>
            <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('json')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Export JSON
            </button>
            <button
              onClick={() => exportReport('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="mt-4 flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'activity', label: 'Activity Analysis' },
            { key: 'progress', label: 'Progress Tracking' }
          ].map(type => (
            <button
              key={type.key}
              onClick={() => setReportType(type.key)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                reportType === type.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Dashboard */}
      {reportType === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportCard
            title="Total Activities"
            value={totalActivities}
            subtitle={`${avgActivitiesPerDay} per day avg`}
            icon="📊"
            color="blue"
          />
          <ReportCard
            title="Milestone Progress"
            value={`${milestoneProgress}%`}
            subtitle={`${completedMilestones}/${totalMilestones} completed`}
            icon="🎯"
            color="green"
          />
          <ReportCard
            title="Documents"
            value={documentsUploaded}
            subtitle="Files uploaded"
            icon="📄"
            color="purple"
          />
          <ReportCard
            title="Active Participants"
            value={activeParticipants}
            subtitle="Team members"
            icon="👥"
            color="orange"
          />
        </div>
      )}

      {/* Activity Analysis */}
      {reportType === 'activity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityBreakdownChart activities={activities} />
          <ActivityTrendChart activities={activities} />
          <div className="lg:col-span-2">
            <ParticipantActivityChart activities={activities} />
          </div>
        </div>
      )}

      {/* Progress Tracking */}
      {reportType === 'progress' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReportCard
              title="Recent Activity"
              value={recentActivities}
              subtitle="Last 7 days"
              icon="🔥"
              color="orange"
            />
            <ReportCard
              title="Deal Status"
              value={safeDeal.status?.toUpperCase() || 'ACTIVE'}
              subtitle="Current stage"
              icon="📈"
              color="blue"
            />
            <ReportCard
              title="Days Active"
              value={daysSinceCreation}
              subtitle="Since creation"
              icon="📅"
              color="green"
            />
          </div>

          {/* Milestone Progress Visualization */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestone Progress Overview</h3>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                      <span className="text-sm text-gray-500">{getProgress(milestone)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${getProgress(milestone)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    milestone.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {milestone.status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Stats Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleString()} • 
            <span className="ml-2 text-green-600 font-medium">Live Data</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DealReports;
