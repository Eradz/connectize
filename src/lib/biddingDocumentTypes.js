export const DEFAULT_BIDDING_DOCUMENT_TYPE = "other";

export function normalizeBiddingDocumentTypes(data) {
  const items = Array.isArray(data)
    ? data
    : data?.results || data?.data?.results || data?.data || [];

  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      value: item.value || item.slug,
      label: item.label || item.name,
    }))
    .filter((item) => item.value && item.label);
}

export function getDefaultBiddingDocumentType(options) {
  return (
    options.find((option) => option.value === DEFAULT_BIDDING_DOCUMENT_TYPE)?.value ||
    options[0]?.value ||
    DEFAULT_BIDDING_DOCUMENT_TYPE
  );
}

export function getBiddingDocumentTypeLabel(value, options, apiLabel) {
  if (apiLabel) return apiLabel;
  if (!value) return "Document";
  return options.find((option) => option.value === value)?.label || value.replace(/_/g, " ");
}
