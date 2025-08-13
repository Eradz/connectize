import React from "react";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  BellIcon,
  ChartBarIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const QuickActionsCard = () => {
  const quickActions = [
    {
      title: "Add New User",
      description: "Create a new user account",
      icon: UserPlusIcon,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      path: "/admin/users/create",
    },
    {
      title: "Create Post",
      description: "Publish new content",
      icon: DocumentPlusIcon,
      color: "bg-green-50 text-green-600 border-green-200",
      path: "/admin/content/create",
    },
    {
      title: "Send Notification",
      description: "Broadcast to all users",
      icon: BellIcon,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      path: "/admin/notifications/send",
    },
    {
      title: "View Analytics",
      description: "Platform insights",
      icon: ChartBarIcon,
      color: "bg-orange-50 text-orange-600 border-orange-200",
      path: "/admin/analytics",
    },
    {
      title: "Platform Settings",
      description: "Configure system",
      icon: CogIcon,
      color: "bg-gray-50 text-gray-600 border-gray-200",
      path: "/admin/settings",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="space-y-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.path}
              className="block p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow group"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg border ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link
          to="/admin/help"
          className="block text-center text-sm text-blue-600 hover:text-blue-800"
        >
          Need help? View Documentation →
        </Link>
      </div>
    </div>
  );
};

export default QuickActionsCard;
