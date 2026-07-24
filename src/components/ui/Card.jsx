import React from "react";
import clsx from "clsx";

const Card = ({ 
  className = "", 
  children, 
  variant = "default",
  hover = false,
  padding = "default",
  ...props 
}) => {
  const variants = {
    default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-soft",
    glass: "bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 shadow-soft",
    elevated: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-medium",
    flat: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
    gradient: "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-soft",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  const cardClasses = clsx(
    "rounded-xl transition-colors duration-200",
    variants[variant],
    paddings[padding],
    hover && "hover:border-gray-300 hover:shadow-medium",
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

const CardTitle = ({
  className = "",
  children,
  size = "lg",
  as: Tag = "h3",
  ...props
}) => {
  const sizes = {
    sm: "text-base font-semibold",
    md: "text-lg font-semibold",
    lg: "text-xl font-semibold",
    xl: "text-2xl font-bold",
  };
  return (
    <Tag className={clsx(sizes[size], className)} {...props}>
      {children}
    </Tag>
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
    <div className={clsx(variants[variant], "rounded-b-xl", className)} {...props}>
      {children}
    </div>
  );
};

// Use explicit default export to avoid issues with star export resolution
export default Card;
export { CardHeader, CardContent, CardFooter, CardTitle };
