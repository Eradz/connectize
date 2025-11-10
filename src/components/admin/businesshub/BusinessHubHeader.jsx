import DealIcon from "../../../icon/deal";
import CardIcon from "../../../icon/CardIcon";
import BriefCaseIcon from "../../../icon/briefCaseIcon"
import DollarSignIcon from "../../../icon/dollarsign"
import StarIcon from "../../../icon/StarIcon"
export default function BusinessHubHeader() {
  const stats = [
    { label: "Total value", value: "12,000", icon: <DollarSignIcon />, sublabel: "3 Active" },
    { label: "Active Room Deals", value: "12", icon: <DealIcon />, sublabel: "3 Active" },
    { label: "Active Jobs", value: "30", icon: <BriefCaseIcon />, sublabel: "12 Opening Position" },
    { label: "Featured Ads", value: "10", icon: <StarIcon />, sublabel: "3 Active" },
    { label: "Subscription", value: "Premium", icon: <CardIcon />, sublabel: "3 Active" }
  ];

  const quickActions = [
    { label: "New Deal Room", color: "bg-[#F5E5B1] hover:bg-[#F5E5B1] w-[50%]", icon: "+" },
    { label: "Post Opening Jobs", color: "bg-[#95EB99] hover:bg-[#95EB99] w-[50%]", icon: "+" },
    { label: "Create Profile", color: "bg-[#B1C7FC] hover:bg-[#B1C7FC] w-[40%]", icon: "+" },
    { label: "Get Verified", color: "bg-[#FBD796] hover:bg-[#FBD796] w-[40%]", icon: "+" }
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
              <button
                key={index}
                className={`${action.color} md:w-full text-center md:px-1 py-[10px] md:py-[4px] md:text-[14px] rounded-[10px] text-sm font-medium transition-colors ${
                  index === 1 ? 'order-3 md:order-1' :
                  index === 2 ? 'order-2 md:order-2' :
                  index === 3 ? 'order-1 md:order-3' :
                  'order-0 md:order-0'
                }`}
              >
                <span className="font-bold text-[24px] pr-4">{action.icon}</span>
                {action.label}
              </button>
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
                  <p className={ index === 4 ? "bg-gradient-to-r from-[#FFC000] to-[#FF8400] text-transparent bg-clip-text" : "text-gray-900" + "text-[32px] font-medium "}>{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sublabel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}