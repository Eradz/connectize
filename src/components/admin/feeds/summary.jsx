import { Link } from "react-router-dom";
import CustomTabs from "../../custom/tabs";
import HeadingText from "../../HeadingText";
import LightParagraph from "../../ParagraphText";
import PrimaryButton from "../../PrimaryButton";
import { ProductListCard } from "../markets/newlyListed";
import CreatePost from "./CreatePost";
import DiscoverPosts from "./DiscoverPosts";
import { PostCard } from "./DiscoverPostTabs";

function Summary({ company }) {
  return (
    <section className="space-y-8 w-full md:col-span-2">
      <div className="border-b pb-3 w-full">
        <div className="flex pb-3 items-start justify-between">
          <HeadingText>Summary</HeadingText>
          {/* <MoreOptions>
            <div>more options</div>
          </MoreOptions> */}
        </div>
        <LightParagraph>
          This is the summary of{" "}
          <strong className="text-black">{company.company_name}'s</strong>{" "}
          profile
        </LightParagraph>
      </div>

      <SummaryTabs company={company} />
    </section>
  );
}

function SummaryTabs({ company }) {
  const tabsHeading = ["Activities", "Services", "Products"];

  const tabsPanels = [
    <section className="space-y-6 w-full shrink-0">
      {/* <div className="space-y-3">
              <h1 className="text-2xl font-semibold p-1">Activities</h1>
            </div> */}
      <CreatePost />
      {/* <RecommendedProducts /> */}
      <DiscoverPosts companyName={company?.company_name} />
    </section>,
    <div className="">
      <div className="grid gap-x-3 gap-y-4">
        {company?.services?.map((service, index) => (
          <PostCard
            key={index}
            //  image={product?.images?.[0].image}
            companyName={service?.company?.company_name}
            verified={service?.companyInfo?.verified}
            logo={service?.company?.logo}
            title={service?.title}
            summary={service?.sub_title}
            url={`/services/${service?.id}`}
            slug={service?.company?.slug}
            whole={service}
            isService
          />
        ))}
      </div>

      {company?.services?.length ? (
        <div className="mt-6 flex justify-center">
          <Link
            to={`/market?s=services&company=${company.id}---${company.slug}`}
          >
            <PrimaryButton>View more services</PrimaryButton>
          </Link>
        </div>
      ) : null}
    </div>,
    <div className="">
      <div className="p-2 grid gap-x-3 gap-y-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
        {company?.products?.map((product, index) => (
          <ProductListCard
            key={index}
            id={product.id}
            image={product?.images?.[0].image}
            title={product.title}
            subtitle={product.company?.company_name}
            isSummary
          />
        ))}
      </div>
      {company?.products?.length ? (
        <div className="mt-6 flex justify-center">
          <Link to={`/market?company=${company.id}---${company.slug}`}>
            <PrimaryButton>View more products</PrimaryButton>
          </Link>
        </div>
      ) : null}
    </div>,
  ];

  return <CustomTabs tabsHeading={tabsHeading} tabsPanels={tabsPanels} />;
}

export default Summary;
