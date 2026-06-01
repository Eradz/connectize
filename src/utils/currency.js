/**
 * Returns the currency symbol based on the currency code
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR', 'GBP', 'NGN')
 * @returns {string} - The currency symbol
 */
export const getCurrencySymbol = (currency) => {
  if (!currency) return '$'; // Default to USD

  const currencyMap = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CHF: 'CHF',
    CAD: 'C$',
    AUD: 'A$',
    NZD: 'NZ$',
    INR: '₹',
    KES: 'KES',
    NGN: '₦',
    ZAR: 'R',
    MXN: 'Mex$',
    BRL: 'R$',
    RUB: '₽',
    CNY: '¥',
    AED: 'د.إ',
    SAR: '﷼',
    QAR: 'QR',
    OMR: 'OMR',
    KWD: 'د.ك',
    BHD: '.د.ب',
    PHP: '₱',
    SGD: 'S$',
    HKD: 'HK$',
    THB: '฿',
    MYR: 'RM',
    IDR: 'Rp',
    VND: '₫',
    KRW: '₩',
    TWD: 'NT$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    RON: 'lei',
    BGN: 'лв',
    HRK: 'kn',
    ISK: 'kr',
    TRY: '₺',
    ILS: '₪',
    PKR: '₨',
    BDT: '৳',
    LKR: 'Rs',
    MMK: 'K',
    TTD: 'TT$',
    JMD: 'J$',
    BAM: 'KM'
  };

  return currencyMap[currency?.toUpperCase()] || currency || '$';
};

/**
 * Formats a number as currency using the platform's single, locale-aware
 * formatter. The number of decimal places defaults to the currency's own
 * ISO 4217 convention (e.g. JPY -> 0, USD -> 2, KWD -> 3) so amounts are never
 * mis-rendered. Always pass the real currency code -- never hard-code a symbol.
 *
 * @param {number|string} amount - The amount to format
 * @param {string} currency - The ISO 4217 currency code (default: 'USD')
 * @param {number} [decimals] - Optional override for decimal places
 * @returns {string} - Formatted currency string (e.g. '$1,234.56', '¥1,235', '₦1,234.56')
 */
export const formatCurrency = (amount, currency = 'USD', decimals) => {
  const value = Number(amount);
  const safeValue = Number.isFinite(value) ? value : 0;
  const code = (currency || 'USD').toString().toUpperCase();

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      ...(decimals !== undefined
        ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
        : {}),
    }).format(safeValue);
  } catch (e) {
    // Unsupported/invalid currency code: fall back to the symbol map.
    const symbol = getCurrencySymbol(code);
    const formatted = safeValue
      .toFixed(decimals ?? 2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${symbol}${formatted}`;
  }
};

/**
 * Gets the currency name based on the currency code
 * @param {string} currency - The currency code
 * @returns {string} - The currency name
 */
export const getCurrencyName = (currency) => {
  const currencyNames = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    CHF: 'Swiss Franc',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    NZD: 'New Zealand Dollar',
    INR: 'Indian Rupee',
    KES: 'Kenyan Shilling',
    NGN: 'Nigerian Naira',
    ZAR: 'South African Rand',
    MXN: 'Mexican Peso',
    BRL: 'Brazilian Real',
    RUB: 'Russian Ruble',
    CNY: 'Chinese Yuan',
    AED: 'United Arab Emirates Dirham',
    SAR: 'Saudi Arabian Riyal',
    QAR: 'Qatari Riyal',
    OMR: 'Omani Rial',
    KWD: 'Kuwaiti Dinar',
    BHD: 'Bahraini Dinar',
    PHP: 'Philippine Peso',
    SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar',
    THB: 'Thai Baht',
    MYR: 'Malaysian Ringgit',
    IDR: 'Indonesian Rupiah',
    VND: 'Vietnamese Dong',
    KRW: 'South Korean Won',
    TWD: 'New Taiwan Dollar',
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    PLN: 'Polish Zloty',
    CZK: 'Czech Koruna',
    HUF: 'Hungarian Forint',
    RON: 'Romanian Leu',
    BGN: 'Bulgarian Lev',
    HRK: 'Croatian Kuna',
    ISK: 'Icelandic Króna',
    TRY: 'Turkish Lira',
    ILS: 'Israeli Shekel',
    PKR: 'Pakistani Rupee',
    BDT: 'Bangladeshi Taka',
    LKR: 'Sri Lankan Rupee',
    MMK: 'Myanmar Kyat',
    TTD: 'Trinidad and Tobago Dollar',
    JMD: 'Jamaican Dollar',
    BAM: 'Bosnia and Herzegovina Convertible Mark'
  };

  return currencyNames[currency?.toUpperCase()] || 'Unknown Currency';
};
