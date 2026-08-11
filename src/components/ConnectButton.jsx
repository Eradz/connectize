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
      setHasConnected(!isUnfollowing);

      // The displayed `status` prefers the `connection_status` prop, which
      // comes from a react-query cache this component doesn't own — without
      // invalidating it, that prop stays stale until a hard refresh.
      if (type === "users") {
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === "users",
        });
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
