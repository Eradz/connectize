import { LocationOnOutlined } from "@mui/icons-material";
import {
  EnvelopeClosedIcon,
  GlobeIcon,
  DotsHorizontalIcon,
  ExclamationTriangleIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, Button, Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import Reviews from "../../components/admin/feeds/reviews";
import Summary from "../../components/admin/feeds/summary";
import { SuggestionList } from "../../components/admin/feeds/TopServiceSuggestions";
import ListedProducts from "../../components/admin/products/listedProducts";
import NoPage from "../../components/NoPage";
import PageLoading from "../../components/PageLoading";
import LightParagraph from "../../components/ParagraphText";
import SEO, { createSEO } from "../../components/SEO";
import { getSEOConfig } from "../../lib/seoConfig";
import Header from "../../components/userProfile/header";
import ProfileSection from "../../components/userProfile/profile-section";
import { useAuth } from "../../context/userContext";
import { reportView, VIEW_TARGETS } from "../../api-services/engagement";
import { usePollCurrentCompany } from "../../hooks/usePolling";
import { useGetActionableCompanies } from "../../hooks";
import { BarChart3 } from "lucide-react";
import { CompanyUserType } from "../../lib/helpers/types";
import { capitalizeFirst, formatNumber } from "../../lib/utils";
import { EventsSection, ProfileAboutList } from "./userProfile";
import BlockCompanyButton from "../../components/moderation/BlockCompanyButton";
import InviteCompanyModal from "../../components/company/InviteCompanyModal";
import ReportModal from "../../components/moderation/ReportModal";
import Scroll from "../../components/Scroll";
import { webRoutes } from "../../lib/webRoutes";
import { workforceAPI } from "../../api-services/workforce";
import ApplicationJobsCard from "../../components/workforce/ApplicationJobsCard";
import { DealRoomCard } from "../../components/dealRoom/DealRoomCard";
import { Briefcase, Calendar, FileText } from "lucide-react";
import { dealRoomService } from "../../api-services/oilgas";
import { listingService } from "../../api-services/marketplace";
import CreatePost from "../../components/admin/feeds/CreatePost";
import DiscoverPosts from "../../components/admin/feeds/DiscoverPosts";
import RegistryVerificationBadge from "../../components/company/RegistryVerificationBadge";
import { PostCard } from "../../components/admin/feeds/DiscoverPostTabs";
import PrimaryButton from "../../components/PrimaryButton";
import { ProductListCard } from "../../components/admin/markets/newlyListed";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import HeadingText from "../../components/HeadingText";
import ConnectButton from "../../components/ConnectButton";
import { VerifiedIcon } from "../../icon";

export const meta = () =>
  createSEO({
    title: "Connectize Companies",
  });

const normalizeStoreListings = (storeData) => {
  const listings =
    storeData?.listings?.results ||
    storeData?.listings ||
    storeData?.results ||
    storeData?.data ||
    [];
  return Array.isArray(listings) ? listings.filter(Boolean) : [];
};

const normalizeListResponse = (response) => {
  const payload = response?.data ?? response;
  const list = payload?.results ?? payload;
  return Array.isArray(list) ? list.filter(Boolean) : [];
};

const isServiceListing = (listing) =>
  String(listing?.listing_type || listing?.type || "").toLowerCase() === "service";

const getListingImage = (listing) => {
  const images = Array.isArray(listing?.images) ? listing.images : [];
  const primaryImage = images.find((image) => image?.is_primary) || images[0];
  return (
    primaryImage?.image ||
    primaryImage?.url ||
    primaryImage?.image_url ||
    listing?.image ||
    listing?.image_url ||
    listing?.thumbnail ||
    ""
  );
};

const getListingSummary = (listing) =>
  listing?.short_description ||
  listing?.description ||
  listing?.sub_title ||
  listing?.subtitle ||
  listing?.category_name ||
  listing?.category ||
  "";

const getListingCompanyName = (listing) =>
  listing?.seller_company_name ||
  listing?.company?.company_name ||
  listing?.seller?.company_name ||
  "";

const EmptyMarketplaceTab = ({ title, description }) => (
  <div className="py-12 text-center">
    <h3 className="text-gray-900 font-medium mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">{description}</p>
  </div>
);

// Placeholder "who's in your circle" avatars, used purely for the little
// overlapping avatar stack next to the Circle/Linked counts — real
// membership data isn't available on the company payload yet.
const CIRCLE_PREVIEW_ACCOUNTS = [
  { id: 1, name: "Hudeen", avatar: "images/user1.jpg" },
  { id: 2, name: "Bessie Cooper", avatar: "images/user2.jpg" },
  { id: 3, name: "Eleanor Pena", avatar: "images/user3.jpg" },
];

const AvatarStack = ({ people = [], label }) => (
  <div className="flex items-center gap-2">
    <div className="flex -space-x-2">
      {people.slice(0, 4).map((p) => (
        <Avatar
          key={p.id}
          src={p.avatar}
          name={p.name}
          size="xs"
          className="!border-2 !border-white"
        />
      ))}
    </div>
    {label && <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>}
  </div>
);

const CompanyProfile = React.memo(() => {
  const baseSeoData = getSEOConfig("companyProfile");
  const { company: companyName } = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Activity");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { data: company, isLoading } = usePollCurrentCompany(companyName);
  const companyDisplayName = company?.company_name || companyName;

  // The owner always has this permission implicitly; a representative needs
  // it granted explicitly. Same endpoint already used to gate "Create
  // listing", "Post job" etc. elsewhere in the app - see useGetActionableCompanies.
  const { data: analyticsCompanies = [] } = useGetActionableCompanies("company_view_analytics");
  const canViewCompanyActivity = analyticsCompanies.some((c) => c.id === company?.id);

  // Record the company-page view for the owner's "who viewed you" list.
  // Fire-and-forget, de-duplicated server-side, skipped for your own company.
  useEffect(() => {
    if (!company?.id) return;
    if (currentUser?.id && String(company?.profile) === String(currentUser.id)) return;
    reportView(VIEW_TARGETS.company, company.id, "web_company");
  }, [company?.id, company?.profile, currentUser?.id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [dealRooms, setDealRooms] = useState([]);
  const [marketplaceListings, setMarketplaceListings] = useState([]);

  const isCurrentUser = currentUser?.id === company?.user?.id;
  const editCompanyName = companyName || company?.slug || company?.company_name || company?.id;

  const loadMyRegistrations = async () => {
    try {
      setLoading(true);
      const response = await workforceAPI.getEvents();
      setRegistrations(
        normalizeListResponse(response).filter(
          event => event?.organizer_company_name === companyDisplayName
        )
      );
      setError(null);
    } catch (err) {
      console.error('Error loading registrations:', err);
      setError('Failed to load your event registrations. Please try again.');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCreatedJobs = async () => {
    try {
      setLoading(true);
      const response = await workforceAPI.getJobs();
      const data = normalizeListResponse(response).filter(job => job?.company_name == companyDisplayName);
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDealRooms = async () => {
    if (!company?.id) return;
    try {
      setLoading(true);
      const response = await dealRoomService.getAll(1, 4, {});
      const allRooms = response?.results || response?.data || response;
      const rooms = Array.isArray(allRooms) ? allRooms.filter(room => room?.company == company.id) : [];
      setDealRooms(rooms);
    } catch (error) {
      console.error('Failed to load deal rooms:', error);
      setDealRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyRegistrations();
    loadCreatedJobs();
  }, [companyDisplayName]);

  useEffect(() => {
    loadDealRooms();
  }, [company?.id]);

  useEffect(() => {
    const loadCompanyMarketplaceListings = async () => {
      if (!company?.id) {
        setMarketplaceListings([]);
        return;
      }

      try {
        const storeData = await listingService.getStoreProfile(company.id, { page_size: 100 });
        setMarketplaceListings(normalizeStoreListings(storeData));
      } catch (error) {
        console.error("Failed to load company marketplace listings:", error);
        setMarketplaceListings([]);
      }
    };

    loadCompanyMarketplaceListings();
  }, [company?.id]);

  const marketplaceServices = useMemo(
    () => marketplaceListings.filter(isServiceListing),
    [marketplaceListings]
  );

  const marketplaceProducts = useMemo(
    () => marketplaceListings.filter((listing) => !isServiceListing(listing)),
    [marketplaceListings]
  );

  const headerProps = useMemo(
    () => ({
      banner: company?.banner || "",
      name: company?.company_name || "",
      logo: company?.logo || "images/default-company-logo.png",
    }),
    [company]
  );

  const circleCount = formatNumber(company?.followers_count || 0);
  const linkedCount = formatNumber(company?.connections_count || company?.followers_count || 0);
  const othersLinkedCount = formatNumber(
    Math.max((company?.followers_count || 0) - CIRCLE_PREVIEW_ACCOUNTS.length, 0)
  );

  if (isLoading)
    return <PageLoading text="Getting profile ready..." hasLogo={false} />;

  if (!company) return(
    <section className="min-h-[70vh] w-full flex flex-col items-center justify-center space-y-3">
      <DotLottieReact
        src="/lottie/notfound.lottie"
        loop
        autoplay
        className="size-10/12 xs:size-1/2 md:size-56 overflow-hidden scale-150 aspect-square"
      />
      <HeadingText>Company not found</HeadingText>
      <div className="flex gap-2">
        <button
          className="bg-gray-200 py-1.5 xs:text-sm px-6 xs:px-10 rounded-full"
          onClick={() => window.history.back()}
        >
          Go back
        </button>
        <Link
          to="/"
          className="bg-gold py-1.5 xs:text-sm px-6 xs:px-10 rounded-full"
        >
          Go Home
        </Link>
      </div>
    </section>
  );

  // Dynamic SEO for company profile
  const seoTitle = company?.company_name
    ? `${company.company_name} | Connectize`
    : baseSeoData.title;
  const seoDescription = company?.company_description || baseSeoData.description;

  return (
    <section className= "flex flex-col md:flex-row gap-4 max-w-screen-xl mx-auto w-full md:my-4">
      <section className="rounded-md overflow-hidden w-full bg-white">
        <SEO
          title={seoTitle}
          description={seoDescription}
          keywords={baseSeoData.keywords}
        />

        <Header {...headerProps} />

        {/* Name / verified badge / tagline / circle+linked stats / action buttons —
            sits right under the overlapping logo, mirroring the target layout. */}
        <div className="mt-12 md:mt-24 px-4 md:px-8 pb-4 mb-4 rounded-xl shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {company?.company_name}
                </h1>
                {company?.verified && (
                  <VerifiedIcon color="black" className="black !size-4 shrink-0" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                <span className="text-gray-700">
                  Circle <span className="font-semibold">{circleCount}+</span>
                </span>
                <span className="text-gray-700">
                  Linked <span className="font-semibold">{linkedCount}+</span>
                </span>
              </div>

              {(company?.about || company?.company_description) && (
                <p className="text-sm text-gray-500 mt-1 max-w-xl ">
                  {company?.about || company?.company_description}
                </p>
              )}


              <div className="mt-2">
                <AvatarStack
                  people={CIRCLE_PREVIEW_ACCOUNTS}
                  label={`${CIRCLE_PREVIEW_ACCOUNTS[0]?.name} & ${othersLinkedCount} Others Linked`}
                />
              </div>
            </div>

            {/* Link Up / Message / More actions */}
            <div className="flex items-center gap-2 shrink-0">
              <ConnectButton
                id={company?.id}
                slug={company?.slug}
                type="company"
                connection_status={company?.connection_status}
                data={company}
              />

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
                reportedUserId={company?.id}
              />
            </div>
          </div>

          {currentUser?.email === company?.profile &&
            currentUser?.user_type === CompanyUserType && (
              <div className="flex gap-2 flex-wrap mt-4">
                <ManageRepresentativesLink main />
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="border border-gold hover:bg-gold/10 transition-colors text-sm font-medium py-2 px-4 rounded-full whitespace-nowrap"
                >
                  Invite a Company
                </button>
                <InviteCompanyModal
                  isOpen={showInviteModal}
                  onClose={() => setShowInviteModal(false)}
                  companySlug={company?.slug}
                />
              </div>
            )}

        </div>

        {/* Tabs + right sidebar */}
        <section className="flex max-xl:flex-col  items-start gap-4 relative sm:px-4 md:px-8 pb-8">
          <div className="flex-1 min-w-0 w-full">
            <Scroll>
              <div className="flex gap-6 min-w-min mb-2 text-[14px]  bg-background">
                {["Activity", "About", "Deals", "Events", "Projects", "Workforce"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                      "pb-1 px-1 font-normal whitespace-nowrap relative",
                      activeTab === tab
                        ? "text-black font-medium"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"></span>
                    )}
                  </button>
                ))}
              </div>
            </Scroll>

            {activeTab === "Activity" && (
              <section className="space-y-6 w-full shrink-0">
                <CreatePost />
                <DiscoverPosts companyName={company?.company_name} companyId={company?.id} />
              </section>
            )}

            {activeTab === "About" && (
              <CompanyAboutContent company={company} isCurrentUser={isCurrentUser} editCompanyName={editCompanyName} />
            )}

            {activeTab === "Deals" && (dealRooms.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Deals</h2>
                  <Link to={webRoutes.dealRooms} className="bg-gold p-2 rounded-lg">Visit Deals</Link>
                </div>

                <div className="md:bg-white border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dealRooms.slice(0, 3).map((dealRoom) => (
                    <DealRoomCard key={dealRoom.id} deal={dealRoom} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 font-medium mb-2">No Deals</h3>
                <p className="text-gray-500 text-sm">This user hasn't posted any deals yet</p>
              </div>
            ))}

            {activeTab === "Events" && (registrations.length > 0 ? (
              <EventsSection company={registrations} title={"Events"} />
            ) : (
              <div className="py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 font-medium mb-2">No Events</h3>
                <p className="text-gray-500 text-sm">This user hasn't created any events yet</p>
              </div>
            ))}

            {activeTab === "Projects" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-base font-semibold mb-3">Services</h3>
                  {marketplaceServices.length ? (
                    <div className="grid gap-x-3 gap-y-4">
                      {marketplaceServices.map((service) => (
                        <PostCard
                          key={service.id}
                          companyName={getListingCompanyName(service)}
                          verified={service?.company?.verified || service?.seller_company_verified}
                          logo={service?.company?.logo || service?.seller_company_logo}
                          title={service?.title}
                          summary={getListingSummary(service)}
                          url={`/marketplace/listing/${service?.id}`}
                          slug={service?.company?.slug || company?.slug}
                          whole={service}
                          isService
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyMarketplaceTab
                      title="No Marketplace Services"
                      description="This company has not listed any marketplace services yet."
                    />
                  )}
                  {marketplaceServices.length ? (
                    <div className="mt-6 flex justify-center">
                      <Link to={webRoutes.marketplace}>
                        <PrimaryButton>View more services</PrimaryButton>
                      </Link>
                    </div>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Products</h3>
                  {marketplaceProducts.length ? (
                    <div className="p-2 grid gap-x-3 gap-y-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                      {marketplaceProducts.map((product) => (
                        <ProductListCard
                          key={product.id}
                          id={product.id}
                          to={`/marketplace/listing/${product.id}`}
                          image={getListingImage(product)}
                          title={product.title}
                          subtitle={getListingCompanyName(product)}
                          isSummary
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyMarketplaceTab
                      title="No Marketplace Products"
                      description="This company has not listed any marketplace products yet."
                    />
                  )}
                  {marketplaceProducts.length ? (
                    <div className="mt-6 flex justify-center">
                      <Link to={webRoutes.marketplace}>
                        <PrimaryButton>View more products</PrimaryButton>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {activeTab === "Workforce" && (
              applications.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold mb-4">Created jobs</h2>
                    <Link to={webRoutes.workforceJobs} className="bg-gold p-2 rounded-lg">All Jobs</Link>
                  </div>

                  {applications.slice(0, 3).map((job) => (
                    <ApplicationJobsCard key={job.id} job={job} setApplications={setApplications} profile={"company"} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 font-medium mb-2">No Workforce</h3>
                  <p className="text-gray-500 text-sm">This company has no workforce jobs</p>
                </div>
              )
            )}
          </div>

        
        </section>
      </section>
       <CompanySidebar
          company={company}
          dealRooms={dealRooms}
          applications={applications}
        />
    </section>
  );
});

export const ManageRepresentativesLink = ({ main = false }) => {
  return (
    <Link
      to="/co/representatives/manage"
      className="bg-gold hover:bg-custom_yellow transition-colors text-sm font-medium py-2 px-4 rounded-full whitespace-nowrap"
    >
      {main ? "Manage Representatives" : "Manage"}
    </Link>
  );
};

// "About" tab content — the Summary / Registry badge / location / website /
// email block that used to live permanently in the left sidebar.
const CompanyAboutContent = React.memo(({ company, isCurrentUser, editCompanyName }) => {
  return (
    <section className="space-y-4 max-w-2xl">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Summary</h2>
          {isCurrentUser && (
            <Link
              to={webRoutes.companyEditProfile.replace(":company", editCompanyName)}
              aria-label="Edit summary"
              className="text-gray-500 hover:text-black"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.334 2.00004L14 4.66671M1.33398 14.6667L3.42998 14.3907C3.70189 14.3578 3.83785 14.3413 3.96646 14.3019C4.08041 14.2672 4.18965 14.2182 4.29146 14.1562C4.40647 14.0864 4.50793 13.9949 4.71084 13.792L14.0007 4.50204C14.7371 3.76562 14.7371 2.56846 14.0007 1.83204C13.2642 1.09562 12.0671 1.09562 11.3307 1.83204L2.04065 11.122C1.83774 11.3249 1.73629 11.4264 1.66646 11.5414C1.60453 11.6432 1.55562 11.7524 1.52094 11.8664C1.48156 11.995 1.46509 12.131 1.43214 12.4029L1.33398 14.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {company?.about || "No summary added yet."}
        </p>
      </div>

      <RegistryVerificationBadge company={company} editable={isCurrentUser} />

      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">ABOUT</h2>
          {isCurrentUser && (
            <Link
              to={webRoutes.companyEditProfile.replace(":company", editCompanyName)}
              aria-label="Edit company information"
              className="text-gray-500 hover:text-black"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.334 2.00004L14 4.66671M1.33398 14.6667L3.42998 14.3907C3.70189 14.3578 3.83785 14.3413 3.96646 14.3019C4.08041 14.2672 4.18965 14.2182 4.29146 14.1562C4.40647 14.0864 4.50793 13.9949 4.71084 13.792L14.0007 4.50204C14.7371 3.76562 14.7371 2.56846 14.0007 1.83204C13.2642 1.09562 12.0671 1.09562 11.3307 1.83204L2.04065 11.122C1.83774 11.3249 1.73629 11.4264 1.66646 11.5414C1.60453 11.6432 1.55562 11.7524 1.52094 11.8664C1.48156 11.995 1.46509 12.131 1.43214 12.4029L1.33398 14.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 shrink-0">
              <path d="M14.7137 13.8807C13.9862 14.6083 12.5186 16.0758 11.4131 17.1813C10.6321 17.9624 9.36726 17.9623 8.58621 17.1813C7.5006 16.0957 6.06013 14.6552 5.28563 13.8807C2.68213 11.2772 2.68213 7.05612 5.28563 4.45262C7.88912 1.84913 12.1102 1.84913 14.7137 4.45262C17.3172 7.05612 17.3172 11.2772 14.7137 13.8807Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.4997 9.16667C12.4997 10.5474 11.3804 11.6667 9.99967 11.6667C8.61896 11.6667 7.49967 10.5474 7.49967 9.16667C7.49967 7.78596 8.61896 6.66667 9.99967 6.66667C11.3804 6.66667 12.4997 7.78596 12.4997 9.16667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="text-xs text-gray-500 mb-1">Location :</p>
              <p className="text-sm text-gray-800">
                {company?.office_address || "No office address added yet."}<br />
                {[company?.city, company?.state, company?.country]
                  .filter(Boolean)
                  .filter(
                    (part, index, all) =>
                      all.findIndex(
                        (other) =>
                          other.trim().toLowerCase() === part.trim().toLowerCase()
                      ) === index
                  )
                  .join(", ") || "No location added yet."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <GlobeIcon className="text-gray-600 text-xl" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Website :</p>
              <Link to={company?.website || ''} className="text-sm text-gray-800 hover:text-gold">{company?.website || "No website"}</Link>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <EnvelopeClosedIcon className="text-gray-600 text-xl" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Email :</p>
              <p className="text-sm text-gray-800">{company?.email || "No email"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

// Right-hand sidebar — "Active deals", "Job Openings", "My Circle" — mirrors
// the target layout instead of the old left-hand ProductSidebar.
const CompanySidebar = React.memo(({ company, dealRooms, applications }) => {
  return (
    <section className="space-y-4 w-full xl:max-w-[320px] shrink-0">
      <SidebarCard title="Active deals" seeAllTo={webRoutes.dealRooms}>
        {dealRooms.length ? (
          <div className="space-y-3">
            {dealRooms.slice(0, 3).map((deal) => (
              <div key={deal.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">{company?.company_name}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {deal?.title || "Untitled deal"}
                  </p>
                </div>
                <span
                  className={clsx(
                    "text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap",
                    deal?.status?.toLowerCase() === "closed"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-[#00D7071C] text-[#00D707]"
                  )}
                >
                  {deal?.status || "Active"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No active deals yet.</p>
        )}
      </SidebarCard>

      <SidebarCard title="Job Openings" seeAllTo={webRoutes.workforceJobs}>
        {applications.length ? (
          <div className="space-y-3">
            {applications.slice(0, 3).map((job) => (
              <div key={job.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">{company?.company_name}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {job?.title || "Untitled role"}
                  </p>
                </div>
                <span
                  className={clsx(
                    "text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap",
                    job?.is_closed
                      ? "bg-red-50 text-red-500"
                      : "bg-[#00D7071C] text-[#00D707]"
                  )}
                >
                  {job?.is_closed ? "Closed" : "Active"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No job openings yet.</p>
        )}
      </SidebarCard>

      <SidebarCard title="Circle" seeAllTo={`/co/representatives/?company=${company?.id}---${company?.slug}`}>
        <SuggestionList
          hasSeeMore={false}
          associated
          thisUser={company.user}
          companyId={company.id}
          companySlug={company.slug}
        />
      </SidebarCard>
    </section>
  );
});

const SidebarCard = ({ title, seeAllTo, children }) => (
  <div className="bg-white border rounded-lg p-4">
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {seeAllTo && (
        <Link to={seeAllTo} className="text-xs font-medium text-gray-500 hover:text-gold">
          see all
        </Link>
      )}
    </div>
    {children}
  </div>
);

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