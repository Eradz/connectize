import DiscoverFeed from "../../components/admin/feeds/DiscoverFeed";
import FixedPlusIcon from "../../components/FixedPlusIcon";
import SEO from "../../components/SEO";
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
