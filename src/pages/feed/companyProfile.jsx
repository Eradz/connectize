import { LocationOnOutlined } from "@mui/icons-material";
import { EnvelopeClosedIcon, GlobeIcon, DotsHorizontalIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import { usePollCurrentCompany } from "../../hooks/usePolling";
import { CompanyUserType } from "../../lib/helpers/types";
import { capitalizeFirst, formatNumber } from "../../lib/utils";
import { EventsSection, ProfileAboutList } from "./userProfile";
import BlockCompanyButton from "../../components/moderation/BlockCompanyButton";
import ReportModal from "../../components/moderation/ReportModal";
import { Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
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
import { PostCard } from "../../components/admin/feeds/DiscoverPostTabs";
import PrimaryButton from "../../components/PrimaryButton";
import { ProductListCard } from "../../components/admin/markets/newlyListed";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import HeadingText from "../../components/HeadingText";

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

const CompanyProfile = React.memo(() => {
  const baseSeoData = getSEOConfig("companyProfile");
  const { company: companyName } = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Activities");

  const { data: company, isLoading } = usePollCurrentCompany(companyName);
  const companyDisplayName = company?.company_name || companyName;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [dealRooms, setDealRooms] = useState([]);
  const [marketplaceListings, setMarketplaceListings] = useState([]);

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
                console.log("Filtered jobs:", data);
                setApplications(data);
            // No separate filtered state; derived via useMemo
              } catch (error) {
                console.error('Failed to load applications:', error);
                setApplications([]);
            // No separate filtered state; derived via useMemo
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

  const stats = useMemo(
    () => [
      `${formatNumber(company?.posts_count || 0)} /Posts`,
      `${formatNumber(company?.followers_count || 0)} /Followers`,
      `${formatNumber(company?.reviews_count || company?.reviews?.length || 0)} /Reviews`,
    ],
    [company]
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
    <section className="rounded-md overflow-hidden w-full">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={baseSeoData.keywords}
      />
      <Header {...headerProps} />
     {/* Stats */}
      <div className="mt-12 mb-2 flex gap-2 overflow-x-auto scrollbar-hidden px-2">
        {currentUser?.email === company?.profile &&
          currentUser?.user_type === CompanyUserType && (
            <ManageRepresentativesLink main />
          )}
        {stats.map((text, index) => (
          <StatsText key={index} text={text} />
        ))}
      </div>
      <section className=" flex max-xl:flex-col items-start gap-2 relative sm:px-2">
              <ProductSidebar company={company} companyName={companyName} />
          <ProfileSection className="max-xl:w-full grid grid-cols-1 gap-2 flex-1 pt-0">
          <div className="">
            <h2 className="text-xl font-semibold mb-4">Quick action</h2>
            <div className="flex gap-3 flex-wrap">
            </div>
          </div>
            <div className="mb-6">
          <div className="flex gap-3 flex-wrap">
            <Link
              to={webRoutes.dealRooms}
              className="bg-yellow-400 hover:bg-yellow-500 px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1984_9558)">
          <path d="M6.66667 6.66668C6.13623 6.66668 5.62753 6.87739 5.25245 7.25246C4.87738 7.62754 4.66667 8.13624 4.66667 8.66668C4.66667 9.19711 4.87738 9.70582 5.25245 10.0809C5.62753 10.456 6.13623 10.6667 6.66667 10.6667H9.33333C9.86377 10.6667 10.3725 10.456 10.7475 10.0809C11.1226 9.70582 11.3333 9.19711 11.3333 8.66668C11.3333 8.13624 11.1226 7.62754 10.7475 7.25246C10.3725 6.87739 9.86377 6.66668 9.33333 6.66668H6.66667ZM10 8.66668C10 8.84349 9.92976 9.01306 9.80474 9.13808C9.67971 9.26311 9.51014 9.33334 9.33333 9.33334H6.66667C6.48986 9.33334 6.32029 9.26311 6.19526 9.13808C6.07024 9.01306 6 8.84349 6 8.66668C6 8.48987 6.07024 8.3203 6.19526 8.19527C6.32029 8.07025 6.48986 8.00001 6.66667 8.00001H9.33333C9.51014 8.00001 9.67971 8.07025 9.80474 8.19527C9.92976 8.3203 10 8.48987 10 8.66668ZM11.3333 12.6667C11.3333 12.8435 11.2631 13.0131 11.1381 13.1381C11.013 13.2631 10.8435 13.3333 10.6667 13.3333H5.33333C5.15652 13.3333 4.98695 13.2631 4.86193 13.1381C4.7369 13.0131 4.66667 12.8435 4.66667 12.6667C4.66667 12.4899 4.7369 12.3203 4.86193 12.1953C4.98695 12.0702 5.15652 12 5.33333 12H10.6667C10.8435 12 11.013 12.0702 11.1381 12.1953C11.2631 12.3203 11.3333 12.4899 11.3333 12.6667ZM13.024 2.08068L11.9187 0.976677C11.6099 0.666178 11.2427 0.419985 10.8381 0.252342C10.4336 0.0846994 9.99988 -0.00106532 9.562 9.98748e-06H5.33333C4.4496 0.00106856 3.60237 0.352598 2.97748 0.97749C2.35259 1.60238 2.00106 2.44961 2 3.33334V12.6667C2.00106 13.5504 2.35259 14.3976 2.97748 15.0225C3.60237 15.6474 4.4496 15.999 5.33333 16H10.6667C11.5504 15.999 12.3976 15.6474 13.0225 15.0225C13.6474 14.3976 13.9989 13.5504 14 12.6667V4.43801C14.0013 4.00007 13.9156 3.56622 13.7481 3.16159C13.5806 2.75696 13.3345 2.38956 13.024 2.08068ZM12.0813 3.02334C12.1751 3.1183 12.2595 3.22211 12.3333 3.33334H10.6667V1.66668C10.7781 1.7397 10.8817 1.82391 10.976 1.91801L12.0813 3.02334ZM12.6667 12.6667C12.6667 13.1971 12.456 13.7058 12.0809 14.0809C11.7058 14.456 11.1971 14.6667 10.6667 14.6667H5.33333C4.8029 14.6667 4.29419 14.456 3.91912 14.0809C3.54405 13.7058 3.33333 13.1971 3.33333 12.6667V3.33334C3.33333 2.80291 3.54405 2.2942 3.91912 1.91913C4.29419 1.54406 4.8029 1.33334 5.33333 1.33334H9.33333V3.33334C9.33333 3.68697 9.47381 4.0261 9.72386 4.27615C9.97391 4.5262 10.313 4.66668 10.6667 4.66668H12.6667V12.6667Z" fill="#374957"/>
          </g>
          <defs>
          <clipPath id="clip0_1984_9558">
          <rect width="16" height="16" fill="white"/>
          </clipPath>
          </defs>
          </svg>

              Deal Rooms
            </Link>

            <Link
              to={webRoutes.workforceJobs}
              className="bg-white border border-gray-300 hover:bg-gray-50 px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1984_9561)">
          <path d="M12.6667 2.66667H11.9333C11.7786 1.91428 11.3692 1.23823 10.7742 0.752479C10.1791 0.266727 9.4348 0.000969683 8.66667 0L7.33333 0C6.5652 0.000969683 5.82088 0.266727 5.22583 0.752479C4.63079 1.23823 4.2214 1.91428 4.06667 2.66667H3.33333C2.4496 2.66773 1.60237 3.01925 0.97748 3.64415C0.352588 4.26904 0.00105857 5.11627 0 6L0 12.6667C0.00105857 13.5504 0.352588 14.3976 0.97748 15.0225C1.60237 15.6474 2.4496 15.9989 3.33333 16H12.6667C13.5504 15.9989 14.3976 15.6474 15.0225 15.0225C15.6474 14.3976 15.9989 13.5504 16 12.6667V6C15.9989 5.11627 15.6474 4.26904 15.0225 3.64415C14.3976 3.01925 13.5504 2.66773 12.6667 2.66667V2.66667ZM7.33333 1.33333H8.66667C9.07884 1.33504 9.48042 1.46406 9.81647 1.70273C10.1525 1.94139 10.4066 2.27806 10.544 2.66667H5.456C5.59339 2.27806 5.84749 1.94139 6.18353 1.70273C6.51958 1.46406 6.92116 1.33504 7.33333 1.33333V1.33333ZM3.33333 4H12.6667C13.1971 4 13.7058 4.21071 14.0809 4.58579C14.456 4.96086 14.6667 5.46957 14.6667 6V8H1.33333V6C1.33333 5.46957 1.54405 4.96086 1.91912 4.58579C2.29419 4.21071 2.8029 4 3.33333 4V4ZM12.6667 14.6667H3.33333C2.8029 14.6667 2.29419 14.456 1.91912 14.0809C1.54405 13.7058 1.33333 13.1971 1.33333 12.6667V9.33333H7.33333V10C7.33333 10.1768 7.40357 10.3464 7.5286 10.4714C7.65362 10.5964 7.82319 10.6667 8 10.6667C8.17681 10.6667 8.34638 10.5964 8.4714 10.4714C8.59643 10.3464 8.66667 10.1768 8.66667 10V9.33333H14.6667V12.6667C14.6667 13.1971 14.456 13.7058 14.0809 14.0809C13.7058 14.456 13.1971 14.6667 12.6667 14.6667Z" fill="#374957"/>
          </g>
          <defs>
          <clipPath id="clip0_1984_9561">
          <rect width="16" height="16" fill="white"/>
          </clipPath>
          </defs>
          </svg>
              Work Force
            </Link>

            <Link
              to={webRoutes.workforceEvents}
              className="bg-white border border-gray-300 hover:bg-gray-50 px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1984_9564)">
          <path d="M12.6667 1.33333H12V0.666667C12 0.489856 11.9298 0.320286 11.8047 0.195262C11.6797 0.0702379 11.5101 0 11.3333 0C11.1565 0 10.987 0.0702379 10.8619 0.195262C10.7369 0.320286 10.6667 0.489856 10.6667 0.666667V1.33333H5.33333V0.666667C5.33333 0.489856 5.2631 0.320286 5.13807 0.195262C5.01305 0.0702379 4.84348 0 4.66667 0C4.48986 0 4.32029 0.0702379 4.19526 0.195262C4.07024 0.320286 4 0.489856 4 0.666667V1.33333H3.33333C2.4496 1.33439 1.60237 1.68592 0.97748 2.31081C0.352588 2.93571 0.00105857 3.78294 0 4.66667L0 12.6667C0.00105857 13.5504 0.352588 14.3976 0.97748 15.0225C1.60237 15.6474 2.4496 15.9989 3.33333 16H12.6667C13.5504 15.9989 14.3976 15.6474 15.0225 15.0225C15.6474 14.3976 15.9989 13.5504 16 12.6667V4.66667C15.9989 3.78294 15.6474 2.93571 15.0225 2.31081C14.3976 1.68592 13.5504 1.33439 12.6667 1.33333ZM1.33333 4.66667C1.33333 4.13623 1.54405 3.62753 1.91912 3.25245C2.29419 2.87738 2.8029 2.66667 3.33333 2.66667H12.6667C13.1971 2.66667 13.7058 2.87738 14.0809 3.25245C14.456 3.62753 14.6667 4.13623 14.6667 4.66667V5.33333H1.33333V4.66667ZM12.6667 14.6667H3.33333C2.8029 14.6667 2.29419 14.456 1.91912 14.0809C1.54405 13.7058 1.33333 13.1971 1.33333 12.6667V6.66667H14.6667V12.6667C14.6667 13.1971 14.456 13.7058 14.0809 14.0809C13.7058 14.456 13.1971 14.6667 12.6667 14.6667Z" fill="#374957"/>
          <path d="M8 11C8.55228 11 9 10.5523 9 10C9 9.44772 8.55228 9 8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11Z" fill="#374957"/>
          <path d="M4.66699 11C5.21928 11 5.66699 10.5523 5.66699 10C5.66699 9.44772 5.21928 9 4.66699 9C4.11471 9 3.66699 9.44772 3.66699 10C3.66699 10.5523 4.11471 11 4.66699 11Z" fill="#374957"/>
          <path d="M11.333 11C11.8853 11 12.333 10.5523 12.333 10C12.333 9.44772 11.8853 9 11.333 9C10.7807 9 10.333 9.44772 10.333 10C10.333 10.5523 10.7807 11 11.333 11Z" fill="#374957"/>
          </g>
          <defs>
          <clipPath id="clip0_1984_9564">
          <rect width="16" height="16" fill="white"/>
          </clipPath>
          </defs>
          </svg>

              Events
            </Link>

            <Link
              to={webRoutes.logisticsDashboard}
              className="bg-white border border-gray-300 hover:bg-gray-50 px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1984_9567)">
          <path d="M12.6667 3.33268H11.2667C11.1119 2.58029 10.7025 1.90425 10.1075 1.41849C9.51245 0.932742 8.76814 0.666985 8 0.666016H3.33333C2.4496 0.667074 1.60237 1.0186 0.97748 1.6435C0.352588 2.26839 0.00105857 3.11562 0 3.99935L0 9.99935C0.00167587 10.5964 0.203692 11.1757 0.573691 11.6443C0.94369 12.113 1.46026 12.4439 2.04067 12.584C1.97784 12.9176 1.98858 13.261 2.07213 13.59C2.15568 13.9191 2.31002 14.2259 2.5244 14.4892C2.73877 14.7524 3.00801 14.9657 3.31333 15.1142C3.61864 15.2627 3.95267 15.3427 4.29211 15.3488C4.63155 15.3548 4.96823 15.2867 5.27864 15.1492C5.58905 15.0118 5.86572 14.8082 6.08934 14.5527C6.31296 14.2973 6.47815 13.9961 6.57337 13.6703C6.66859 13.3444 6.69156 13.0017 6.64067 12.666H9.362C9.34485 12.7763 9.33571 12.8877 9.33467 12.9994C9.33467 13.6182 9.5805 14.2117 10.0181 14.6493C10.4557 15.0869 11.0492 15.3327 11.668 15.3327C12.2868 15.3327 12.8803 15.0869 13.3179 14.6493C13.7555 14.2117 14.0013 13.6182 14.0013 12.9994C14.0006 12.8599 13.987 12.7209 13.9607 12.584C14.5408 12.4436 15.0571 12.1126 15.4268 11.644C15.7966 11.1754 15.9984 10.5963 16 9.99935V6.66602C15.9989 5.78229 15.6474 4.93505 15.0225 4.31016C14.3976 3.68527 13.5504 3.33374 12.6667 3.33268V3.33268ZM14.6667 6.66602V7.33268H11.3333V4.66602H12.6667C13.1971 4.66602 13.7058 4.87673 14.0809 5.2518C14.456 5.62688 14.6667 6.13558 14.6667 6.66602ZM1.33333 9.99935V3.99935C1.33333 3.46892 1.54405 2.96021 1.91912 2.58514C2.29419 2.21006 2.8029 1.99935 3.33333 1.99935H8C8.53043 1.99935 9.03914 2.21006 9.41421 2.58514C9.78929 2.96021 10 3.46892 10 3.99935V11.3327H2.66667C2.31304 11.3327 1.97391 11.1922 1.72386 10.9422C1.47381 10.6921 1.33333 10.353 1.33333 9.99935ZM5.33333 12.9994C5.33333 13.2646 5.22798 13.5189 5.04044 13.7065C4.8529 13.894 4.59855 13.9994 4.33333 13.9994C4.06812 13.9994 3.81376 13.894 3.62623 13.7065C3.43869 13.5189 3.33333 13.2646 3.33333 12.9994C3.33374 12.8854 3.35475 12.7725 3.39533 12.666H5.27133C5.31192 12.7725 5.33292 12.8854 5.33333 12.9994V12.9994ZM11.6667 13.9994C11.4015 13.9994 11.1471 13.894 10.9596 13.7065C10.772 13.5189 10.6667 13.2646 10.6667 12.9994C10.667 12.8854 10.688 12.7725 10.7287 12.666H12.6047C12.6454 12.7725 12.6664 12.8854 12.6667 12.9994C12.6667 13.2646 12.5613 13.5189 12.3738 13.7065C12.1862 13.894 11.9319 13.9994 11.6667 13.9994ZM13.3333 11.3327H11.3333V8.66602H14.6667V9.99935C14.6667 10.353 14.5262 10.6921 14.2761 10.9422C14.0261 11.1922 13.687 11.3327 13.3333 11.3327Z" fill="#374957"/>
          </g>
          <defs>
          <clipPath id="clip0_1984_9567">
          <rect width="16" height="16" fill="white"/>
          </clipPath>
          </defs>
          </svg>

              Logistics
            </Link>

            <Link
              to={webRoutes.dashboard}
              className="bg-white border border-gray-300 hover:bg-gray-50 px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium"
            >
              visit Business hub
            </Link>
          </div>
            </div>

              <Scroll>
                <div className="flex gap-4 md:gap-0 justify-between  min-w-min mb-6 text-[14px]">
                  {["Activities", "Services", "Products", "Deal Room", "Events", "Work Force"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={clsx(
                        "pb-2 px-1 font-normal whitespace-nowrap relative",
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
            {activeTab === "Reviews" && (
            <div className="bg-white rounded-lg p-6">
              <Reviews reviews={company?.reviews} />
            </div>
          )}

            {/* Tab Content */}
            {activeTab === "Events" && (registrations.length > 0 ? (
                <EventsSection company={registrations} title={"Events"}/>
              ) : (
                <div className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 font-medium mb-2">No Events</h3>
                  <p className="text-gray-500 text-sm">This user hasn't created any events yet</p>
                </div>
              ) )}
            {activeTab === "Work Force" &&  (
                applications.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold mb-4">Created jobs</h2>
                      <Link to={webRoutes.workforceJobs} className="bg-gold p-2 rounded-lg">All Jobs</Link>
                    </div>

                    {applications.slice(0,3).map((job) => (
                      <ApplicationJobsCard key={job.id} job={job} setApplications={setApplications} profile={"company"}/>
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
            {activeTab === "Activities" && (<section className="space-y-6 w-full shrink-0">
                  <CreatePost />
                  <DiscoverPosts companyName={company?.company_name} companyId={company?.id} />
                </section>)}
            {activeTab === "Services" && (
              <div className="">
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
              </div>)}
          {activeTab === "Products" && (
            <div className="">
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
          )}
            {activeTab === "Deal Room" && (dealRooms.length > 0 ? (
                <div >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Deals</h2>
                    <Link to={webRoutes.dealRooms} className="bg-gold p-2 rounded-lg">Visit Deals</Link>
                  </div>

                  <div className="md:bg-white border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {dealRooms.slice(0,3).map((dealRoom) => (
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
          </ProfileSection>
      </section>
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

const ProductSidebar = React.memo(({ company, companyName }) => {

  const { user: currentUser } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  const isCurrentUser = currentUser?.id === company?.user?.id;
  const editCompanyName = companyName || company?.slug || company?.company_name || company?.id;

 const myAccounts = [
    {
      id: 1,
      name: "McFly",
      username: "@levratmcfly",
      avatar: "images/user1.jpg",
      verified: true
    },
    {
      id: 2,
      name: "JohnDoe",
      username: "@johndoe",
      avatar: "images/user2.jpg",
      verified: true
    },
    {
      id: 3,
      name: "Janis Joplin",
      username: "@realjanice",
      avatar: "images/user3.jpg",
      verified: true
    },
  ];

  return (
    <section className="space-y-4 max-lg:mb-4 w-full xl:max-w-[350px] 2xl:max-w-[400px] shrink-0">

      {/* Summary Section */}
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
                <path d="M11.334 2.00004L14 4.66671M1.33398 14.6667L3.42998 14.3907C3.70189 14.3578 3.83785 14.3413 3.96646 14.3019C4.08041 14.2672 4.18965 14.2182 4.29146 14.1562C4.40647 14.0864 4.50793 13.9949 4.71084 13.792L14.0007 4.50204C14.7371 3.76562 14.7371 2.56846 14.0007 1.83204C13.2642 1.09562 12.0671 1.09562 11.3307 1.83204L2.04065 11.122C1.83774 11.3249 1.73629 11.4264 1.66646 11.5414C1.60453 11.6432 1.55562 11.7524 1.52094 11.8664C1.48156 11.995 1.46509 12.131 1.43214 12.4029L1.33398 14.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {company?.about || "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatu"}
        </p>
      </div>

      {/* About Section */}
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
                <path d="M11.334 2.00004L14 4.66671M1.33398 14.6667L3.42998 14.3907C3.70189 14.3578 3.83785 14.3413 3.96646 14.3019C4.08041 14.2672 4.18965 14.2182 4.29146 14.1562C4.40647 14.0864 4.50793 13.9949 4.71084 13.792L14.0007 4.50204C14.7371 3.76562 14.7371 2.56846 14.0007 1.83204C13.2642 1.09562 12.0671 1.09562 11.3307 1.83204L2.04065 11.122C1.83774 11.3249 1.73629 11.4264 1.66646 11.5414C1.60453 11.6432 1.55562 11.7524 1.52094 11.8664C1.48156 11.995 1.46509 12.131 1.43214 12.4029L1.33398 14.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Location */}
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 shrink-0">
              <path d="M14.7137 13.8807C13.9862 14.6083 12.5186 16.0758 11.4131 17.1813C10.6321 17.9624 9.36726 17.9623 8.58621 17.1813C7.5006 16.0957 6.06013 14.6552 5.28563 13.8807C2.68213 11.2772 2.68213 7.05612 5.28563 4.45262C7.88912 1.84913 12.1102 1.84913 14.7137 4.45262C17.3172 7.05612 17.3172 11.2772 14.7137 13.8807Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.4997 9.16667C12.4997 10.5474 11.3804 11.6667 9.99967 11.6667C8.61896 11.6667 7.49967 10.5474 7.49967 9.16667C7.49967 7.78596 8.61896 6.66667 9.99967 6.66667C11.3804 6.66667 12.4997 7.78596 12.4997 9.16667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="text-xs text-gray-500 mb-1">Location :</p>
              <p className="text-sm text-gray-800">
                {company?.office_address || "2972 Westheimer Rd."}<br/>
                {[company?.city, company?.state, company?.country]
                  .filter(Boolean)
                  .filter(
                    (part, index, all) =>
                      all.findIndex(
                        (other) =>
                          other.trim().toLowerCase() === part.trim().toLowerCase()
                      ) === index
                  )
                  .join(", ") || "Santa Ana, Illinois"}
              </p>
            </div>
          </div>

          {/* Website */}
          <div className="flex items-start gap-3">
            <GlobeIcon className="text-gray-600 text-xl" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Website :</p>
              <Link to={company?.website || ''} className="text-sm text-gray-800 hover:text-gold">{company?.website || "No website"}</Link>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <EnvelopeClosedIcon className="text-gray-600 text-xl" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Email :</p>
              <p className="text-sm text-gray-800">{company?.email || "No email"}</p>
            </div>
          </div>

          {/* Links */}
          {/* <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-600">
              <path d="M8 11C8 11.5304 8.21071 12.0391 8.58579 12.4142C8.96086 12.7893 9.46957 13 10 13H14C14.5304 13 15.0391 12.7893 15.4142 12.4142C15.7893 12.0391 16 11.5304 16 11V10C16 9.46957 15.7893 8.96086 15.4142 8.58579C15.0391 8.21071 14.5304 8 14 8H10C9.46957 8 8.96086 8.21071 8.58579 8.58579C8.21071 8.96086 8 9.46957 8 10V11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="text-xs text-gray-500 mb-1">Links :</p>
              <div className="flex gap-2">
                <a href="#" className="text-gray-600 hover:text-black"><span className="text-sm">f</span></a>
                <a href="#" className="text-gray-600 hover:text-black"><span className="text-sm">in</span></a>
                <a href="#" className="text-gray-600 hover:text-black"><span className="text-sm">in</span></a>
                <a href="#" className="text-gray-600 hover:text-black"><span className="text-sm">tw</span></a>
              </div>
            </div>
          </div> */}
        </div>
      </div>

{/* People Associated Section */}
<ProfileSection title="People Associated" className="h-fit">
  <SuggestionList
    hasSeeMore
    associated
    thisUser={company.user}
    companyId={company.id}
    companySlug={company.slug}
    viewMoreUrl={`/co/representatives/?company=${company?.id}---${company?.slug}`}
  />
</ProfileSection>
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
