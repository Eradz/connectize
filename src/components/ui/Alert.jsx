import React from 'react';
import clsx from 'clsx';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const Alert = ({ 
  variant = "default", 
  className = "", 
  children,
  ...props 
}) => {
  const variants = {
    default: "bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-100",
    destructive: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100",
    success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100",
    info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100",
  };

  const icons = {
    default: Info,
    destructive: XCircle,
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
  };

  const Icon = icons[variant];

  return (
    <div
      className={clsx(
        "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
        variants[variant],
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {children}
    </div>
  );
};

const AlertDescription = ({ className = "", ...props }) => {
  return (
    <div
      className={clsx("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
};

const AlertTitle = ({ className = "", ...props }) => {
  return (
    <h5
      className={clsx("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
};

export { Alert, AlertDescription, AlertTitle };
export default Alert;
