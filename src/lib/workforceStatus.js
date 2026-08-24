// Labels for WorkforceProfile.availability_status. The backend sends the raw enum
// value ("open_to_offers"), so every render site needs to map it - a CSS
// `capitalize` is not enough, because an underscore is not a word boundary and
// "open_to_offers" comes out as "Open_to_offers".
//
// Note that `capitalize` is actively wrong once the label has spaces in it: it
// uppercases every word, giving "Open To Offers". Render these strings as-is.
export const AVAILABILITY_LABELS = {
  available: "Available",
  busy: "Busy",
  available_soon: "Available Soon",
  not_available: "Not Available",
  open_to_offers: "Open to Offers",
};

export function formatAvailabilityLabel(status) {
  if (!status) return "Unknown";
  if (AVAILABILITY_LABELS[status]) return AVAILABILITY_LABELS[status];
  // A value this build has no label for (backend added one, or it arrived
  // already-formatted). Humanize it rather than leaking the enum shape.
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
