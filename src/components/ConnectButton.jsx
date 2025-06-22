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
  const { data: currentCompany, isLoading } = useGetCurrentCompany();

  const [hasConnected, setHasConnected] = useState(false);

  useEffect(() => {
    const followingList =
      type === "users"
        ? currentUser?.followings
        : currentCompany?.[0]?.following?.map((c) => c.company_following.id);

    if (followingList) {
      const isConnected = followingList.includes(id);
      setHasConnected(isConnected);
      console.log(followingList, id, hasConnected, isConnected);
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
