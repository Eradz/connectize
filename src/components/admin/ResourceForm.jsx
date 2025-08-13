import React, { useState } from 'react';
import Button from '../ui/Button';
import Input, { Textarea } from '../ui/Input';
import Select from '../ui/Select';

/**
 * Generic ResourceForm for Create/Edit aligning with DRF error messages
 *
 * Props:
 * - title?: string
 * - fields: Array<{ name: string, label: string, type?: 'text'|'email'|'number'|'select'|'checkbox'|'textarea'|'password', required?: boolean, options?: Array<{value:string|number,label:string}>, placeholder?: string }>
 * - initialValues?: Record<string, any>
 * - onSubmit: (values) => Promise<{ success: boolean, errors?: Record<string,string[]>, message?: string }>
 * - onCancel?: () => void
 * - submitLabel?: string
 */
const ResourceForm = ({ title, fields, initialValues = {}, onSubmit, onCancel, submitLabel = 'Save' }) => {
  const [values, setValues] = useState(() => ({ ...initialValues }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const res = await onSubmit(values);
    if (!res?.success) {
      setErrors(res?.errors || { __all__: [res?.message || 'Submission failed'] });
    }
    setSubmitting(false);
  };

  const renderField = (f) => {
    switch (f.type) {
      case 'select':
        return (
          <Select
            value={values[f.name] ?? ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            required={f.required}
          >
            <option value="">Select {f.label.toLowerCase()}</option>
            {(f.options || []).map((opt) => (
              <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        );
      case 'checkbox':
        return (
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={!!values[f.name]}
              onChange={(e) => handleChange(f.name, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            <span>{f.label}</span>
          </label>
        );
      case 'textarea':
        return (
          <Textarea
            value={values[f.name] ?? ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            placeholder={f.placeholder}
            rows={f.rows || 4}
            required={f.required}
          />
        );
      default:
        return (
          <Input
            type={f.type || 'text'}
            value={values[f.name] ?? ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            placeholder={f.placeholder}
            required={f.required}
            autoComplete="off"
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}

      {errors.__all__ && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          {errors.__all__.join(' ')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((f) => (
          <div key={f.name} className={f.type === 'checkbox' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
            {renderField(f)}
            {errors[f.name] && (
              <p className="mt-1 text-xs text-red-600">{errors[f.name].join(' ')}</p>
            )}
          </div>
        ))}

        <div className="md:col-span-2 flex items-center justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
