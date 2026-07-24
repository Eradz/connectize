import { useState } from 'react';
import { Search, X, Check } from 'lucide-react';
import { searchCurrencies } from '../utils/currency';

// One-tap chips for the most common picks; the long tail (all 141) lives behind
// the "More" button in a searchable modal. Keep in sync with the mobile app.
export const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'AED'];

/**
 * Shared currency picker: popular chips + searchable "More" modal.
 *
 * @param {string}   value     Currently selected ISO currency code.
 * @param {Function} onChange  Called with the new currency code.
 * @param {string}   [label]   Field label (pass null/'' to hide).
 * @param {string}   [className] Extra classes for the wrapper.
 */
const CurrencyPicker = ({ value, onChange, label = 'Currency', className = '' }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  const select = (code) => {
    onChange(code);
    setShowPicker(false);
  };

  return (
    <div className={className}>
      {label ? (
        <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {POPULAR_CURRENCIES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
              value === code
                ? 'bg-gold text-dark border-gold'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gold'
            }`}
          >
            {code}
          </button>
        ))}
        {/* Show the selected currency as a chip when it isn't a popular one */}
        {value && !POPULAR_CURRENCIES.includes(value) && (
          <span className="px-3 py-1.5 rounded-full border border-gold bg-gold text-dark text-sm font-medium">
            {value}
          </span>
        )}
        <button
          type="button"
          onClick={() => { setSearch(''); setShowPicker(true); }}
          className="px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-gold hover:text-gold transition-colors flex items-center gap-1"
        >
          <Search className="w-3.5 h-3.5" />
          More
        </button>
      </div>

      {/* Searchable currency picker for the long tail of supported currencies */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Select currency</h3>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or code"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold text-sm"
                />
              </div>
            </div>
            <div className="overflow-y-auto px-2 pb-3">
              {searchCurrencies(search).map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => select(c.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm hover:bg-gray-50 ${
                    value === c.code ? 'bg-gold/10' : ''
                  }`}
                >
                  <span className="text-gray-700">
                    <span className="font-medium text-gray-900">{c.code}</span>
                    <span className="mx-2 text-gray-300">·</span>
                    {c.name}
                  </span>
                  {value === c.code && <Check className="w-4 h-4 text-gold" />}
                </button>
              ))}
              {searchCurrencies(search).length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-gray-400">No currencies match “{search}”.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyPicker;
