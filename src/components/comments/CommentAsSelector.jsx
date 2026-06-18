import React, { useMemo } from 'react';
import { getUserDisplayName } from '../../lib/userDisplay';

/**
 * CommentAsSelector - Allows users to choose whether to comment as themselves or as a company
 * @param {Object} props
 * @param {Object} props.user - Current user object
 * @param {Array} props.userCompanies - Array of companies owned by the user
 * @param {string} props.selectedType - 'user' or 'company'
 * @param {number|null} props.selectedCompanyId - ID of selected company (if type is 'company')
 * @param {Function} props.onSelectionChange - Callback when selection changes: (type, companyId) => void
 * @param {string} props.label - Visible label for the selector
 * @param {string} props.idPrefix - Unique id prefix for the select
 */
export default function CommentAsSelector({ 
  user, 
  userCompanies = [], 
  selectedType = 'user',
  selectedCompanyId = null,
  onSelectionChange,
  label = 'Comment as:',
  idPrefix = 'comment-as',
}) {
  const personalLabel = useMemo(
    () => getUserDisplayName(user) || 'Personal account',
    [user]
  );

  // Don't show selector if user has no companies
  if (!userCompanies || userCompanies.length === 0) {
    return null;
  }

  const selectedValue =
    selectedType === 'company' && selectedCompanyId ? String(selectedCompanyId) : '';

  const handleChange = (event) => {
    const value = event.target.value;
    if (!value) {
      onSelectionChange('user', null);
      return;
    }

    onSelectionChange('company', Number(value));
  };

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      <label
        htmlFor={idPrefix}
        className="text-[10px] font-medium text-gray-400 uppercase tracking-wider"
      >
        {label}
      </label>
      <select
        id={idPrefix}
        value={selectedValue}
        onChange={handleChange}
        className="max-w-full text-xs font-medium text-gray-700 bg-transparent hover:text-gray-900 border-none outline-none cursor-pointer p-0 pr-4 appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
        }}
        aria-label={label.replace(/:$/, '')}
      >
        <option value="">{personalLabel}</option>
        {userCompanies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.company_name}
          </option>
        ))}
      </select>
    </div>
  );
}
