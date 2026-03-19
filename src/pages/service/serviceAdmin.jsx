import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Manage Services | Connectize",
    description: "Add and manage your professional services on Connectize to reach oil and gas industry clients.",
  keywords: "add service, manage services, oil and gas providers, service management",
  });

import React from 'react'
import ServiceAdminMain from '../../components/admin/services/serviceAdminMain'
import { useAuth } from "../../context/userContext";
import { UserType } from "../../lib/helpers/types";
import Restricted from "../../components/Restricted";

export default function ServiceAdmin() {
  const { user: currentUser } = useAuth();
  return currentUser?.user_type === UserType ? (
    <Restricted fallback="adding a new service" />
  ) : (
    <ServiceAdminMain />
  );
}
