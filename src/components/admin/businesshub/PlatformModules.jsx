import {DealIcon} from "../../../icon/deal";
import StarIcon from "../../../icon/StarIcon";
import CardIcon from "../../../icon/CardIcon";
import LogisticIcon from "../../../icon/LogisticIcon";
import AIIcon from "../../../icon/AIIcon";
import WorkForceIcon from "../../../icon/WorkForceIcon";
import { webRoutes } from "../../../lib/webRoutes";
import { Link } from "react-router-dom";

export default function PlatformModules({dashboardData}) {
  const modules = [
    {
      icon: <DealIcon/>,
      title: "Deal Rooms",
      description: "Secure collaboration spaces for M&A and partnerships",
      link: `${dashboardData.dealRooms.count} active`,
      bgColor: "bg-yellow-50",
      to: webRoutes.dealRooms
    },
    {
      icon: <WorkForceIcon/>,
      title: "Work Force",
      description: "Professional marketplace and talent acquisition",
      link: `${dashboardData.jobs.count} positions`,
      bgColor: "bg-blue-50",
      to: webRoutes.workforceJobs
    },
    // {
    //   icon: <AIIcon/>,
    //   title: "AI Services",
    //   description: "Intelligent matching and market insights",
    //   link: `${dashboardData.opportunities.count} opportunity`,
    //   bgColor: "bg-purple-50",
    //   to: webRoutes.aiDashboard
    // },
    {
      icon: <LogisticIcon/>,
      title: "Logistics Hub",
      description: "Supply chain and transportation management",
      link: "Global network",
      bgColor: "bg-green-50",
      to: webRoutes.logisticsDashboard
    },
    {
      icon: <StarIcon/>,
      title: "Industrial Events",
      description: "Showcase your industry events and webinars",
      link: `${dashboardData.events.count} Active`,
      bgColor: "bg-orange-50",
      to: webRoutes.workforceEvents
    },
    {
      icon: <CardIcon/>,
      title: "Subscription",
      description: "Manage your plans, billings and account settings",
      link: "Manage plan",
      bgColor: "bg-indigo-50",
      to: webRoutes.subscriptionDashboard
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 hidden md:flex">Platform Modules</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, index) => (
          <Link
            to={module.to}
            key={index}
            className={`rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-[#D9D9D9]`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3`}>
              {module.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
            <p className="text-xs text-gray-500 mb-3">{module.description}</p>
            <p className="text-xs text-[#E5A800] font-medium">
              {module.link}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}