import { makeApiRequest } from "../lib/helpers";

/**
 * Check whether the current user may ping the given object, and whether the
 * premium-only "everyone" audience is available to them.
 */
export const getPingEligibility = async ({ objectType, objectId }) => {
  return makeApiRequest({
    url: "api/pings/eligibility/",
    method: "GET",
    params: { object_type: objectType, object_id: objectId },
  });
};

/**
 * Create a Ping — a company broadcast that notifies an audience about one of
 * the company's objects. Backend enforces company ownership, the 1/day quota,
 * and the premium gate on the "everyone" audience.
 */
export const createPing = async ({
  objectType,
  objectId,
  audience,
  message,
  scheduledAt,
  targetUserId,
}) => {
  return makeApiRequest({
    url: "api/pings/",
    method: "POST",
    data: {
      object_type: objectType,
      object_id: objectId,
      audience,
      ...(message ? { message } : {}),
      ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
      ...(targetUserId ? { target_user_id: targetUserId } : {}),
    },
  });
};
