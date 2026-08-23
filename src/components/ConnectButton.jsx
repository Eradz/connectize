import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { connectWithCompany } from "../api-services/companies";
import { connectWithUser } from "../api-services/users";
import { useAuth } from "../context/userContext";
import { useGetCurrentCompany } from "../hooks";
import PrimaryButton from "./PrimaryButton";

const KNOWN_STATUSES = ["none", "pending_outgoing", "pending_incoming", "connected"];

const STATUS_LABELS = {
  none: "Connect",
  pending_outgoing: "Requested",
  pending_incoming: "Connect Back",
  connected: "Unfollow",
};

// This is a mutual-follow state machine, so the next state after a click is
// always deterministic — no need to wait on the network to know it.
const USER_OPTIMISTIC_NEXT_STATUS = {
  none: "pending_outgoing",
  pending_incoming: "connected",
  connected: "pending_incoming",
};

export default function ConnectButton({
  id,
  slug = "",
  type = "users",
  setCachedConnections,
  data,
  connection_status,
}) {
  const { user: currentUser } = useAuth();
  const { data: fetchedCompany, isLoading } = useGetCurrentCompany(id, !data);
  const queryClient = useQueryClient();

  const currentCompany = data ? data : fetchedCompany?.[0];

  const [hasConnected, setHasConnected] = useState(
    () => currentUser?.company_followings?.includes(id) || false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (type === "users") {
      const isInFollowingList = currentUser?.followings.find(
        (f) => f.type === "user" && f.id === id
      );

      setHasConnected(!!isInFollowingList);
    } else {
      setHasConnected(currentUser?.company_followings?.includes(id) || false);
    }
  }, [currentUser, currentCompany, id, type]);

  // `status` is real state, not re-derived from `connection_status` on every
  // render — some callers (e.g. the representatives list) source that prop
  // from a query that never gets invalidated/patched after a connect action,
  // so re-deriving from it each render would instantly stomp the optimistic
  // update in handleConnect below, right back to the stale "none". Instead,
  // only resync from the prop when it actually changes value (a real refetch
  // landed), which never fires again once it's stuck at a stale value.
  const [status, setStatus] = useState(() =>
    KNOWN_STATUSES.includes(connection_status)
      ? connection_status
      : hasConnected
      ? "connected"
      : "none"
  );

  useEffect(() => {
    if (KNOWN_STATUSES.includes(connection_status)) {
      setStatus(connection_status);
    }
  }, [connection_status]);

  // Match only the single-profile query shape (["users", <id>]) — a broader
  // match on queryKey[0] === "users" would also catch cached user *lists*
  // (search/suggestions), whose value is an array, and `typeof [] ===
  // "object"` would let the patch below silently corrupt it.
  const isSingleUserQuery = (query) =>
    Array.isArray(query.queryKey) &&
    query.queryKey.length === 2 &&
    query.queryKey[0] === "users" &&
    String(query.queryKey[1]) === String(slug);

  const patchUserCache = (patch) =>
    queryClient.setQueriesData({ predicate: isSingleUserQuery }, (old) =>
      old && typeof old === "object" && !Array.isArray(old) ? { ...old, ...patch } : old
    );

  const handleConnect = async () => {
    // isSubmitting guards against rapid re-clicks/double submission while the
    // confirming request is in flight, even though the label already flips
    // optimistically below.
    if (!slug || isSubmitting) return;
    if (status === "pending_outgoing") return;

    const isUnfollowing = status === "connected";
    const previousStatus = status;
    setIsSubmitting(true);

    // Optimistic update, snapshotted so it can be rolled back on failure.
    // Waiting for the server before showing anything was what made this feel
    // slow — the transition is deterministic, so show the end state now and
    // reconcile (or revert) once the request actually resolves.
    const previousEntries =
      type === "users" ? queryClient.getQueriesData({ predicate: isSingleUserQuery }) : [];
    setCachedConnections?.((prev) => prev + (isUnfollowing ? -1 : 1));

    if (type === "users") {
      const optimisticStatus = USER_OPTIMISTIC_NEXT_STATUS[status];
      setHasConnected(optimisticStatus === "connected");
      if (optimisticStatus) {
        setStatus(optimisticStatus);
        patchUserCache({
          connection_status: optimisticStatus,
          follow_status: optimisticStatus,
          is_following: optimisticStatus !== "none",
          is_connected: optimisticStatus === "connected",
        });
      }
    } else {
      setHasConnected(!isUnfollowing);
      setStatus(isUnfollowing ? "none" : "connected");
    }

    try {
      const response =
        type === "users"
          ? await connectWithUser(slug, isUnfollowing)
          : await connectWithCompany(slug, isUnfollowing);

      // A successful connect always returns a payload. Anything falsy means the
      // request did not actually go through - makeApiRequest swallows some
      // failures and resolves with null rather than throwing - and leaving the
      // optimistic flip in place there would show "Requested" for a connection
      // that was never saved. Fall through to the rollback below instead.
      if (!response) {
        throw new Error("Connect request did not complete");
      }

      // Reconcile with the backend's authoritative values in case they ever
      // differ from the optimistic guess (e.g. the relationship changed from
      // another tab in between).
      if (typeof response?.followers_count === "number") {
        setCachedConnections?.(response.followers_count);
      }
      if (type === "users" && response?.connection_status) {
        setHasConnected(response.connection_status === "connected");
        setStatus(response.connection_status);
        patchUserCache({
          connection_status: response.connection_status,
          follow_status: response.connection_status,
          is_following: response.is_following,
          is_connected: response.is_connected,
          followers_count: response.followers_count,
          following_count: response.following_count,
        });
        queryClient.invalidateQueries({ predicate: isSingleUserQuery });
      } else if (type !== "users") {
        queryClient.invalidateQueries({ queryKey: ["myCompanies"] });
      }
    } catch (error) {
      // Roll back the optimistic update — the request actually failed.
      setCachedConnections?.((prev) => prev + (isUnfollowing ? 1 : -1));
      setHasConnected(isUnfollowing);
      setStatus(previousStatus);
      previousEntries.forEach(([key, value]) => queryClient.setQueryData(key, value));
      toast.error("Something went wrong — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PrimaryButton
      onClick={handleConnect}
      disabled={isLoading || isSubmitting || status === "pending_outgoing"}
    >
      {STATUS_LABELS[status]}
    </PrimaryButton>
  );
}
