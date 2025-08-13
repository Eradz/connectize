import React from "react";

const base = "w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 dark:border-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500";

const Input = ({ className = "", ...props }) => (
  <input className={`${base} ${className}`} {...props} />
);

const Select = ({ className = "", children, ...props }) => (
  <select className={`${base} ${className}`} {...props}>
    {children}
  </select>
);

const Textarea = ({ className = "", ...props }) => (
  <textarea className={`${base} ${className}`} {...props} />
);

export { Input as default, Select, Textarea };
