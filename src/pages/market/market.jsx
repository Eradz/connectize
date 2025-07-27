import { Link, useSearchParams } from "react-router-dom";
import Carousel from "../../components/admin/markets/carousel";
import NewlyListed from "../../components/admin/markets/newlyListed";
import SEO from "../../components/SEO";
import HeadingText from "../../components/HeadingText";
import ServiceMain from "../../components/admin/services/serviceMain";
import { useGetSingleCompany } from "../../hooks";

export default function Market() {
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * @expects id-slug
   * @example 2-the large company
   */
  const companyParam = searchParams.get("company") || "";
  const splittedCompanyParam = companyParam.split("---");
  const companyId = splittedCompanyParam[0] || null;
  const companySlug = splittedCompanyParam[1] || null;

  const isShowingServices = searchParams.get("s") === "services";

  const { data: companyDetails, isLoading: isLoadingCompanyDetails } =
    useGetSingleCompany(companySlug, { enabled: !!companySlug });

  return (
    <section className="space-y-8 w-full bg-background">
      <SEO
        title="Connectize Marketplace"
        description="Discover Connectize, Connect with trusted suppliers and buyers, explore the latest listings, and grow your business in the global energy sector."
      />

      <div className="mx-auto flex items-center justify-center bg-tabs p-1 w-fit rounded-full text-sm">
        <Link
          // onClick={() => {
          //   setSearchParams((p) => {
          //     p.delete("s");

          //     return p;
          //   });
          // }}
          to={"/market" + companyParam ? `?company=${companyParam}` : ""}
          className={`${
            !isShowingServices ? "bg-white" : ""
          } rounded-full px-4 py-1`}
        >
          Market
        </Link>
        <Link
          // onClick={() => {
          //   setSearchParams((p) => {
          //     p.set("s", "services");

          //     return p;
          //   });
          // }}
          to={
            `/market?s=services` +
            (companyParam ? `&company=${companyParam}` : "")
          }
          className={`text-decoration-none ${
            isShowingServices ? "bg-white" : ""
          } px-4 py-1 rounded-full`}
        >
          Services
        </Link>
      </div>
      <div className="container">
        {companySlug && (
          <HeadingText heading="sub-heading">
            Market{" "}
            {isLoadingCompanyDetails ? (
              <div className="inline-block w-1/3 h-4 skeleton rounded mt-2" />
            ) : (
              <Link to={"/" + companySlug} className="!text-gold">
                @{companyDetails?.company_name}
              </Link>
            )}
          </HeadingText>
        )}
      </div>
      {!companySlug && !isShowingServices && <Carousel />}
      {isShowingServices ? (
        <div className="container">
          <ServiceMain companyId={companyId} />
        </div>
      ) : (
        <NewlyListed companyId={companyId} />
      )}
    </section>
  );
}
