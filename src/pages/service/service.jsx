import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "../../components/SEO",
    description: "Services | Connectize",
  keywords: "Discover and explore professional services offered by oil and gas industry providers on Connectize.",
  relativeImagePath: "oil and gas services, professional services, energy industry, service providers",
  });

import React, { useEffect } from "react";
import ServiceMain from "../../components/admin/services/serviceMain";
import { CreateNewLink } from "../../components/admin/markets/carousel";

export default function Services() {
  useEffect(() => {
    document.title = "Services on connectize | Services";
  }, []);

  return (
    <main className="min-h-screen">
      <ServiceMain />
      <CreateNewLink url="add" text="Add new service" />
    </main>
  );
}
