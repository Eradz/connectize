import React from "react";

const Checkbox = ({ className = "", label, id, ...props }) => (
  <label htmlFor={id} className={`inline-flex items-center ${className}`}>
    <input
      id={id}
      type="checkbox"
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      {...props}
    />
    {label && <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
);

export default Checkbox;
