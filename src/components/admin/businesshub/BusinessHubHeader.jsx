import {DealIcon} from "../../../icon/deal";
import CardIcon from "../../../icon/CardIcon";
import BriefCaseIcon from "../../../icon/briefCaseIcon"
import DollarSignIcon from "../../../icon/dollarsign"
import StarIcon from "../../../icon/StarIcon"
import { webRoutes } from "../../../lib/webRoutes";
import { Link } from "react-router-dom";
import SubscriptionCard from "../../dashboard/SubscriptionCard";
import { Plus } from "lucide-react";
export default function BusinessHubHeader({dashboardData}) {
  const formatCompactNumber = (num) => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
};
  const stats = [
    { label: "Total value", value: formatCompactNumber(dashboardData.analytics.revenue), icon: <DollarSignIcon />, sublabel: `${dashboardData.analytics.growth}%`},
    { label: "Active Room Deals", value: dashboardData.dealRooms.count, icon: <DealIcon />, sublabel: `${dashboardData.dealRooms.data.filter(d => d.status === 'active').length} active` },
    { label: "Active Jobs", value: dashboardData.jobs.count, icon: <BriefCaseIcon />, sublabel: `${dashboardData.jobs.data.filter(j => j.status === 'active').length} open positions` },
    { label: "Featured Ads", value: dashboardData.ads.active, icon: <StarIcon />, sublabel: `${dashboardData.ads.impressions.toLocaleString()} views · ${dashboardData.ads.clicks.toLocaleString()} clicks` },
  ];

  const quickActions = [
    { label: "New Deal Room", color: "bg-[#F5E5B1] hover:bg-[#F5E5B1] w-[50%]", icon: "+", to:webRoutes.dealRooms },
    { label: "Post Opening Jobs", color: "bg-[#95EB99] hover:bg-[#95EB99] w-[50%]", icon: "+", to:webRoutes.workforceJobs },
    { label: "Create Profile", color: "bg-[#B1C7FC] hover:bg-[#B1C7FC] w-[40%]", icon: "+", to:webRoutes.profile },
    { label: "Get Verified", color: "bg-[#FBD796] hover:bg-[#FBD796] w-[40%]", icon: "+", to:webRoutes.subscriptionDashboard }
  ];

  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome To Business Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive Industry Collaboration Platform</p>
        </div>

        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6 w-full">
          <div className="font-bold md:w-[15%]">Quick Action</div>
          <div className="flex flex-wrap md:flex-nowrap w-full gap-3 px-3">
            {quickActions.map((action, index) => (
              <Link
                to={action.to}
                key={index}
                className={`${action.color} flex items-center md:w-full text-center md:px-1 py-[10px] md:py-2 md:text-[14px] rounded-[10px] text-sm font-medium transition-colors ${
                  index === 1 ? 'order-3 md:order-1' :
                  index === 2 ? 'order-2 md:order-2' :
                  index === 3 ? 'order-1 md:order-3' :
                  'order-0 md:order-0'
                }`}
              >
               <Plus className="p-1" />
               <p>{action.label}</p> 
              </Link>
            ))}
          </div>
        </div>

        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`${index === 4 ? "col-span-2 lg:col-span-1" : ""} rounded-lg p-4 border border-gray-200 bg-white`}>
              <span>{stat.icon}</span>
              <div className="flex items-start justify-between mt-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className={ index === 4 ? "bg-gradient-to-r from-[#FFC000] to-[#FF8400] text-transparent bg-clip-text" : "text-gray-900 font-bold"}>{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sublabel}</p>
                </div>
              </div>
            </div>
          ))}
             {/* Subscription Card */}
                    <SubscriptionCard />
        </div>
      </div>
    </div>
  );
}