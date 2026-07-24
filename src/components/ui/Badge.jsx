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
  const baseStyles = "inline-flex items-center border font-semibold select-none";
  
  const sizes = {
    xs: "px-2 py-0.5 text-xs rounded-md gap-1",
    sm: "px-2.5 py-1 text-xs rounded-lg gap-1.5",
    md: "px-3 py-1.5 text-sm rounded-lg gap-2",
    lg: "px-4 py-2 text-sm rounded-xl gap-2",
  };

  const variants = {
    default: "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200",
    primary: "border-primary-200 bg-primary-50 text-primary-800",
    secondary: "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    error: "border-red-200 bg-red-50 text-red-700",
    outline: "border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-transparent dark:text-gray-300",
    glass: "border-gray-200 bg-white/90 text-gray-800",
    gradient: "border-primary-200 bg-primary-50 text-primary-800",
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-primary-200 bg-primary-50 text-primary-800",
    inactive: "border-gray-200 bg-gray-100 text-gray-600",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    // Legacy support
    gray: "border-gray-200 bg-gray-100 text-gray-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    yellow: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
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
