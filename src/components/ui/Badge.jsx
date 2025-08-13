import React from "react";
import clsx from "clsx";

const Badge = ({ 
  children, 
  variant = "default", 
  size = "sm",
  className = "",
  icon: Icon,
  dot = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center font-medium transition-all duration-200 select-none";
  
  const sizes = {
    xs: "px-2 py-0.5 text-xs rounded-md gap-1",
    sm: "px-2.5 py-1 text-xs rounded-lg gap-1.5",
    md: "px-3 py-1.5 text-sm rounded-lg gap-2",
    lg: "px-4 py-2 text-sm rounded-xl gap-2",
  };

  const variants = {
    default: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700",
    primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-800",
    secondary: "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
    success: "bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200 hover:bg-success-200 dark:hover:bg-success-900/50 border border-success-200 dark:border-success-800",
    warning: "bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-200 hover:bg-warning-200 dark:hover:bg-warning-900/50 border border-warning-200 dark:border-warning-800",
    error: "bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-200 hover:bg-error-200 dark:hover:bg-error-900/50 border border-error-200 dark:border-error-800",
    outline: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
    glass: "glass backdrop-blur-md text-gray-900 dark:text-white hover:bg-white/30 dark:hover:bg-black/30",
    gradient: "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft hover:shadow-medium hover:from-primary-600 hover:to-primary-700",
    // Legacy support
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  const dotSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4 h-4",
  };

  const badgeClasses = clsx(
    baseStyles,
    sizes[size],
    variants[variant],
    className
  );

  return (
    <span className={badgeClasses} {...props}>
      {dot && (
        <span className={clsx("rounded-full bg-current opacity-60", dotSizes[size])} />
      )}
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </span>
  );
};

export default Badge;
