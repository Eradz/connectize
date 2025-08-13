import React from "react";
import { Avatar } from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";

const RecentActivityCard = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "user_registration":
        return "👤";
      case "company_verification":
        return "🏢";
      case "product_approval":
        return "📦";
      case "service_posting":
        return "🔧";
      case "user_report":
        return "⚠️";
      default:
        return "📋";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "user_registration":
        return "text-blue-600";
      case "company_verification":
        return "text-green-600";
      case "product_approval":
        return "text-purple-600";
      case "service_posting":
        return "text-orange-600";
      case "user_report":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {activity.avatar ? (
                <Avatar src={activity.avatar} size="sm" />
              ) : (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                  {getActivityIcon(activity.type)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
            <div className="flex-shrink-0">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  activity.type === "user_report"
                    ? "bg-red-400"
                    : "bg-green-400"
                }`}
              ></span>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivityCard;
