import React from "react";
import clsx from "clsx";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

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
      bg: "bg-blue-100 dark:bg-blue-900/20",
      icon: "text-blue-600 dark:text-blue-400",
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900/20",
      icon: "text-green-600 dark:text-green-400",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/20",
      icon: "text-purple-600 dark:text-purple-400",
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-900/20",
      icon: "text-orange-600 dark:text-orange-400",
    },
    emerald: {
      bg: "bg-emerald-100 dark:bg-emerald-900/20",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
    indigo: {
      bg: "bg-indigo-100 dark:bg-indigo-900/20",
      icon: "text-indigo-600 dark:text-indigo-400",
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white dark:bg-gray-800/50 p-5 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <div
          className={clsx(
            "p-3 rounded-full",
            selectedColor.bg
          )}
        >
          <Icon className={clsx("h-6 w-6", selectedColor.icon)} />
        </div>
      </div>
      {change && (
        <p
          className={clsx(
            "text-sm font-medium mt-2 flex items-center",
            changeType === "increase"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {changeType === "increase" ? (
            <ArrowUpIcon className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 mr-1" />
          )}
          <span>{change} from last month</span>
        </p>
      )}
    </div>
  );
};

export default StatsCard;
