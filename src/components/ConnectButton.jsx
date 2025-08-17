import { useEffect, useState } from "react";
import { connectWithCompany } from "../api-services/companies";
import { connectWithUser } from "../api-services/users";
import { useAuth } from "../context/userContext";
import { useGetCurrentCompany } from "../hooks";
import PrimaryButton from "./PrimaryButton";

export default function ConnectButton({
  id,
  slug = "",
  type = "users",
  setCachedConnections,
  data,
}) {
  const { user: currentUser } = useAuth();
  const { data: fetchedCompany, isLoading } = useGetCurrentCompany(id, !data);

  const currentCompany = data ? data : fetchedCompany?.[0];

  const [hasConnected, setHasConnected] = useState(
    () => !currentCompany?.isFollowedByUser || false
  );

  useEffect(() => {
    if (type === "users") {
      const isInFollowingList = currentUser?.followings.find(
        (f) => f.type === "user" && f.id === id
      );

      setHasConnected(!!isInFollowingList);
    } else {
      if (Object.keys(currentCompany).includes("isFollowedByUser")) {
        setHasConnected(!!currentCompany?.isFollowedByUser);
        return;
      }
      const followingList = currentCompany?.followers
        ?.flatMap((follower) => [
          follower.company_follower.id,
          follower.user_follower.id,
        ])
        .filter(Boolean);
      if (followingList) {
        const isConnected = followingList.includes(currentUser?.id);
        setHasConnected(isConnected);
      }
    }
  }, [currentUser, currentCompany, id, type]);

  const handleConnect = async () => {
    if (!slug) return;
    if (hasConnected) {
      setCachedConnections?.((prev) => prev - 1);
      setHasConnected(false);
    } else {
      setHasConnected(true);
      setCachedConnections?.((prev) => prev + 1);
    }
    if (type === "users") {
      await connectWithUser(slug, hasConnected);
    } else if (type === "company") {
      await connectWithCompany(slug, hasConnected);
    }
  };

  return (
    <PrimaryButton onClick={handleConnect} disabled={isLoading}>
      {hasConnected ? "Unlink" : "Connect"}
    </PrimaryButton>
  );
}
