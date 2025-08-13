import React from "react";

const Card = ({ className = "", children, ...props }) => (
  <div className={`bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className = "", children }) => (
  <div className={`px-5 py-4 border-b border-gray-100 dark:border-gray-800 ${className}`}>{children}</div>
);
const CardContent = ({ className = "", children }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);

export { Card as default, CardHeader, CardContent };
