import React from "react";

const Card = ({ className = "", children, ...props }) => (
  <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className = "", children }) => (
  <div className={`px-5 py-4 border-b border-gray-200 dark:border-gray-800 ${className}`}>{children}</div>
);
const CardContent = ({ className = "", children }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);

export { Card as default, CardHeader, CardContent };
