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

  // Prefer the backend's authoritative status; fall back to the client-side
  // derivation above when it's absent (e.g. company connections, which don't
  // yet report connection_status).
  const status = KNOWN_STATUSES.includes(connection_status)
    ? connection_status
    : hasConnected
    ? "connected"
    : "none";

  const handleConnect = async () => {
    // isSubmitting guards against rapid re-clicks: `status` only reflects the
    // backend's real state once the invalidated query below refetches, so
    // without this a user clicking repeatedly before that refetch lands would
    // fire a POST per click (the backend dedupes via get_or_create, but each
    // extra click was still driving the old, unconditional local increment).
    if (!slug || isSubmitting) return;
    if (status === "pending_outgoing") return;

    const isUnfollowing = status === "connected";
    setIsSubmitting(true);

    try {
      const response =
        type === "users"
          ? await connectWithUser(slug, isUnfollowing)
          : await connectWithCompany(slug, isUnfollowing);

      // Reconcile with the backend's authoritative count instead of trusting
      // the optimistic guess — the response already carries the real value.
      if (typeof response?.followers_count === "number") {
        setCachedConnections?.(response.followers_count);
      } else {
        setCachedConnections?.((prev) => prev + (isUnfollowing ? -1 : 1));
      }
      setHasConnected(response?.connection_status === "connected" || !isUnfollowing);

      // The displayed `status` prefers the `connection_status` prop, which
      // comes from a react-query cache this component doesn't own. Waiting on
      // an invalidated refetch to come back was too slow/unreliable for an
      // "immediate" button flip, so write the mutation's own authoritative
      // response straight into the cache — synchronous, no network round trip
      // needed before the UI reflects it. Still invalidate in the background
      // afterward for eventual consistency with anything else this doesn't cover.
      if (type === "users" && response?.connection_status) {
        // Match only the single-profile query shape (["users", <id>]) — a
        // broader match on queryKey[0] === "users" would also catch cached
        // user *lists* (search/suggestions), whose value is an array, and
        // `typeof [] === "object"` would let the spread below silently
        // corrupt that array into a garbage object.
        const isSingleUserQuery = (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey.length === 2 &&
          query.queryKey[0] === "users" &&
          String(query.queryKey[1]) === String(slug);

        queryClient.setQueriesData({ predicate: isSingleUserQuery }, (old) =>
          old && typeof old === "object" && !Array.isArray(old)
            ? {
                ...old,
                connection_status: response.connection_status,
                follow_status: response.connection_status,
                is_following: response.is_following ?? old.is_following,
                is_connected: response.is_connected ?? old.is_connected,
                followers_count: response.followers_count ?? old.followers_count,
                following_count: response.following_count ?? old.following_count,
              }
            : old
        );
        queryClient.invalidateQueries({ predicate: isSingleUserQuery });
      } else {
        await queryClient.invalidateQueries({ queryKey: ["myCompanies"] });
      }
    } catch (error) {
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
