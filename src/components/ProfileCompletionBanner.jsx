import { Link } from "react-router-dom";
import { useAuth } from "../context/userContext";
import { PROFILE_COMPLETION_ROUTE } from "../lib/profileCompletion";

/**
 * Prompts for a missing first/last name before the user hits a wall.
 *
 * The API refuses every write from an account without both names
 * (ProfileCompletionGateMixin -> 403 profile_incomplete). Until now the only way
 * to find that out was to try something — click Connect, post a comment — and
 * have it fail. `is_profile_complete` on the current user lets us say so up front.
 *
 * Renders nothing for a complete profile, so it is safe to mount unconditionally.
 */
export default function ProfileCompletionBanner() {
  const { user } = useAuth();

  if (!user) return null;

  // Prefer the API's own flag, since it is the same value the gate enforces. But
  // fall back to the names themselves when the flag is missing - a user object
  // cached from before that field existed would otherwise hide the banner from
  // exactly the people who need it.
  const incomplete =
    user.is_profile_complete === false ||
    (user.is_profile_complete === undefined &&
      (!user.first_name?.trim() || !user.last_name?.trim()));

  if (!incomplete) return null;

  return (
    <section
      role="status"
      className="flex flex-wrap items-center gap-3 rounded-lg border border-gold bg-gold/10 px-4 py-3"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">
          Add your name to finish setting up
        </p>
        <p className="text-xs text-gray-600">
          You need a first and last name before you can connect with people, post
          or respond to anything.
        </p>
      </div>
      <Link
        to={PROFILE_COMPLETION_ROUTE}
        className="rounded-md bg-gold px-3 py-1.5 text-xs font-semibold !text-gray-900 transition-colors hover:bg-custom_yellow"
      >
        Complete profile
      </Link>
    </section>
  );
}
