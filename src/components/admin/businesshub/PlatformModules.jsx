export default function PlatformModules() {
  const modules = [
    {
      icon: "📁",
      title: "Deal Rooms",
      description: "Manage deal flow with partners",
      link: "12 deal rooms",
      bgColor: "bg-yellow-50",
      iconBg: "bg-yellow-100"
    },
    {
      icon: "👥",
      title: "Work Force",
      description: "Manage and deploy skilled professionals",
      link: "8 AI Services",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100"
    },
    {
      icon: "✨",
      title: "AI Services",
      description: "Intelligent solutions for your business",
      link: "16 AI Services",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100"
    },
    {
      icon: "📦",
      title: "Logistics Hub",
      description: "Supply chain and freight management",
      link: "5 registrants",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100"
    },
    {
      icon: "📢",
      title: "Featured Ads",
      description: "Showcase your business listings",
      link: "3 Active",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100"
    },
    {
      icon: "📋",
      title: "Subscription",
      description: "Manage subscription plans and billing",
      link: "Settings",
      bgColor: "bg-indigo-50",
      iconBg: "bg-indigo-100"
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Modules</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, index) => (
          <div
            key={index}
            className={`${module.bgColor} rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-100`}
          >
            <div className={`${module.iconBg} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3`}>
              {module.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
            <p className="text-xs text-gray-500 mb-3">{module.description}</p>
            <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              {module.link} →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}