import React from "react";
import clsx from "clsx";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from "@heroicons/react/24/outline";

const StatsCard = ({
  title,
  value,
  change,
  changeType = "increase",
  icon: Icon,
  color = "blue",
  variant = "default",
  loading = false,
}) => {
  const colorClasses = {
    blue: {
      bg: "from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30",
      icon: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      border: "border-blue-200/60 dark:border-blue-800/60",
      accent: "bg-blue-500",
    },
    green: {
      bg: "from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30",
      icon: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-900/40",
      border: "border-green-200/60 dark:border-green-800/60",
      accent: "bg-green-500",
    },
    purple: {
      bg: "from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30",
      icon: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/40",
      border: "border-purple-200/60 dark:border-purple-800/60",
      accent: "bg-purple-500",
    },
    orange: {
      bg: "from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30",
      icon: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-100 dark:bg-orange-900/40",
      border: "border-orange-200/60 dark:border-orange-800/60",
      accent: "bg-orange-500",
    },
    emerald: {
      bg: "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30",
      icon: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
      border: "border-emerald-200/60 dark:border-emerald-800/60",
      accent: "bg-emerald-500",
    },
    indigo: {
      bg: "from-indigo-50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/30",
      icon: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
      border: "border-indigo-200/60 dark:border-indigo-800/60",
      accent: "bg-indigo-500",
    },
  };

  const variants = {
    default: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60",
    glass: "glass backdrop-blur-md border-white/20",
    gradient: `bg-gradient-to-br ${colorClasses[color]?.bg} border ${colorClasses[color]?.border}`,
    elevated: "bg-white dark:bg-gray-900 shadow-strong border border-gray-200 dark:border-gray-700",
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  const getTrendIcon = () => {
    switch (changeType) {
      case "increase":
        return <ArrowTrendingUpIcon className="w-4 h-4 text-success-600 dark:text-success-400" />;
      case "decrease":
        return <ArrowTrendingDownIcon className="w-4 h-4 text-error-600 dark:text-error-400" />;
      default:
        return <MinusIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className={clsx(
        "p-6 rounded-2xl transition-all duration-300 animate-pulse",
        variants[variant]
      )}>
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-20"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      "group relative overflow-hidden p-6 rounded-2xl transition-all duration-300 hover:shadow-strong hover:-translate-y-1 hover:scale-[1.02] cursor-pointer animate-fadeIn",
      variants[variant]
    )}>
      {/* Subtle accent line */}
      <div className={clsx("absolute top-0 left-0 w-full h-1 rounded-t-2xl", selectedColor.accent)} />
      
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {value}
            </p>
            {change && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className={clsx(
                  "text-sm font-semibold",
                  changeType === "increase" 
                    ? "text-success-600 dark:text-success-400"
                    : changeType === "decrease"
                    ? "text-error-600 dark:text-error-400"
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            vs last month
          </p>
        </div>
        
        <div className={clsx(
          "flex-shrink-0 p-3 rounded-xl shadow-soft transition-all duration-200 group-hover:scale-110 group-hover:shadow-medium",
          selectedColor.iconBg,
          selectedColor.border,
          "border"
        )}>
          {Icon && <Icon className={clsx("h-6 w-6", selectedColor.icon)} />}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
