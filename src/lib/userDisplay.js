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
  const base = local
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[._-]+|[._-]+$/g, "");
  return base || "user";
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

  if (user.email) return deriveNameFromEmail(user.email);

  const username = String(user.username || "").trim();
  if (username) {
    return isEmailLike(username) ? deriveNameFromEmail(username) : username;
  }

  return "User";
}

/**
 * Resolve the user's handle/username, never falling back to the raw email.
 * Order: backend username -> username derived from email.
 */
export function getUserHandle(user) {
  if (!user) return "";

  const username = String(user.username || "").trim();
  if (username && !isEmailLike(username)) return username;

  if (user.email) return deriveUsernameFromEmail(user.email);

  if (username) return deriveUsernameFromEmail(username);

  return "";
}
