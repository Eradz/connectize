import React from "react";
import clsx from "clsx";

const StatsCard = ({
  title,
  value,
  change,
  changeType = "increase",
  icon: Icon,
  color = "blue",
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      border: "border-green-200",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      border: "border-purple-200",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      border: "border-orange-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      border: "border-emerald-200",
    },
    indigo: {
      bg: "bg-indigo-50",
      icon: "text-indigo-600",
      border: "border-indigo-200",
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={clsx(
                "text-sm font-medium mt-1",
                changeType === "increase"
                  ? "text-green-600"
                  : changeType === "decrease"
                  ? "text-red-600"
                  : "text-gray-600"
              )}
            >
              {changeType === "increase" && "↗ "}
              {changeType === "decrease" && "↘ "}
              {change} from last month
            </p>
          )}
        </div>
        <div
          className={clsx(
            "p-3 rounded-lg",
            selectedColor.bg,
            selectedColor.border,
            "border"
          )}
        >
          <Icon className={clsx("h-6 w-6", selectedColor.icon)} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
