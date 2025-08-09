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
}) {
  const { user: currentUser } = useAuth();
  const { data: currentCompany, isLoading } = useGetCurrentCompany(id);

  const [hasConnected, setHasConnected] = useState(false);

  useEffect(() => {
    if (type === "users") {
      const isInFollowingList = currentUser?.followings.find(
        (f) => f.type === "user" && f.id === id
      );

      setHasConnected(!!isInFollowingList);
    } else {
      const followingList = currentCompany?.[0]?.followers
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
    // const followingList =
    //   type === "users"
    //     ? currentUser?.followings
    //     : currentCompany?.[0]?.followers?.flatMap(follower => [follower.company_follower.id, follower.user_follower.id]).filter(Boolean);
    // if (followingList) {
    //   const isConnected = followingList.includes(currentUser?.id);
    //   setHasConnected(isConnected);
    // }
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
