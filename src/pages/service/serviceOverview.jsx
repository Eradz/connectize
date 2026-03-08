import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Service Details | Connectize",
    description: "View detailed information about this professional service available on Connectize.",
  keywords: "service details, oil and gas service, professional service overview",
  });

import React from 'react'
// import ServiceMain from "../../components/admin/services/serviceMain";
import OverviewDetails from "../../components/admin/services/overviewDetails";

export default function ServiceOverView() {
  return (
    <section className="grid lg:grid-cols-3 gap-3">
      {/* <ServiceMain isOverview /> */}
      <OverviewDetails />
    </section>
  );
}
