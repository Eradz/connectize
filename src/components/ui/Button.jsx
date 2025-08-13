import React from "react";

const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};
const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-900 focus:ring-gray-300 dark:hover:bg-gray-800 dark:text-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
};

const Button = ({ as: Tag = "button", variant = "primary", size = "md", className = "", ...props }) => {
  return <Tag className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
};

export default Button;
