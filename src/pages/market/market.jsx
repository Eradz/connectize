import { Link, useSearchParams } from "react-router";
import Carousel from "../../components/admin/markets/carousel";
import NewlyListed from "../../components/admin/markets/newlyListed";
import SEO from "../../components/SEO";
import HeadingText from "../../components/HeadingText";
import ServiceMain from "../../components/admin/services/serviceMain";
import { useGetSingleCompany } from "../../hooks";

function constructUrlWithParams({ isServices = false, company, pcat, scat }) {
  const url = new URL(
    process.env.NODE_ENV === "production"
      ? "https://connectize.co/market"
      : "http://localhost:3000/market"
  );

  if (isServices) url.searchParams.set("s", "services");
  if (company) url.searchParams.set("company", company);
  if (pcat) url.searchParams.set("pcat", pcat);
  if (scat) url.searchParams.set("scat", scat);

  return url.toString();
}

export default function Market() {
  const [searchParams] = useSearchParams();

  /**
   * @expects id-slug
   * @example 2-the large company
   */
  const companyParam = searchParams.get("company") || "";
  const splittedCompanyParam = companyParam.split("---");
  const companyId = splittedCompanyParam[0] || null;
  const companySlug = splittedCompanyParam[1] || null;

  const productCategory = searchParams.get("pcat")?.trim();
  const serviceCategory = searchParams.get("scat")?.trim();

  const isShowingServices = searchParams.get("s") === "services";

  const { data: companyDetails, isLoading: isLoadingCompanyDetails } =
    useGetSingleCompany(companySlug, { enabled: !!companySlug });

  return (
    <section className="space-y-8 w-full bg-background">
      <SEO
        title="Connectize Marketplace"
        description="Discover Connectize, Connect with trusted suppliers and buyers, explore the latest listings, and grow your business in the global energy sector."
      />

      <div className="flex items-center container">
        <div className="flex-1">
          <HeadingText>Market</HeadingText>
          <div className="">
            {companySlug &&
              (isLoadingCompanyDetails ? (
                <div className="inline-block w-1/3 h-4 skeleton rounded mt-2" />
              ) : (
                <HeadingText heading="sub-heading">
                  <Link to={"/" + companySlug} className="!text-gold">
                    @{companyDetails?.company_name}
                  </Link>{" "}
                </HeadingText>
              ))}
          </div>
        </div>
        <div className="flex items-center bg-tabs p-1 w-fit rounded-full text-sm">
          <Link
            to={constructUrlWithParams({
              company: companyParam,
              pcat: productCategory,
              scat: serviceCategory,
            })}
            className={`${
              !isShowingServices ? "bg-white" : ""
            } rounded-full px-4 py-1`}
          >
            Products
          </Link>
          <Link
            to={constructUrlWithParams({
              isServices: true,
              company: companyParam,
              pcat: productCategory,
              scat: serviceCategory,
            })}
            className={`text-decoration-none ${
              isShowingServices ? "bg-white" : ""
            } px-4 py-1 rounded-full`}
          >
            Services
          </Link>
        </div>
      </div>

      <div className="container">
        {!companySlug && !isShowingServices && <Carousel />}
      </div>
      {isShowingServices ? (
        <div className="container">
          <ServiceMain companyId={companyId} category={serviceCategory} />
        </div>
      ) : (
        <NewlyListed companyId={companyId} category={productCategory} />
      )}
    </section>
  );
}
