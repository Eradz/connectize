import {DealIcon} from "../../../icon/deal";
import CardIcon from "../../../icon/CardIcon";
import BriefCaseIcon from "../../../icon/briefCaseIcon"
import DollarSignIcon from "../../../icon/dollarsign"
import StarIcon from "../../../icon/StarIcon"
import { webRoutes } from "../../../lib/webRoutes";
import { Link } from "react-router-dom";

// Trend Up Icon Component
const TrendUpIcon = () => (
  <svg
    width={15}
    height={10}
    viewBox="0 0 15 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.08333 1H13.75M13.75 1V6.66667M13.75 1L8.08333 6.66667L5.25 3.83333L1 8.08333"
      stroke="#495057"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function BusinessHubHeader({dashboardData}) {
  const formatCompactNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const stats = [
    { 
      label: "Total Value", 
      value: formatCompactNumber(dashboardData.analytics.revenue), 
      icon: <DollarSignIcon />, 
      sublabel: `+${dashboardData.analytics.growth}%`,
      bgColor: "bg-[#FFF9E6]",
      showTrend: true
    },
    { 
      label: "Active Room Deals", 
      value: dashboardData.dealRooms.count, 
      icon: <DealIcon />, 
      sublabel: `${dashboardData.dealRooms.data.filter(d => d.status === 'active').length} active`,
      bgColor: "bg-[#FFF9E6]"
    },
    { 
      label: "Active Jobs", 
      value: dashboardData.jobs.count, 
      icon: <BriefCaseIcon />, 
      sublabel: `${dashboardData.jobs.data.filter(j => j.status === 'active').length} open positions`,
      bgColor: "bg-[#FFF9E6]"
    },
    { 
      label: "Featured Ads", 
      value: dashboardData.ads.active, 
      icon: <StarIcon />, 
      sublabel: `${formatCompactNumber(dashboardData.ads.impressions)} views · ${formatCompactNumber(dashboardData.ads.clicks)} clicks`,
      bgColor: "bg-[#FFF9E6]"
    },
  ];

  // MODIFIED ORDER
  const quickActions = [
    { label: "New Deal Room", color: "bg-[#F4D19B]", icon: "+", to: webRoutes.dealRooms }, 
    { label: "Post Opening Jobs", color: "bg-[#95EB99]", icon: "+", to: webRoutes.workforceJobs },
    { label: "Create Profile", color: "bg-[#B1C7FC]", icon: "+", to: webRoutes.profile }, 
    { label: "Get Verified", color: "bg-[#F4D19B]", icon: "+", to: webRoutes.subscriptionDashboard }
  ];

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome To Business Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive Industry Collaboration Platform</p>
        </div>

        {/* QUICK ACTION SECTION - UPDATED */}
        <div className="mb-6">
          {/* Desktop: Quick Action + Buttons on SAME LINE */}
          <div className="hidden md:flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Quick Action</h2>

            <div className="flex gap-3">
              {quickActions.map((action, index) => (
                <Link
                  to={action.to}
                  key={index}
                  className={`${action.color} flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90`}
                >
                  <span className="text-lg font-bold">{action.icon}</span>
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile View (UNCHANGED) */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {quickActions.map((action, index) => (
              <Link
                to={action.to}
                key={index}
                className={`${action.color} flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90`}
              >
                <span className="text-xl font-bold">{action.icon}</span>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <div className={`${stat.bgColor} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <div className="flex items-center gap-1">
                {stat.showTrend && <TrendUpIcon />}
                <p className="text-xs text-gray-400">{stat.sublabel}</p>
              </div>
            </div>
          ))}

          {/* Subscription Card */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 col-span-2 md:col-span-1">
            <div className="bg-[#FFF9E6] w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <CardIcon />
            </div>
            <p className="text-xs text-gray-500 mb-1">Subscription</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-[#FFC000] to-[#FF8400] text-transparent bg-clip-text mb-1">
              Premium
            </p>
            <p className="text-xs text-gray-400">12 Months Plan</p>
          </div>
        </div>

      </div>
    </div>
  );
}
