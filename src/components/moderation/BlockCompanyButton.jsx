/**
 * Block Company Button
 * Allows users to block companies and hide their content
 * App Store Compliance Requirement
 */
import React, { useState, useEffect } from "react";
import { Button } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { blockCompany, unblockCompany, isCompanyBlocked } from "../../api-services/moderation";

const BlockCompanyButton = ({ companyId, companyName, size = "sm", variant = "outline" }) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkBlockStatus();
  }, [companyId]);

  const checkBlockStatus = async () => {
    if (!companyId) return;
    
    setChecking(true);
    try {
      const blocked = await isCompanyBlocked(companyId);
      setIsBlocked(blocked);
    } catch (error) {
      console.error("Error checking company block status:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleBlock = async () => {
    setLoading(true);
    try {
      await blockCompany(companyId);
      setIsBlocked(true);
      
      // Invalidate queries to refresh feed and hide company posts
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['companies']);
    } catch (error) {
      console.error("Error blocking company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      await unblockCompany(companyId);
      setIsBlocked(false);
      
      // Invalidate queries to refresh feed and show company posts again
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['companies']);
    } catch (error) {
      console.error("Error unblocking company:", error);
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
      {isBlocked ? "Unblock" : "Block Company"}
    </Button>
  );
};

export default BlockCompanyButton;
