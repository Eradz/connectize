import React, { forwardRef } from "react";
import clsx from "clsx";

const baseStyles = "w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 shadow-soft focus:shadow-medium";

const Input = forwardRef(({ 
  className = "", 
  error = false,
  success = false,
  icon: Icon,
  rightIcon: RightIcon,
  ...props 
}, ref) => {
  const inputClasses = clsx(
    baseStyles,
    error && "border-error-500 focus:ring-error-500 bg-error-50/50 dark:bg-error-900/20",
    success && "border-success-500 focus:ring-success-500 bg-success-50/50 dark:bg-success-900/20",
    Icon && "pl-11",
    RightIcon && "pr-11",
    className
  );

  if (Icon || RightIcon) {
    return (
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        )}
        <input className={inputClasses} ref={ref} {...props} />
        {RightIcon && (
          <RightIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    );
  }

  return <input className={inputClasses} ref={ref} {...props} />;
});

Input.displayName = "Input";

const Select = forwardRef(({ 
  className = "", 
  children, 
  error = false,
  success = false,
  ...props 
}, ref) => {
  const selectClasses = clsx(
    baseStyles,
    "appearance-none bg-no-repeat bg-right bg-[length:20px] cursor-pointer",
    "bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e')]",
    error && "border-error-500 focus:ring-error-500 bg-error-50/50 dark:bg-error-900/20",
    success && "border-success-500 focus:ring-success-500 bg-success-50/50 dark:bg-success-900/20",
    className
  );

  return (
    <select className={selectClasses} ref={ref} {...props}>
      {children}
    </select>
  );
});

Select.displayName = "Select";

const Textarea = forwardRef(({ 
  className = "", 
  error = false,
  success = false,
  ...props 
}, ref) => {
  const textareaClasses = clsx(
    baseStyles,
    "resize-y min-h-[100px]",
    error && "border-error-500 focus:ring-error-500 bg-error-50/50 dark:bg-error-900/20",
    success && "border-success-500 focus:ring-success-500 bg-success-50/50 dark:bg-success-900/20",
    className
  );

  return <textarea className={textareaClasses} ref={ref} {...props} />;
});

Textarea.displayName = "Textarea";

export { Input as default, Select, Textarea };
