import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Market Analysis | Connectize",
    description: "Explore market trends, price analysis, and industry data for the oil and gas sector.",
  keywords: "market analysis, oil and gas trends, energy market, price analysis, industry data",
  });

import React from "react";
import Trends from "../../components/admin/analysis/trends";
import Chart from "../../components/admin/analysis/chart";

export default function Analysis() {
  return (
    <>
      <Trends />
      <Chart />
    </>
  );
}
