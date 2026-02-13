import DiscoverFeed from "../../components/admin/feeds/DiscoverFeed";
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
      <DiscoverFeed />
    </>
  );
}
