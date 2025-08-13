import React from "react";
import clsx from "clsx";

const Card = ({ 
  className = "", 
  children, 
  variant = "default",
  hover = true,
  padding = "default",
  ...props 
}) => {
  const variants = {
    default: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-soft",
    glass: "glass backdrop-blur-md shadow-medium",
    elevated: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-medium",
    flat: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
    gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-soft",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  const cardClasses = clsx(
    "rounded-2xl transition-all duration-300 animate-in",
    variants[variant],
    paddings[padding],
    hover && "hover:shadow-strong hover:-translate-y-1 hover:scale-[1.02]",
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ 
  className = "", 
  children, 
  variant = "default",
  ...props 
}) => {
  const variants = {
    default: "px-6 py-4 border-b border-gray-100 dark:border-gray-800",
    glass: "px-6 py-4 border-b border-white/20 dark:border-gray-700/40",
    elevated: "px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50",
  };

  return (
    <div className={clsx(variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

const CardContent = ({ 
  className = "", 
  children,
  padding = "default",
  ...props 
}) => {
  const paddings = {
    none: "",
    sm: "p-4",
    default: "px-6 py-4",
    lg: "p-8",
  };

  return (
    <div className={clsx(paddings[padding], className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ 
  className = "", 
  children,
  variant = "default",
  ...props 
}) => {
  const variants = {
    default: "px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30",
    glass: "px-6 py-4 border-t border-white/20 dark:border-gray-700/40",
    flat: "px-6 py-4 border-t border-gray-200 dark:border-gray-700",
  };

  return (
    <div className={clsx(variants[variant], "rounded-b-2xl", className)} {...props}>
      {children}
    </div>
  );
};

export { Card as default, CardHeader, CardContent, CardFooter };
