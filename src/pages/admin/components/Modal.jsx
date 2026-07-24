import React, { useState } from 'react';
import Input, { Textarea } from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500/75 dark:bg-black/70 transition-opacity"></div>

        {/* Modal panel */}
        <div className={`inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full`}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                {title && (
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Form = ({ 
  fields = [], 
  data = {}, 
  onSubmit, 
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false 
}) => {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || '',
      onChange: (e) => handleChange(field.name, e.target.value),
      disabled: loading,
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={field.rows || 4}
            placeholder={field.placeholder}
          />
        );
      case 'select':
        return (
          <Select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      case 'checkbox':
        return (
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData[field.name] || false}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="h-4 w-4 text-gold focus:ring-primary-500/30 border-gray-300 rounded"
              disabled={loading}
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">{field.label}</span>
          </label>
        );
      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => handleChange(field.name, e.target.files[0])}
            accept={field.accept}
            disabled={loading}
            className={`w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${errors[field.name] ? 'border-red-500' : ''}`}
          />
        );
      case 'date':
        return <Input type="date" {...commonProps} />;
      case 'datetime-local':
        return <Input type="datetime-local" {...commonProps} />;
      case 'email':
      case 'number':
      case 'url':
      case 'text':
      default:
        return (
          <Input
            type={field.type || 'text'}
            {...commonProps}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map(field => (
        <div key={field.name}>
          {field.type !== 'checkbox' && (
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {renderField(field)}
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
          {field.help && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{field.help}</p>
          )}
        </div>
      ))}

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-800">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading} size="md">
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={loading} size="md">
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

// Attach Form to Modal for <Modal.Form /> usage
Modal.Form = Form;

export default Modal;
export { Form };
