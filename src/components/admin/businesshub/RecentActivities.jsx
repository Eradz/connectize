import { User2Icon } from "lucide-react";

export default function RecentActivities({dashboardData}) {

    const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden h-[510px]">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 hidden md:flex">Recent Activities</h2>
      
      <div className="space-y-4">
        {dashboardData.activities.data.slice(0, 5).map((activity, index) => (
          <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User2Icon/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{getTimeAgo(activity.timestamp)}</p>
            </div>
          </div>
        ))}
        {dashboardData.activities.data.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No recent activities</p>
        )}
      </div>
    </div>
  );
}