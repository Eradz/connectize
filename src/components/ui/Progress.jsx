import React from "react";
import clsx from "clsx";

const Progress = ({ 
  value = 0, 
  max = 100, 
  size = "md",
  variant = "default",
  showValue = false,
  label,
  className = "",
  animated = false,
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    xs: "h-1",
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
    xl: "h-6",
  };

  const variants = {
    default: {
      bg: "bg-gray-200 dark:bg-gray-700",
      fill: "bg-primary-500",
    },
    success: {
      bg: "bg-gray-200 dark:bg-gray-700",
      fill: "bg-success-600 dark:bg-success-500",
    },
    warning: {
      bg: "bg-gray-200 dark:bg-gray-700",
      fill: "bg-warning-600 dark:bg-warning-500",
    },
    error: {
      bg: "bg-gray-200 dark:bg-gray-700",
      fill: "bg-error-600 dark:bg-error-500",
    },
    gradient: {
      bg: "bg-gray-200 dark:bg-gray-700",
      fill: "bg-primary-500",
    },
  };

  const selectedVariant = variants[variant];

  return (
    <div className={clsx("w-full", className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div 
        className={clsx(
          "w-full rounded-full overflow-hidden",
          sizes[size],
          selectedVariant.bg
        )}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-300 ease-out",
            selectedVariant.fill,
            animated && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const CircularProgress = ({ 
  value = 0, 
  max = 100, 
  size = "md",
  variant = "default",
  showValue = false,
  strokeWidth = 4,
  className = "",
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    xs: 32,
    sm: 40,
    md: 48,
    lg: 64,
    xl: 80,
    "2xl": 96,
  };

  const variants = {
    default: "stroke-primary-500",
    success: "stroke-success-600 dark:stroke-success-500",
    warning: "stroke-warning-600 dark:stroke-warning-500",
    error: "stroke-error-600 dark:stroke-error-500",
  };

  const dimension = sizes[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={clsx("relative inline-flex items-center justify-center", className)} {...props}>
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={clsx(
            "transition-all duration-300 ease-out",
            variants[variant]
          )}
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

export { Progress as default, CircularProgress };
