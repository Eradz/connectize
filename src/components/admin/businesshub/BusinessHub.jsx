export default function BusinessHubHeader() {
  const stats = [
    { label: "Total Deal Rooms", value: "12,000", sublabel: "124 deal rooms" },
    { label: "Total Work Force", value: "12", sublabel: "8 skilled professionals" },
    { label: "Total AI Services", value: "30", sublabel: "16 AI Services" },
    { label: "Total Subscription", value: "16", sublabel: "5 Premium Plans" }
  ];

  const quickActions = [
    { label: "New Deal Room", color: "bg-yellow-400 hover:bg-yellow-500", icon: "➕" },
    { label: "Post Ongoing Jobs", color: "bg-green-500 hover:bg-green-600", icon: "📋" },
    { label: "Create Profile", color: "bg-blue-500 hover:bg-blue-600", icon: "👤" },
    { label: "Get Verified", color: "bg-orange-500 hover:bg-orange-600", icon: "✓" }
  ];

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome To Business Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive Industry Collaboration Platform</p>
        </div>

        
        <div className="flex flex-wrap gap-3 mb-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sublabel}</p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}