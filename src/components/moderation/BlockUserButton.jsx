/**
 * Block User Button
 * Allows users to block abusive users
 * App Store Compliance Requirement
 */
import React, { useState, useEffect } from "react";
import { Button } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { blockUser, unblockUser, isUserBlocked } from "../../api-services/moderation";

const BlockUserButton = ({ userId, userName, size = "sm", variant = "outline" }) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkBlockStatus();
  }, [userId]);

  const checkBlockStatus = async () => {
    if (!userId) return;
    
    setChecking(true);
    try {
      const blocked = await isUserBlocked(userId);
      setIsBlocked(blocked);
    } catch (error) {
      console.error("Error checking block status:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleBlock = async () => {
    setLoading(true);
    try {
      await blockUser(userId);
      setIsBlocked(true);
      
      // Invalidate queries to refresh feed and hide blocked user's content
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['comments']);
    } catch (error) {
      console.error("Error blocking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      await unblockUser(userId);
      setIsBlocked(false);
      
      // Invalidate queries to refresh feed and show user's content again
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['comments']);
    } catch (error) {
      console.error("Error unblocking user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return null; // or a skeleton loader
  }

  return (
    <Button
      size={size}
      variant={variant}
      colorScheme={isBlocked ? "gray" : "red"}
      onClick={isBlocked ? handleUnblock : handleBlock}
      isLoading={loading}
      className="!text-sm"
    >
      {isBlocked ? "Unblock" : "Block User"}
    </Button>
  );
};

export default BlockUserButton;
