import React from "react";
import clsx from "clsx";

const base = "relative inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 select-none";

const sizes = {
  xs: "h-7 px-2.5 text-xs",
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
  xl: "h-12 px-8 text-base",
};

const variants = {
  primary: "bg-primary-500 text-dark hover:bg-custom_yellow focus-visible:ring-primary-500/40",
  secondary: "border border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-300",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-300",
  outline: "border border-primary-300 bg-white text-dark hover:bg-primary-50 focus-visible:ring-primary-500/40",
  success: "bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500/40",
  warning: "bg-warning-500 text-gray-950 hover:bg-warning-600 focus-visible:ring-warning-500/40",
  danger: "bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500/40",
  glass: "border border-gray-200 bg-white/90 text-gray-800 hover:bg-white focus-visible:ring-gray-300",
  minimal: "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-300",
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
