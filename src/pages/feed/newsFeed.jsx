import DiscoverFeed from "../../components/admin/feeds/DiscoverFeed";
import FixedPlusIcon from "../../components/FixedPlusIcon";
import SEO, { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "News Feed | Connectize - Oil & Gas Social Network",
    description: "Stay up to date with the latest oil and gas industry news, insights, and professional updates on Connectize.",
  keywords: "oil and gas news feed, energy industry updates, professional networking, industry insights",
  });

import { getSEOConfig } from "../../lib/seoConfig";

export default function NewsFeed() {
  const seoData = getSEOConfig("feed");

  return (
    <>
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
      />
      <div className="relative">
      <DiscoverFeed />
      <div className="md:hidden fixed bottom-[120px] right-6 z-[9999]">
        <FixedPlusIcon />
      </div>
      </div>
    </>
  );
}
