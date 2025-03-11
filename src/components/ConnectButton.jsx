import { Button } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { connectWithUser } from "../api-services/users";
import { toast } from "sonner";
import { useAuth } from "../context/userContext";
import { connectWithCompany } from "../api-services/companies";

export default function ConnectButton({
  id,
  type = "users",
  setCachedConnections,
  first_name,
}) {
  const { user: currentUser } = useAuth();

  const isConnected = currentUser?.followings.includes(id);

  const [hasConnected, setHasConnected] = useState(isConnected);

  useEffect(() => {
    setHasConnected(isConnected);
  }, [isConnected]);

  const handleConnect = async () => {
    if (!id) return;
    if (hasConnected) {
      setCachedConnections?.((prev) => prev - 1);
      setHasConnected(false);
    } else {
      setHasConnected(true);
      setCachedConnections?.((prev) => prev + 1);
    }
    if (type === "users") {
      await connectWithUser(id, hasConnected);
    } else if (type === "company") {
      await connectWithCompany(id, hasConnected);
    }
  };

  return (
    <Button
      className="!bg-gold w-fit !px-10 !py-1.5 !h-fit !rounded-full transition-all duration-300 active:scale-95 !text-sm hover:!bg-opacity-50"
      onClick={handleConnect}
    >
      {hasConnected ? "Unlink" : "Connect"}
    </Button>
  );
}
