import React from "react";
import clsx from "clsx";

const Avatar = ({ 
  src, 
  alt = "", 
  size = "md", 
  shape = "circle",
  status,
  className = "",
  fallback,
  ...props 
}) => {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  };

  const shapes = {
    circle: "rounded-full",
    square: "rounded-lg",
  };

  const statusColors = {
    online: "bg-success-500 border-white dark:border-gray-900",
    offline: "bg-gray-400 border-white dark:border-gray-900",
    away: "bg-warning-500 border-white dark:border-gray-900",
    busy: "bg-error-500 border-white dark:border-gray-900",
  };

  const avatarClasses = clsx(
    "relative inline-flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 shadow-soft transition-all duration-200 hover:shadow-medium",
    sizes[size],
    shapes[shape],
    "group",
    className
  );

  const statusIndicatorSize = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
    xl: "w-4 h-4",
    "2xl": "w-5 h-5",
  };

  const content = src ? (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      {...props}
    />
  ) : (
    <span className="font-medium text-gray-600 dark:text-gray-300 select-none">
      {fallback || alt?.charAt(0)?.toUpperCase() || "?"}
    </span>
  );

  return (
    <div className={avatarClasses}>
      {content}
      {status && (
        <div 
          className={clsx(
            "absolute bottom-0 right-0 rounded-full border-2 transform translate-x-1 translate-y-1",
            statusIndicatorSize[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

const AvatarGroup = ({ 
  children, 
  max = 4, 
  size = "md",
  className = "",
  ...props 
}) => {
  const childArray = React.Children.toArray(children);
  const visibleAvatars = childArray.slice(0, max);
  const remaining = childArray.length - max;

  const spacingClasses = {
    xs: "-space-x-2",
    sm: "-space-x-2",
    md: "-space-x-3",
    lg: "-space-x-4",
    xl: "-space-x-5",
    "2xl": "-space-x-6",
  };

  return (
    <div className={clsx("flex items-center", spacingClasses[size], className)} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <div key={index} className="relative ring-2 ring-white dark:ring-gray-900">
          {React.cloneElement(avatar, { size })}
        </div>
      ))}
      {remaining > 0 && (
        <Avatar 
          size={size}
          fallback={`+${remaining}`}
          className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900"
        />
      )}
    </div>
  );
};

export { Avatar as default, AvatarGroup };
