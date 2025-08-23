import React from "react";

const Select = ({ className = "", children, ...props }) => (
  <select
    className={`w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  >
    {children}
  </select>
);

export default Select;
