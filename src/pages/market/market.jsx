import Carousel from "../../components/admin/markets/carousel";
import NewlyListed from "../../components/admin/markets/newlyListed";
import SEO from "../../components/SEO";

export default function Market() {
  return (
    <section className="space-y-16 w-full bg-background">
      <SEO
        title="Connectize Marketplace"
        description="Discover Connectize, Connect with trusted suppliers and buyers, explore the latest listings, and grow your business in the global energy sector."
      />
      <Carousel />
      <NewlyListed />
    </section>
  );
}
