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
 * Formats a number as currency with the appropriate symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'USD')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted currency string (e.g., '$1,234.56')
 */
export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
  if (amount === null || amount === undefined) return `${getCurrencySymbol(currency)}0.00`;

  const symbol = getCurrencySymbol(currency);
  const formatted = parseFloat(amount)
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${symbol}${formatted}`;
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
