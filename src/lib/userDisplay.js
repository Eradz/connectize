/**
 * User display helpers (web).
 *
 * When a user hasn't completed their profile, the backend never exposes their
 * raw email as a name. Instead it derives a friendly temporary name and
 * username from the email's local part (see `derive_name_from_email` and
 * `generate_unique_username` in the Django `authentication` app, surfaced via
 * the `full_name` / `display_name` / `username` serializer fields).
 *
 * These helpers mirror that behaviour on the client so the same friendly name
 * propagates through the app even when an API/websocket payload is missing the
 * derived fields, and so the raw email is never shown as a person's name.
 */

/**
 * Build a human-friendly display name from an email's local part.
 * e.g. `john.doe@example.com` -> `John Doe`, `plekia@aust.edu.ng` -> `Plekia`.
 * Mirrors the backend `derive_name_from_email` helper.
 */
export function deriveNameFromEmail(email) {
  const local = String(email || "").split("@")[0];
  const parts = local.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (parts.length === 0) {
    return local || "User";
  }
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Build a URL-safe username from an email's local part.
 * Mirrors the backend `generate_unique_username` base derivation.
 */
export function deriveUsernameFromEmail(email) {
  const local = String(email || "").split("@")[0];
  let base = cleanHandle(local);
  if (!base || GENERIC_EMAIL_LOCALS.has(base)) {
    const domain = String(email || "").split("@")[1] || "";
    base = cleanHandle(domain.split(".")[0]) || base;
  }
  return base || "user";
}

const GENERIC_EMAIL_LOCALS = new Set([
  "info", "admin", "administrator", "sales", "contact", "contactus",
  "hello", "hi", "support", "team", "office", "mail", "email", "webmail",
  "noreply", "no-reply", "donotreply", "marketing", "hr", "careers",
  "career", "jobs", "help", "helpdesk", "service", "services", "enquiries",
  "enquiry", "inquiries", "inquiry", "accounts", "account", "billing",
  "finance", "general", "company", "business",
]);

const cleanHandle = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[._-]+|[._-]+$/g, "");

/** Legacy accounts were often assigned `info`, `info2`, `info_3`, etc. */
export const isPlaceholderUsername = (value) =>
  /^info(?:[._-]?\d+)?$/i.test(String(value || "").trim());

/** Build the same compact, lowercase name-based handle used by the backend. */
export function deriveUsernameFromName(user) {
  if (!user) return "";
  const explicitName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  const name =
    explicitName || user.full_name || user.display_name || user.name || user.user_name || "";
  return cleanHandle(String(name).replace(/[._-]/g, ""));
}

const isEmailLike = (value) => String(value || "").includes("@");

/**
 * Resolve the best display name for a user, never falling back to the raw
 * email. Order: real first/last name -> backend full_name -> backend
 * display_name -> name derived from email -> username.
 */
export function getUserDisplayName(user) {
  if (!user) return "User";

  const first = String(user.first_name || "").trim();
  const last = String(user.last_name || "").trim();
  const combined = `${first} ${last}`.trim();
  if (combined && !isEmailLike(combined)) return combined;

  const fullName = String(user.full_name || "").trim();
  if (fullName && !isEmailLike(fullName)) return fullName;

  const displayName = String(user.display_name || "").trim();
  if (displayName && !isEmailLike(displayName)) return displayName;

  const alternateName = String(user.name || user.user_name || "").trim();
  if (
    alternateName &&
    !isEmailLike(alternateName) &&
    !isPlaceholderUsername(alternateName)
  ) {
    return alternateName;
  }

  if (user.email) return deriveNameFromEmail(user.email);

  const username = String(user.username || "").trim();
  if (username && !isPlaceholderUsername(username)) {
    return isEmailLike(username) ? deriveNameFromEmail(username) : username;
  }

  return "User";
}

/**
 * Resolve the user's handle/username, never falling back to the raw email.
 * Order: valid backend username -> full-name handle for legacy placeholders ->
 * username derived from email.
 */
export function getUserHandle(user) {
  if (!user) return "";

  const username = String(user.username || "").trim();
  if (username && user.username_customized && !isEmailLike(username)) {
    return username;
  }
  if (username && !isEmailLike(username) && !isPlaceholderUsername(username)) {
    return username;
  }

  if (!username || isPlaceholderUsername(username)) {
    const nameHandle = deriveUsernameFromName(user);
    if (nameHandle) return nameHandle;
  }

  if (user.email) return deriveUsernameFromEmail(user.email);

  if (username) return deriveUsernameFromEmail(username);

  return "";
}
