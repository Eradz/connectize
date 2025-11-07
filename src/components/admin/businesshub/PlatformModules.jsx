import {DealIcon} from "../../../icon/deal";
import StarIcon from "../../../icon/StarIcon";
import CardIcon from "../../../icon/CardIcon";
import LogisticIcon from "../../../icon/LogisticIcon";
import AIIcon from "../../../icon/AIIcon";
import WorkForceIcon from "../../../icon/WorkForceIcon";

export default function PlatformModules() {
  const modules = [
    {
      icon: <DealIcon/>,
      title: "Deal Rooms",
      description: "Secure collaboration spaces for M&A and partnerships",
      link: "0 active",
      bgColor: "bg-yellow-50",
    },
    {
      icon: <WorkForceIcon/>,
      title: "Work Force",
      description: "Professional marketplace and talent acquisition",
      link: "24 positions",
      bgColor: "bg-blue-50",
    },
    {
      icon: <AIIcon/>,
      title: "AI Services",
      description: "Intelligent matching and market insights",
      link: "1 opportunity",
      bgColor: "bg-purple-50",
    },
    {
      icon: <LogisticIcon/>,
      title: "Logistics Hub",
      description: "Supply chain and transportation management",
      link: "Global network",
      bgColor: "bg-green-50",
    },
    {
      icon: <StarIcon/>,
      title: "Featured Ads",
      description: "Promote your content across the platform",
      link: "0 Active",
      bgColor: "bg-orange-50",
    },
    {
      icon: <CardIcon/>,
      title: "Subscription",
      description: "Manage your plans, billings and account settings",
      link: "Manage plan",
      bgColor: "bg-indigo-50",
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Modules</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, index) => (
          <div
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
          </div>
        ))}
      </div>
    </div>
  );
}