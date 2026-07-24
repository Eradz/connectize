import React from "react";
import clsx from "clsx";

const Toggle = ({ 
  checked = false, 
  onChange, 
  disabled = false,
  size = "md",
  variant = "default",
  label,
  description,
  className = "",
  id,
  ...props 
}) => {
  const sizes = {
    sm: {
      switch: "w-8 h-5",
      thumb: "w-4 h-4",
      translate: "translate-x-3",
    },
    md: {
      switch: "w-11 h-6",
      thumb: "w-5 h-5",
      translate: "translate-x-5",
    },
    lg: {
      switch: "w-14 h-7",
      thumb: "w-6 h-6",
      translate: "translate-x-7",
    },
  };

  const variants = {
    default: {
      switch: checked 
        ? "bg-primary-500"
        : "bg-gray-200 dark:bg-gray-700",
      thumb: "bg-white shadow-soft",
    },
    success: {
      switch: checked 
        ? "bg-success-600 dark:bg-success-500" 
        : "bg-gray-200 dark:bg-gray-700",
      thumb: "bg-white shadow-soft",
    },
    warning: {
      switch: checked 
        ? "bg-warning-600 dark:bg-warning-500" 
        : "bg-gray-200 dark:bg-gray-700",
      thumb: "bg-white shadow-soft",
    },
    error: {
      switch: checked 
        ? "bg-error-600 dark:bg-error-500" 
        : "bg-gray-200 dark:bg-gray-700",
      thumb: "bg-white shadow-soft",
    },
  };

  const selectedSize = sizes[size];
  const selectedVariant = variants[variant];

  const handleClick = (e) => {
    e.preventDefault();
    if (disabled) return;
    onChange?.(!checked);
  };

  const toggleClasses = clsx(
    "relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2",
    selectedSize.switch,
    selectedVariant.switch,
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  const thumbClasses = clsx(
    "pointer-events-none inline-block rounded-full transform ring-0 transition-transform duration-200",
    selectedSize.thumb,
    selectedVariant.thumb,
    checked ? selectedSize.translate : "translate-x-0"
  );

  const content = (
    <button
      id={id}
      type="button"
      className={toggleClasses}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      <span className={thumbClasses} />
      {label && <span className="sr-only">{label}</span>}
    </button>
  );

  if (label || description) {
    return (
      <div className="flex items-start gap-3">
        {content}
        <div className="flex-1">
          {label && (
            <label 
              htmlFor={id}
              className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return content;
};

export default Toggle;
