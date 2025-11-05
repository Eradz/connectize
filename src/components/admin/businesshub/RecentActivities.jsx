export default function RecentActivities() {
  const activities = [
    { text: "Massive Toilet Export deal...", time: "2 mins ago", icon: "📄" },
    { text: "New user joined the deal", time: "5 mins ago", icon: "👤" },
    { text: "Massive completed sheet of purchase", time: "10 mins ago", icon: "✅" },
    { text: "Draft email changed to Approved", time: "15 mins ago", icon: "✉️" },
    { text: "New contract details uploaded", time: "20 mins ago", icon: "📎" },
    { text: "New participant added to the deal", time: "25 mins ago", icon: "➕" },
    { text: "New participant added to the deal", time: "30 mins ago", icon: "➕" },
    { text: "New participant added to the deal", time: "35 mins ago", icon: "➕" }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{activity.text}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}