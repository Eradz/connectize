import React, { useState } from 'react';

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
    const err = errors[f.name];
    const common = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    switch (f.type) {
      case 'select':
        return (
          <select
            value={values[f.name] ?? ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            className={common}
            required={f.required}
          >
            <option value="">Select {f.label.toLowerCase()}</option>
            {(f.options || []).map((opt) => (
              <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
          <textarea
            value={values[f.name] ?? ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            className={common}
            placeholder={f.placeholder}
            rows={4}
            required={f.required}
          />
        );
      default:
        return (
          <input
            type={f.type || 'text'}
            value={values[f.name] ?? ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            className={common}
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
            <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          )}
          <button type="submit" disabled={submitting} className={`px-4 py-2 rounded-lg text-white ${submitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}>
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
