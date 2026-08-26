import { makeApiRequest } from "../lib/helpers/index";

/**
 * Scheduled calls.
 *
 * A call on Connectize is an appointment before it is a connection: one party
 * proposes a time, the other accepts, and only then - and only inside the
 * window around that time - can either side open media. Every function here
 * is one step of that agreement.
 *
 * On refusals: `makeApiRequest` swallows the response body and returns null,
 * having already shown the server's message. That loses the machine-readable
 * `code`, so nothing here switches on it. The UI drives its buttons from the
 * call resource instead - `can_join` and `join_blocked_reason` are computed
 * server-side on every read - which is the better source anyway: it is the
 * same answer the socket will give, and it is fresh on every refetch rather
 * than only after a failed click.
 */

const CALLS_URL = "api/calls/";

export const listCalls = async (params) => {
  const res = await makeApiRequest({ url: CALLS_URL, method: "GET", params });
  return res?.results ?? res ?? [];
};

export const getCall = async (callId) =>
  makeApiRequest({ url: `${CALLS_URL}${callId}/`, method: "GET" });

export const proposeCall = async ({
  invitee,
  scheduledStart,
  durationMinutes = 30,
  kind = "video",
  topic = "",
}) =>
  makeApiRequest({
    url: CALLS_URL,
    method: "POST",
    data: {
      invitee,
      scheduled_start: scheduledStart,
      duration_minutes: durationMinutes,
      kind,
      topic,
    },
  });

export const acceptCall = async (callId) =>
  makeApiRequest({ url: `${CALLS_URL}${callId}/accept/`, method: "POST" });

export const declineCall = async (callId, reason = "") =>
  makeApiRequest({
    url: `${CALLS_URL}${callId}/decline/`,
    method: "POST",
    data: { reason },
  });

export const cancelCall = async (callId) =>
  makeApiRequest({ url: `${CALLS_URL}${callId}/cancel/`, method: "POST" });

export const rescheduleCall = async (callId, { scheduledStart, durationMinutes }) =>
  makeApiRequest({
    url: `${CALLS_URL}${callId}/reschedule/`,
    method: "POST",
    data: {
      scheduled_start: scheduledStart,
      ...(durationMinutes ? { duration_minutes: durationMinutes } : {}),
    },
  });

/**
 * Ask for the room and the ICE servers.
 *
 * Returns null when the call is not joinable right now - the same rule the
 * signalling socket applies, so a client that gets credentials here will get
 * through the socket too. TURN credentials are short-lived and minted per
 * join; they are not cached.
 */
export const joinCall = async (callId) =>
  makeApiRequest({ url: `${CALLS_URL}${callId}/join/`, method: "POST" });
