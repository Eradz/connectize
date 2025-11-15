import { LocationOnOutlined } from "@mui/icons-material";
import { EnvelopeClosedIcon, GlobeIcon, DotsHorizontalIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Reviews from "../../components/admin/feeds/reviews";
import Summary from "../../components/admin/feeds/summary";
import { SuggestionList } from "../../components/admin/feeds/TopServiceSuggestions";
import ListedProducts from "../../components/admin/products/listedProducts";
import NoPage from "../../components/NoPage";
import PageLoading from "../../components/PageLoading";
import LightParagraph from "../../components/ParagraphText";
import SEO, { createSEO } from "../../components/SEO";
import Header from "../../components/userProfile/header";
import ProfileSection from "../../components/userProfile/profile-section";
import { useAuth } from "../../context/userContext";
import { usePollCurrentCompany } from "../../hooks/usePolling";
import { CompanyUserType } from "../../lib/helpers/types";
import { capitalizeFirst, formatNumber } from "../../lib/utils";
import { ProfileAboutList } from "./userProfile";
import BlockCompanyButton from "../../components/moderation/BlockCompanyButton";
import ReportModal from "../../components/moderation/ReportModal";
import { Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";

export const meta = () =>
  createSEO({
    title: "Connectize Companies",
  });

const CompanyProfile = React.memo(() => {
  const { company: companyName } = useParams();
  const { user: currentUser } = useAuth();

  const { data: company, isLoading } = usePollCurrentCompany(companyName);

  const headerProps = useMemo(
    () => ({
      banner: company?.banner || "",
      name: company?.company_name || "",
      logo: company?.logo || "images/default-company-logo.png",
    }),
    [company]
  );

  if (isLoading)
    return <PageLoading text="Getting profile ready..." hasLogo={false} />;

  if (!company) return <NoPage />;

  return (
    <section className="rounded-md overflow-hidden w-full">
      {/* <SEO title={`${company?.company_name || ""} | Connectize Companies`} /> */}
      <Header {...headerProps} />

      <section className="mt-12 md:mt-20 flex max-xl:flex-col items-start gap-2 relative sm:px-2">
        {currentUser?.email === company?.profile &&
          currentUser?.user_type === CompanyUserType && (
            <ManageRepresentativesLink main />
          )}
        <ProductSidebar company={company} />
        <ProfileSection className="max-xl:w-full grid grid-cols-1 gap-2 max-lg:py-2 flex-1">
          <Summary company={company} />
        </ProfileSection>
      </section>
    </section>
  );
});

export const ManageRepresentativesLink = ({ main = false }) => {
  return (
    <Link
      to="/co/representatives/manage"
      className={clsx(
        "bg-gold hover:bg-opacity-60 text-sm xs:text-xs lg:text-sm font-semibold py-1.5 px-4 h-fit rounded-full block shrink-0",
        {
          "absolute right-0 -top-9 md:-top-14": main,
        }
      )}
    >
      Manage Representatives
    </Link>
  );
};

const ProductSidebar = React.memo(({ company }) => {
  const stats = useMemo(
    () => [
      formatNumber(company?.products?.length || 0) + "/ products",
      formatNumber(company?.followers?.length || 0) + "/ followers",
      formatNumber(company?.following?.length || 0) + "/ following",
      formatNumber(company?.reviews?.length || 0) + "/ Reviews",
    ],
    [company]
  );

  const { user: currentUser } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  const isCurrentUser = currentUser?.id === company?.user?.id;

  return (
    <section className="space-y-8 max-lg:mb-4 w-full xl:max-w-[350px] 2xl:max-w-[400px] shrink-0">
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-2xl font-bold capitalize">
            {company?.company_name}
          </h1>
          {company?.tag_line && (
            <small className="text-gray-500 truncate block">
              {capitalizeFirst(company?.tag_line)}
            </small>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
          {stats.map((text, index) => (
            <StatsText key={index} text={text} />
          ))}
        </div>
        
        {!isCurrentUser && (
          <div className="flex items-center gap-2">
            <BlockCompanyButton 
              companyId={company?.id} 
              companyName={company?.company_name}
            />
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<DotsHorizontalIcon />}
                variant="ghost"
                size="sm"
                aria-label="More options"
              />
              <MenuList>
                <MenuItem 
                  icon={<ExclamationTriangleIcon />}
                  onClick={() => setShowReportModal(true)}
                >
                  Report Company
                </MenuItem>
              </MenuList>
            </Menu>
            
            <ReportModal
              isOpen={showReportModal}
              onClose={() => setShowReportModal(false)}
              contentType="company"
              contentId={company?.id}
              reportedUserId={null}
            />
          </div>
        )}
      </section>
      <ProfileSection title="About" className="!relative">
        {isCurrentUser && (
          <>
            <Link
              to={`/${company?.slug || ""}/edit-profile`}
              className="absolute top-3.5 right-2.5 text-sm !text-gray-500 hover:!text-black hover:bg-gray-100 px-2 py-1 rounded"
            >
              Edit Information
            </Link>
          </>
        )}

        <LightParagraph>
          {company?.about || "No about added yet"}
        </LightParagraph>
        <ul className="space-y-4 divide-y">
          {company?.office_address && (
            <ProfileAboutList
              Icon={LocationOnOutlined}
              title="Location"
              value={`${company?.office_address || "No office address"} ${
                company?.city || ""
              }, ${company?.state || ""}. ${company?.country || ""}`}
            />
          )}
          {company?.website && (
            <ProfileAboutList
              Icon={GlobeIcon}
              title="Website"
              value={company?.website || "No website added"}
            />
          )}
          {company?.email && (
            <ProfileAboutList
              Icon={EnvelopeClosedIcon}
              title="Company Email"
              value={company?.email || "No Email"}
            />
          )}
          {/* <ProfileAboutList
            Icon={Link1Icon}
            title="Links"
            value={`${company?.website } ${company?.email}` || "No Links"}
          /> */}
        </ul>
      </ProfileSection>
      <ProfileSection title="People Associated" className="h-fit">
        <SuggestionList
          hasSeeMore
          associated
          thisUser={company.user}
          companyId={company.id}
          viewMoreUrl={`/co/representatives/?company=${company?.id}---${company?.slug}`}
        />
      </ProfileSection>
      <ListedProducts company={company} />
      <Reviews reviews={company?.reviews} />
    </section>
  );
});

export const StatsText = React.memo(({ text }) => {
  const [mainText, subText] = text.split("/");
  return (
    <div className="bg-gray-200/80 py-2 px-3 rounded-full md:text-xs text-sm shrink-0">
      <span className="text-black font-semibold">{mainText}</span>
      <span className="text-gray-500">{subText}</span>
    </div>
  );
});

export default CompanyProfile;
