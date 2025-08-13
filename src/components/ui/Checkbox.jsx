import React from "react";

const Checkbox = ({ className = "", label, id, ...props }) => (
  <label htmlFor={id} className={`inline-flex items-center ${className}`}>
    <input
      id={id}
      type="checkbox"
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
      {...props}
    />
    {label && <span className="ml-2 text-sm text-gray-800 dark:text-gray-200">{label}</span>}
  </label>
);

export default Checkbox;
