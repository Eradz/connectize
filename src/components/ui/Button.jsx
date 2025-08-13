import React from "react";
import clsx from "clsx";

const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none relative overflow-hidden group";

const sizes = {
  xs: "h-7 px-2.5 text-xs",
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
  xl: "h-12 px-8 text-base",
};

const variants = {
  primary: "bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 focus:ring-primary-500 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5 active:translate-y-0",
  secondary: "border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700/80 focus:ring-gray-300 dark:focus:ring-gray-600 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5 active:translate-y-0",
  ghost: "bg-transparent hover:bg-gray-100/80 dark:hover:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:ring-gray-300 dark:focus:ring-gray-600 backdrop-blur-sm",
  outline: "border-2 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500",
  success: "bg-gradient-to-r from-success-600 to-success-500 text-white hover:from-success-700 hover:to-success-600 focus:ring-success-500 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5 active:translate-y-0",
  warning: "bg-gradient-to-r from-warning-600 to-warning-500 text-white hover:from-warning-700 hover:to-warning-600 focus:ring-warning-500 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5 active:translate-y-0",
  danger: "bg-gradient-to-r from-error-600 to-error-500 text-white hover:from-error-700 hover:to-error-600 focus:ring-error-500 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5 active:translate-y-0",
  glass: "glass backdrop-blur-md border-white/20 text-gray-900 dark:text-white hover:bg-white/30 dark:hover:bg-black/30 shadow-soft hover:shadow-medium",
};

const Button = ({ 
  as: Tag = "button", 
  variant = "primary", 
  size = "md", 
  className = "", 
  children,
  loading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props 
}) => {
  return (
    <Tag 
      className={clsx(
        base, 
        sizes[size], 
        variants[variant], 
        loading && "cursor-not-allowed",
        className
      )} 
      disabled={loading || props.disabled}
      {...props}
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 group-hover:animate-shimmer transition-opacity duration-700" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className={clsx("flex items-center gap-2", loading && "opacity-0")}>
        {LeftIcon && <LeftIcon className="w-4 h-4" />}
        {children}
        {RightIcon && <RightIcon className="w-4 h-4" />}
      </div>
    </Tag>
  );
};

export default Button;
