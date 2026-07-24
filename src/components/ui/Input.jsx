import React, { forwardRef } from "react";
import clsx from "clsx";

const baseStyles = "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500";

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
    error && "border-error-500 focus:border-error-500 focus:ring-error-500/20",
    success && "border-success-500 focus:border-success-500 focus:ring-success-500/20",
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
    error && "border-error-500 focus:border-error-500 focus:ring-error-500/20",
    success && "border-success-500 focus:border-success-500 focus:ring-success-500/20",
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
    error && "border-error-500 focus:border-error-500 focus:ring-error-500/20",
    success && "border-success-500 focus:border-success-500 focus:ring-success-500/20",
    className
  );

  return <textarea className={textareaClasses} ref={ref} {...props} />;
});

Textarea.displayName = "Textarea";

export { Input as default, Select, Textarea };
