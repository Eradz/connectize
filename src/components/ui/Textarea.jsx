import React, { forwardRef } from 'react';
import clsx from 'clsx';

const Textarea = forwardRef(({ 
  label, 
  error, 
  helpText, 
  className = '', 
  required = false,
  disabled = false,
  variant = 'default',
  size = 'md',
  ...props 
}, ref) => {
  const variants = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg',
  };

  const textareaClasses = clsx(
    'form-textarea block w-full rounded-xl border transition-all duration-200',
    'bg-white focus:outline-none focus:ring-2 focus:ring-opacity-50',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'placeholder-gray-400',
    'resize-y',
    variants[error ? 'error' : variant],
    sizes[size],
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={textareaClasses}
        disabled={disabled}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
