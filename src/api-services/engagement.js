import { makeApiRequest } from "../lib/helpers";
import { getSession } from "../lib/session";

/**
 * Engagement instrumentation.
 *
 * Two jobs:
 *
 * 1. `reportView` / `reportSearch` tell the backend about things only the
 *    browser knows - that someone opened a profile, a company page, a listing.
 *    Nothing else can see these, so without them "who viewed your profile" is
 *    permanently empty.
 * 2. `getProfileViews` and friends read that data back.
 *
 * The reporting calls are deliberately fire-and-forget. They must never
 * interrupt what the user was doing: no thrown errors, no redirect, no toast.
 */

/** Target types the backend will accept. Anything else is rejected server-side. */
export const VIEW_TARGETS = {
  // A user profile page is /co/<userId> - a User. Only ~1% of accounts have a
  // ProfessionalProfile, so `user` is the common case and `professionalProfile`
  // is the exception, not the other way round.
  user: "user",
  professionalProfile: "professionalprofile",
  company: "company",
  listing: "marketplacelisting",
  tender: "bidproject",
  job: "jobposting",
};

const VIEW_EVENTS = {
  user: "profile_viewed",
  professionalprofile: "profile_viewed",
  company: "company_viewed",
  marketplacelisting: "listing_viewed",
  bidproject: "tender_viewed",
  jobposting: "job_viewed",
};

/**
 * Record that the current user looked at something.
 *
 * Silent by design. `makeApiRequest` sends the user to the login page when it
 * finds no token, which would be an appalling outcome for an analytics ping on
 * a page an anonymous visitor is allowed to read - so this checks for a session
 * first and simply does nothing without one.
 *
 * @param {string} targetType one of VIEW_TARGETS
 * @param {string|number} targetId
 * @param {string} [source] surface the view came from: search, feed, digest...
 */
export const reportView = async (targetType, targetId, source = "") => {
  if (!targetType || !targetId) return;
  if (!getSession()) return; // anonymous - nothing to attribute

  const event = VIEW_EVENTS[targetType];
  if (!event) return;

  try {
    await makeApiRequest({
      url: "api/engagement/events/",
      method: "POST",
      data: {
        event,
        target_type: targetType,
        target_id: String(targetId),
        source,
      },
    });
  } catch {
    // Instrumentation must never surface to the user or break the page.
  }
};

/** Record a search. Terms are stored as metadata, not indexed. */
export const reportSearch = async (term, source = "") => {
  if (!getSession()) return;
  try {
    await makeApiRequest({
      url: "api/engagement/events/",
      method: "POST",
      data: {
        event: "search_performed",
        source,
        metadata: { term: String(term || "").slice(0, 200) },
      },
    });
  } catch {
    /* silent */
  }
};

/**
 * People who viewed this user's profile, company or listings.
 * Grouped one row per person, newest first.
 */
export const getProfileViews = async ({
  limit = 20,
  offset = 0,
  days = 30,
} = {}) => {
  // Deliberately *not* caught. Returning an empty list on failure made a
  // backend outage render as "No one has viewed you yet" - which is not an
  // empty state, it is a false statement about other people's behaviour. The
  // caller distinguishes "nothing to show" from "could not load".
  return makeApiRequest({
    url: "api/engagement/profile-views/",
    method: "GET",
    params: { limit, offset, days },
  });
};

/**
 * Counts only - cheap enough to poll for the nav badge without pulling the list.
 */
export const getProfileViewsSummary = async ({ days = 30 } = {}) => {
  try {
    return await makeApiRequest({
      url: "api/engagement/profile-views/summary/",
      method: "GET",
      params: { days },
    });
  } catch {
    // A failed badge fetch should read as "no badge", not break the nav.
    return { unseen_count: 0, unique_viewers: 0, total_views: 0 };
  }
};

/** Clear the badge. Call when the viewer list is opened. */
export const markProfileViewsSeen = async () => {
  try {
    return await makeApiRequest({
      url: "api/engagement/profile-views/mark-seen/",
      method: "POST",
    });
  } catch {
    return { unseen_count: 0 };
  }
};

/** Where the current user sits in the activation funnel. */
export const getMyEngagement = async ({ days = 30 } = {}) => {
  try {
    return await makeApiRequest({
      url: "api/engagement/me/",
      method: "GET",
      params: { days },
    });
  } catch (error) {
    console.error("Failed to fetch engagement summary:", error);
    return null;
  }
};
