import { useEffect, useState } from "react";
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

  const currentCompany = data ? data : fetchedCompany?.[0];

  const [hasConnected, setHasConnected] = useState(
    () => currentUser?.company_followings?.includes(id) || false
  );

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
    if (!slug) return;
    if (status === "pending_outgoing") return;

    const isUnfollowing = status === "connected";
    if (isUnfollowing) {
      setCachedConnections?.((prev) => prev - 1);
      setHasConnected(false);
    } else {
      setHasConnected(true);
      setCachedConnections?.((prev) => prev + 1);
    }
    if (type === "users") {
      await connectWithUser(slug, isUnfollowing);
    } else if (type === "company") {
      await connectWithCompany(slug, isUnfollowing);
    }
  };

  return (
    <PrimaryButton
      onClick={handleConnect}
      disabled={isLoading || status === "pending_outgoing"}
    >
      {STATUS_LABELS[status]}
    </PrimaryButton>
  );
}
