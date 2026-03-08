import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Product Listing | Connectize Marketplace",
    description: "Browse and list products and equipment for the oil and gas industry on Connectize Marketplace.",
  keywords: "product listing, marketplace, oil and gas equipment, industry supplies",
  });

import React from "react";
import NewListing from "../../components/admin/listing/newListing";
import { useAuth } from "../../context/userContext";
import { UserType } from "../../lib/helpers/types";
import Restricted from "../../components/Restricted";

export default function Listing() {
  const { user: currentUser } = useAuth();
  return currentUser?.user_type === UserType ? (
    <Restricted fallback="creating a new product" />
  ) : (
    <NewListing />
  );
}
