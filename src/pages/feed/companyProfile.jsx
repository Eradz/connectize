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
import { Calendar, FileText } from "lucide-react";
import { dealRoomService } from "../../api-services/oilgas";
import CreatePost from "../../components/admin/feeds/CreatePost";
import DiscoverPosts from "../../components/admin/feeds/DiscoverPosts";
import { PostCard } from "../../components/admin/feeds/DiscoverPostTabs";
import PrimaryButton from "../../components/PrimaryButton";
import { ProductListCard } from "../../components/admin/markets/newlyListed";

export const meta = () =>
  createSEO({
    title: "Connectize Companies",
  });

const CompanyProfile = React.memo(() => {
  const { company: companyName } = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Activities");

  const { data: company, isLoading } = usePollCurrentCompany(companyName);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  const loadMyRegistrations = async () => {
    try {
      setLoading(true);
      const response = await workforceAPI.getMyEventRegistrations();
      setRegistrations(response.data.results || response.data || []);
          setError(null);
        } catch (err) {
          console.error('Error loading registrations:', err);
          setError('Failed to load your event registrations. Please try again.');
          setRegistrations([]);
        } finally {
          setLoading(false);
        }
      };

      const loadApplications = async () => {
              try {
                setLoading(true);
                const response = await workforceAPI.getApplications();
                const data = response.data?.results || response.data || response || [];
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
      
            const loadJobs = async () => {
                try {
                  setLoading(true);
                  const response = await dealRoomService.getAll(1, 4, {});
                  const rooms = response?.results || response?.data || response || [];
                  setJobs(Array.isArray(rooms) ? rooms : []);
                } catch (error) {
                  console.error('Failed to load deal rooms:', error);
                  setJobs([]);
                } finally {
                  setLoading(false);
                }
              };

      useEffect(() => {
        loadMyRegistrations();
        loadApplications();
        loadJobs();
      }, []);

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
 <div className="mb-6">
  <h2 className="text-xl font-semibold mb-4">Quick action</h2>
  <div className="flex gap-3 flex-wrap">
  </div>
</div>
  <div className="mb-6">
<div className="flex gap-3 flex-wrap">
  <Link
    to={webRoutes.dealRooms}
    className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm"
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
    className="bg-white border border-gray-300 hover:bg-gray-50 px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
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
    className="bg-white border border-gray-300 hover:bg-gray-50 px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
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
    className="bg-white border border-gray-300 hover:bg-gray-50 px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
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
    to={webRoutes.businessHub}
    className="bg-white border border-gray-300 hover:bg-gray-50 px-6 py-2.5 rounded-xl text-sm font-medium"
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
      <EventsSection company={registrations} />
    ) : (
      <div className="py-12 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-gray-900 font-medium mb-2">No Events</h3>
        <p className="text-gray-500 text-sm">This user hasn't created any events yet</p>
      </div>
    ) )}
  {activeTab === "Work Force" &&  (
      applications.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold mb-4">My applied jobs</h2>
            <Link to={webRoutes.workforceMyAppliedJobs} className="bg-gold p-2 rounded-lg">All applications</Link>
          </div>

          {applications.slice(0,2).map((job) => (
            <ApplicationJobsCard key={job.id} job={job} setApplications={setApplications} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 font-medium mb-2">No Workforce</h3>
          <p className="text-gray-500 text-sm">This user hasn't added any workforce members</p>
        </div>
      )
    )}
  {activeTab === "Activities" && (<section className="space-y-6 w-full shrink-0">
        <CreatePost />
        <DiscoverPosts companyName={company?.company_name} />
      </section>)}
  {activeTab === "Services" && (
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
      </div>)}
 {activeTab === "Products" && (
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
      </div>
 )}
  {activeTab === "Deal Room" && (jobs.length > 0 ? (
      <div >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">My Deals</h2>
          <Link to={webRoutes.dealRooms} className="bg-gold p-2 rounded-lg">Visit Deals</Link>
        </div>

        <div className="md:bg-white border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2">
          {jobs.slice(0,3).map((job) => (
            <DealRoomCard key={job.id} deal={job} />
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
     
    >
    </Link>
  );
};

const ProductSidebar = React.memo(({ company }) => {
  const stats = useMemo(
    () => [
      formatNumber(company?.products?.length || 0) + "k post",
      formatNumber(company?.followers?.length || 0) + "M Connections",
      formatNumber(company?.reviews?.length || 0) + " Reviews",
    ],
    [company]
  );

  const { user: currentUser } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  const isCurrentUser = currentUser?.id === company?.user?.id;

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

  const peopleAssociated = [
    {
      id: 1,
      name: "Brooklyn Simmons",
      role: "Web Designer",
      avatar: "images/person1.jpg",
      verified: true
    },
    {
      id: 2,
      name: "Cameron Williamson",
      role: "Medical Assistant",
      avatar: "images/person2.jpg",
      verified: true
    },
    {
      id: 3,
      name: "Darrell Steward",
      role: "President of Sales",
      avatar: "images/person3.jpg",
      verified: true
    },
    {
      id: 4,
      name: "Courtney Henry",
      role: "Marketing Coordinator",
      avatar: "images/person4.jpg",
      verified: true
    },
    {
      id: 5,
      name: "Jane Cooper",
      role: "Dog Trainer",
      avatar: "images/person5.jpg",
      verified: true
    },
    {
      id: 6,
      name: "Leslie Alexander",
      role: "Nursing Assistant",
      avatar: "images/person6.jpg",
      verified: true
    },
  ];

  return (
    <section className="space-y-4 max-lg:mb-4 w-full xl:max-w-[350px] 2xl:max-w-[400px] shrink-0">
      {/* Stats */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
        {stats.map((text, index) => (
          <StatsText key={index} text={text} />
        ))}
      </div>

      {/* Summary Section */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Summary</h2>
          {isCurrentUser && (
            <button className="text-gray-500 hover:text-black">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.334 2.00004L14 4.66671M1.33398 14.6667L3.42998 14.3907C3.70189 14.3578 3.83785 14.3413 3.96646 14.3019C4.08041 14.2672 4.18965 14.2182 4.29146 14.1562C4.40647 14.0864 4.50793 13.9949 4.71084 13.792L14.0007 4.50204C14.7371 3.76562 14.7371 2.56846 14.0007 1.83204C13.2642 1.09562 12.0671 1.09562 11.3307 1.83204L2.04065 11.122C1.83774 11.3249 1.73629 11.4264 1.66646 11.5414C1.60453 11.6432 1.55562 11.7524 1.52094 11.8664C1.48156 11.995 1.46509 12.131 1.43214 12.4029L1.33398 14.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
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
            <button className="text-gray-500 hover:text-black">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.334 2.00004L14 4.66671M1.33398 14.6667L3.42998 14.3907C3.70189 14.3578 3.83785 14.3413 3.96646 14.3019C4.08041 14.2672 4.18965 14.2182 4.29146 14.1562C4.40647 14.0864 4.50793 13.9949 4.71084 13.792L14.0007 4.50204C14.7371 3.76562 14.7371 2.56846 14.0007 1.83204C13.2642 1.09562 12.0671 1.09562 11.3307 1.83204L2.04065 11.122C1.83774 11.3249 1.73629 11.4264 1.66646 11.5414C1.60453 11.6432 1.55562 11.7524 1.52094 11.8664C1.48156 11.995 1.46509 12.131 1.43214 12.4029L1.33398 14.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
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
                {company?.city || "Santa Ana"}, {company?.state || "Illinois"} {company?.country || "85486"}
              </p>
            </div>
          </div>

          {/* Website */}
          <div className="flex items-start gap-3">
            <GlobeIcon className="text-gray-600 text-xl" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Website :</p>
              <p className="text-sm text-gray-800">{company?.website || "Dangoteoilplant.com"}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <EnvelopeClosedIcon className="text-gray-600 text-xl" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Email :</p>
              <p className="text-sm text-gray-800">{company?.email || "Company.email.com"}</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-start gap-3">
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
          </div>
        </div>
      </div>

      {/* My Accounts Section */}

<div className="bg-white border rounded-lg p-4">
  <h2 className="text-lg font-bold mb-4">My Accounts</h2>
  <div className="space-y-3">
    {myAccounts.map((account) => (
      <div key={account.id} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#9CA3AF"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold">{account.name}</p>
              {account.verified && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5L7 0Z" fill="#1DA1F2"/>
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500">{account.username}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-black">
          <DotsHorizontalIcon />
        </button>
      </div>
    ))}
  </div>
</div>

{/* People Associated Section */}
<div className="bg-white border rounded-lg p-4">
  <h2 className="text-lg font-bold mb-4">People Associated</h2>
  <div className="space-y-4">
    {peopleAssociated.map((person) => (
      <div key={person.id} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#9CA3AF"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <p className="text-sm font-semibold">{person.name}</p>
            {person.verified && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#000"/>
                <path d="M11.5 6L7 10.5L4.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <p className="text-xs text-gray-500">{person.role}</p>
        </div>
      </div>
    ))}
  </div>
  <button className="w-full mt-4 text-sm text-gray-600 hover:text-black flex items-center justify-center gap-1">
    See More
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
</div>
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

// const EventsSection = React.memo(({ company }) => {
//   const [activeFilter, setActiveFilter] = useState("Recent event");
  
//   const filters = ["Recent event", "Pending", "Upcoming", "ongoing"];
  
//   const events = [
//     {
//       id: 1,
//       status: "Upcoming",
//       title: "Drilling And Completion Workshop",
//       themes: ["Sustainability", "Free Energy"]
//     },
//     {
//       id: 2,
//       status: "Upcoming",
//       title: "Drilling And Completion Workshop",
//       themes: ["Sustainability", "Free Energy"]
//     },
//     {
//       id: 3,
//       status: "Upcoming",
//       title: "Drilling And Completion Workshop",
//       themes: ["Sustainability", "Free Energy"]
//     },
//     {
//       id: 4,
//       status: "Upcoming",
//       title: "Drilling And Completion Workshop",
//       themes: ["Sustainability", "Free Energy"]
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Events Header - UPDATED */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">Events</h2>
// <Link
//   to={`/events?company=${company?.id || ''}`}
//   className="bg-yellow-100 hover:bg-yellow-200 px-6 py-2.5 rounded-xl text-sm font-medium"
// >
//   See all Events
// </Link>
//       </div>

//       {/* Filter Tabs - UPDATED STYLING */}
//       <div className="flex gap-3 flex-wrap">
//         {filters.map((filter) => (
//           <button
//             key={filter}
//             onClick={() => setActiveFilter(filter)}
//             className={clsx(
//               "px-6 py-2.5 rounded-full text-sm font-medium transition-colors",
//               activeFilter === filter
//                 ? "bg-yellow-400 text-black"
//                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//             )}
//           >
//             {filter}
//           </button>
//         ))}
//       </div>

//       {/* Recent Section with Badge */}
//       <div className="flex items-center gap-2">
//         <h3 className="text-xl font-semibold">Recent</h3>
//         <span className="bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
//           4
//         </span>
//       </div>

//       {/* Event Cards Grid - KEEP AS IS */}
//       <div className="grid grid-cols-2 gap-4">
//         {events.map((event) => (
//           <div key={event.id} className="border rounded-xl p-4 space-y-4 hover:shadow-md transition">
//             <span className="bg-gradient-to-r from-[#FFC000] to-[#FF8400] text-white px-3 py-1 rounded-full text-xs font-medium inline-block">
//               {event.status}
//             </span>
            
//             <h4 className="font-semibold text-base">{event.title}</h4>
            
//             <div className="flex gap-2 flex-wrap items-center">
//               <span className="text-sm text-gray-700">Theme:</span>
//               {event.themes.map((theme, idx) => (
//                 <span key={idx} className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">
//                   {theme}
//                 </span>
//               ))}
//             </div>
            
//             <Link
//   to={`/events/${event.id}`}
//   className="w-full bg-yellow-100 hover:bg-yellow-200 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
// >
//   {/* your svg */}
//   <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <g clipPath="url(#clip0_1984_9010)">
//                   <path d="M13.458 11.0834C13.458 11.2933 13.3746 11.4947 13.2261 11.6431C13.0777 11.7916 12.8763 11.875 12.6663 11.875H6.33301C6.12304 11.875 5.92168 11.7916 5.77322 11.6431C5.62475 11.4947 5.54134 11.2933 5.54134 11.0834C5.54134 10.8734 5.62475 10.672 5.77322 10.5236C5.92168 10.3751 6.12304 10.2917 6.33301 10.2917H12.6663C12.8763 10.2917 13.0777 10.3751 13.2261 10.5236C13.3746 10.672 13.458 10.8734 13.458 11.0834ZM10.2913 13.4584H6.33301C6.12304 13.4584 5.92168 13.5418 5.77322 13.6902C5.62475 13.8387 5.54134 14.0401 5.54134 14.25C5.54134 14.46 5.62475 14.6613 5.77322 14.8098C5.92168 14.9583 6.12304 15.0417 6.33301 15.0417H10.2913C10.5013 15.0417 10.7027 14.9583 10.8511 14.8098C10.9996 14.6613 11.083 14.46 11.083 14.25C11.083 14.0401 10.9996 13.8387 10.8511 13.6902C10.7027 13.5418 10.5013 13.4584 10.2913 13.4584ZM17.4163 8.30064V15.0417C17.4151 16.0911 16.9976 17.0972 16.2556 17.8393C15.5135 18.5813 14.5074 18.9988 13.458 19H5.54134C4.49191 18.9988 3.48582 18.5813 2.74377 17.8393C2.00171 17.0972 1.58426 16.0911 1.58301 15.0417V3.95835C1.58426 2.90892 2.00171 1.90283 2.74377 1.16078C3.48582 0.418716 4.49191 0.0012753 5.54134 1.82469e-05H9.11572C9.84375 -0.00185557 10.5649 0.140609 11.2376 0.419173C11.9102 0.697738 12.5209 1.10688 13.0345 1.62293L15.7926 4.38268C16.309 4.89587 16.7184 5.50642 16.9971 6.17896C17.2758 6.85149 17.4183 7.57264 17.4163 8.30064V8.30064ZM11.915 2.74235C11.6659 2.50102 11.3862 2.29342 11.083 2.12485V5.54168C11.083 5.75165 11.1664 5.95301 11.3149 6.10148C11.4633 6.24994 11.6647 6.33335 11.8747 6.33335H15.2915C15.1228 6.03029 14.915 5.7508 14.6732 5.5021L11.915 2.74235ZM15.833 8.30064C15.833 8.17002 15.8077 8.04493 15.7958 7.91668H11.8747C11.2448 7.91668 10.6407 7.66646 10.1953 7.22106C9.7499 6.77566 9.49967 6.17157 9.49967 5.54168V1.62056C9.37142 1.60868 9.24555 1.58335 9.11572 1.58335H5.54134C4.91145 1.58335 4.30736 1.83357 3.86196 2.27897C3.41656 2.72437 3.16634 3.32846 3.16634 3.95835V15.0417C3.16634 15.6716 3.41656 16.2757 3.86196 16.7211C4.30736 17.1665 4.91145 17.4167 5.54134 17.4167H13.458C14.0879 17.4167 14.692 17.1665 15.1374 16.7211C15.5828 16.2757 15.833 15.6716 15.833 15.0417V8.30064Z" fill="#374957"/>
//                 </g>
//                 <defs>
//                   <clipPath id="clip0_1984_9010">
//                     <rect width="19" height="19" fill="white"/>
//                   </clipPath>
//                 </defs>
//               </svg>
//   View Event Details
// </Link>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// });

const WorkForceSection = React.memo(({ company }) => {
  // Mock job postings data
  const jobPostings = [
    {
      id: 1,
      title: "Professional Field Engineer",
      company: "Big Kahuna Burger Ltd.",
      timestamp: "Just Now",
      tags: ["Professional", "Temporarily"],
      description: "We are looking for an experienced field engineer to join our dynamic team. the successful candidate will be responsible for key operation activities and contribute to our continued success ...",
      salary: "$20,345/Anually",
      location: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
      expiry: "Exp : 10/12/2025",
      applied: 23,
      views: 234
    },
    {
      id: 2,
      title: "Professional Field Engineer",
      company: "Big Kahuna Burger Ltd.",
      timestamp: "Just Now",
      tags: ["Professional", "Temporarily"],
      description: "We are looking for an experienced field engineer to join our dynamic team. the successful candidate will be responsible for key operation activities and contribute to our continued success ...",
      salary: "$20,345/Anually",
      location: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
      expiry: "Exp : 10/12/2025",
      applied: 23,
      views: 234
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Posted Jobs</h2>
        <button className="bg-yellow-100 hover:bg-yellow-200 px-4 py-2 rounded-lg text-sm font-medium">
          visit workforce
        </button>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {jobPostings.map((job) => (
          <div key={job.id} className="bg-white border rounded-lg p-6 space-y-4">
            {/* Job Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 13.2554C18.2207 14.3805 15.1827 15 12 15C8.8173 15 5.7793 14.3805 3 13.2554M16 6V4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4V6M12 12H12.01M5 20H19C20.1046 20 21 19.1046 21 18V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V18C3 19.1046 3.89543 20 5 20Z" stroke="#495057" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.25 15.75V3.75C14.25 2.92157 13.5784 2.25 12.75 2.25H5.25C4.42157 2.25 3.75 2.92157 3.75 3.75V15.75M14.25 15.75L15.75 15.75M14.25 15.75H10.5M3.75 15.75L2.25 15.75M3.75 15.75H7.5M6.75 5.24998H7.5M6.75 8.24998H7.5M10.5 5.24998H11.25M10.5 8.24998H11.25M7.5 15.75V12C7.5 11.5858 7.83579 11.25 8.25 11.25H9.75C10.1642 11.25 10.5 11.5858 10.5 12V15.75M7.5 15.75H10.5" stroke="#383838" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {job.company}
                </span>
                    <span>•</span>
                    <span>{job.timestamp}</span>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex gap-2 mb-3">
                    {job.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className={clsx(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          tag === "Professional" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Bookmark */}
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {job.description}
            </p>

            {/* Job Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 6.66667H12.6667V2.66667C12.6667 2.48986 12.5964 2.32029 12.4714 2.19526C12.3464 2.07024 12.1768 2 12 2H4C3.82319 2 3.65362 2.07024 3.5286 2.19526C3.40357 2.32029 3.33333 2.48986 3.33333 2.66667V6.66667H2C1.82319 6.66667 1.65362 6.7369 1.5286 6.86193C1.40357 6.98695 1.33333 7.15652 1.33333 7.33333V13.3333C1.33333 13.5101 1.40357 13.6797 1.5286 13.8047C1.65362 13.9298 1.82319 14 2 14H14C14.1768 14 14.3464 13.9298 14.4714 13.8047C14.5964 13.6797 14.6667 13.5101 14.6667 13.3333V7.33333C14.6667 7.15652 14.5964 6.98695 14.4714 6.86193C14.3464 6.7369 14.1768 6.66667 14 6.66667ZM4.66667 3.33333H11.3333V6.66667H4.66667V3.33333ZM13.3333 12.6667H2.66667V8H13.3333V12.6667Z" fill="currentColor"/>
                </svg>
                {job.salary}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C16 5.87827 15.1571 3.84344 13.6569 2.34315C12.1566 0.842855 10.1217 0 8 0Z" fill="currentColor"/>
                </svg>
                {job.location}
              </div>
              
<div className="flex items-center gap-2 text-sm text-gray-600">
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_1984_9680)">
      <path d="M17 8.5C17 8.68786 16.9254 8.86803 16.7925 9.00087C16.6597 9.13371 16.4795 9.20833 16.2917 9.20833C16.1038 9.20833 15.9236 9.13371 15.7908 9.00087C15.658 8.86803 15.5833 8.68786 15.5833 8.5C15.5813 6.62202 14.8343 4.82154 13.5064 3.4936C12.1785 2.16567 10.378 1.41873 8.5 1.41667C8.31214 1.41667 8.13197 1.34204 7.99913 1.2092C7.86629 1.07636 7.79167 0.896195 7.79167 0.708333C7.79167 0.520472 7.86629 0.340304 7.99913 0.207466C8.13197 0.0746278 8.31214 0 8.5 0C10.7536 0.00243743 12.9142 0.898753 14.5077 2.49228C16.1012 4.08582 16.9976 6.24641 17 8.5ZM11.3333 9.20833C11.5212 9.20833 11.7014 9.13371 11.8342 9.00087C11.967 8.86803 12.0417 8.68786 12.0417 8.5C12.0417 8.31214 11.967 8.13197 11.8342 7.99913C11.7014 7.86629 11.5212 7.79167 11.3333 7.79167H9.72046C9.59701 7.57947 9.42053 7.40299 9.20833 7.27954V4.95833C9.20833 4.77047 9.13371 4.5903 9.00087 4.45747C8.86803 4.32463 8.68786 4.25 8.5 4.25C8.31214 4.25 8.13197 4.32463 7.99913 4.45747C7.86629 4.5903 7.79167 4.77047 7.79167 4.95833V7.27954C7.6038 7.38772 7.44335 7.53768 7.32275 7.71783C7.20215 7.89797 7.12464 8.10346 7.09622 8.31838C7.0678 8.53329 7.08923 8.75187 7.15885 8.95717C7.22848 9.16247 7.34442 9.34899 7.49772 9.50228C7.65101 9.65557 7.83753 9.77152 8.04283 9.84115C8.24813 9.91077 8.46671 9.9322 8.68162 9.90378C8.89654 9.87536 9.10203 9.79785 9.28217 9.67725C9.46232 9.55665 9.61228 9.3962 9.72046 9.20833H11.3333ZM1.29413 4.80533C1.15403 4.80533 1.01708 4.84688 0.900596 4.92471C0.784112 5.00254 0.693323 5.11317 0.639711 5.2426C0.586099 5.37203 0.572071 5.51445 0.599402 5.65186C0.626734 5.78926 0.694196 5.91547 0.793258 6.01453C0.89232 6.1136 1.01853 6.18106 1.15594 6.20839C1.29334 6.23572 1.43576 6.22169 1.56519 6.16808C1.69462 6.11447 1.80525 6.02368 1.88308 5.9072C1.96092 5.79071 2.00246 5.65376 2.00246 5.51367C2.00246 5.3258 1.92783 5.14564 1.79499 5.0128C1.66215 4.87996 1.48199 4.80533 1.29413 4.80533ZM1.41667 8.5C1.41667 8.3599 1.37512 8.22296 1.29729 8.10647C1.21946 7.98999 1.10883 7.8992 0.979401 7.84558C0.84997 7.79197 0.707548 7.77795 0.570145 7.80528C0.432741 7.83261 0.306529 7.90007 0.207466 7.99913C0.108404 8.0982 0.0409419 8.22441 0.0136107 8.36181C-0.0137205 8.49921 0.000306907 8.64164 0.053919 8.77107C0.107531 8.9005 0.19832 9.01112 0.314805 9.08896C0.43129 9.16679 0.568239 9.20833 0.708334 9.20833C0.896195 9.20833 1.07636 9.13371 1.2092 9.00087C1.34204 8.86803 1.41667 8.68786 1.41667 8.5ZM8.5 15.5833C8.3599 15.5833 8.22296 15.6249 8.10647 15.7027C7.98999 15.7805 7.8992 15.8912 7.84558 16.0206C7.79197 16.15 7.77795 16.2925 7.80528 16.4299C7.83261 16.5673 7.90007 16.6935 7.99913 16.7925C8.0982 16.8916 8.22441 16.9591 8.36181 16.9864C8.49921 17.0137 8.64164 16.9997 8.77107 16.9461C8.9005 16.8925 9.01112 16.8017 9.08896 16.6852C9.16679 16.5687 9.20833 16.4318 9.20833 16.2917C9.20833 16.1038 9.13371 15.9236 9.00087 15.7908C8.86803 15.658 8.68786 15.5833 8.5 15.5833ZM2.98988 2.27163C2.84978 2.27163 2.71283 2.31317 2.59635 2.391C2.47986 2.46883 2.38907 2.57946 2.33546 2.70889C2.28185 2.83832 2.26782 2.98074 2.29515 3.11815C2.32248 3.25555 2.38995 3.38176 2.48901 3.48083C2.58807 3.57989 2.71428 3.64735 2.85169 3.67468C2.98909 3.70201 3.13151 3.68798 3.26094 3.63437C3.39037 3.58076 3.501 3.48997 3.57883 3.37349C3.65667 3.257 3.69821 3.12005 3.69821 2.97996C3.69821 2.7921 3.62358 2.61193 3.49074 2.47909C3.3579 2.34625 3.17774 2.27163 2.98988 2.27163ZM5.51013 0.595708C5.37003 0.595708 5.23308 0.637251 5.1166 0.715084C5.00011 0.792917 4.90932 0.903543 4.85571 1.03297C4.8021 1.16241 4.78807 1.30483 4.8154 1.44223C4.84273 1.57963 4.9102 1.70585 5.00926 1.80491C5.10832 1.90397 5.23453 1.97143 5.37194 1.99876C5.50934 2.0261 5.65176 2.01207 5.78119 1.95846C5.91062 1.90484 6.02125 1.81406 6.09908 1.69757C6.17692 1.58109 6.21846 1.44414 6.21846 1.30404C6.21846 1.11618 6.14383 0.936013 6.01099 0.803174C5.87815 0.670336 5.69799 0.595708 5.51013 0.595708ZM1.29413 10.778C1.15403 10.778 1.01708 10.8195 0.900596 10.8974C0.784112 10.9752 0.693323 11.0858 0.639711 11.2153C0.586099 11.3447 0.572071 11.4871 0.599402 11.6245C0.626734 11.7619 0.694196 11.8881 0.793258 11.9872C0.89232 12.0863 1.01853 12.1537 1.15594 12.1811C1.29334 12.2084 1.43576 12.1944 1.56519 12.1407C1.69462 12.0871 1.80525 11.9963 1.88308 11.8799C1.96092 11.7634 2.00246 11.6264 2.00246 11.4863C2.00246 11.2985 1.92783 11.1183 1.79499 10.9855C1.66215 10.8526 1.48199 10.778 1.29413 10.778ZM2.98988 13.3117C2.84978 13.3117 2.71283 13.3533 2.59635 13.4311C2.47986 13.5089 2.38907 13.6195 2.33546 13.749C2.28185 13.8784 2.26782 14.0208 2.29515 14.1582C2.32248 14.2956 2.38995 14.4218 2.48901 14.5209C2.58807 14.62 2.71428 14.6874 2.85169 14.7148C2.98909 14.7421 3.13151 14.7281 3.26094 14.6745C3.39037 14.6208 3.501 14.5301 3.57883 14.4136C3.65667 14.2971 3.69821 14.1601 3.69821 14.02C3.69821 13.8322 3.62358 13.652 3.49074 13.5192C3.3579 13.3863 3.17774 13.3117 2.98988 13.3117ZM5.51013 14.9876C5.37003 14.9876 5.23308 15.0292 5.1166 15.107C5.00011 15.1848 4.90932 15.2955 4.85571 15.4249C4.8021 15.5543 4.78807 15.6967 4.8154 15.8341C4.84273 15.9715 4.9102 16.0978 5.00926 16.1968C5.10832 16.2959 5.23453 16.3633 5.37194 16.3907C5.50934 16.418 5.65176 16.404 5.78119 16.3504C5.91062 16.2968 6.02125 16.206 6.09908 16.0895C6.17692 15.973 6.21846 15.8361 6.21846 15.696C6.21846 15.5081 6.14383 15.3279 6.01099 15.1951C5.87815 15.0623 5.69799 14.9876 5.51013 14.9876ZM15.7059 10.778C15.5658 10.778 15.4288 10.8195 15.3123 10.8974C15.1959 10.9752 15.1051 11.0858 15.0515 11.2153C14.9978 11.3447 14.9838 11.4871 15.0112 11.6245C15.0385 11.7619 15.1059 11.8881 15.205 11.9872C15.3041 12.0863 15.4303 12.1537 15.5677 12.1811C15.7051 12.2084 15.8475 12.1944 15.9769 12.1407C16.1064 12.0871 16.217 11.9963 16.2948 11.8799C16.3727 11.7634 16.4142 11.6264 16.4142 11.4863C16.4142 11.2985 16.3396 11.1183 16.2067 10.9855C16.0739 10.8526 15.8937 10.778 15.7059 10.778ZM14.0101 13.3117C13.87 13.3117 13.7331 13.3533 13.6166 13.4311C13.5001 13.5089 13.4093 13.6195 13.3557 13.749C13.3021 13.8784 13.2881 14.0208 13.3154 14.1582C13.3427 14.2956 13.4102 14.4218 13.5093 14.5209C13.6083 14.62 13.7345 14.6874 13.8719 14.7148C14.0093 14.7421 14.1518 14.7281 14.2812 14.6745C14.4106 14.6208 14.5212 14.5301 14.5991 14.4136C14.6769 14.2971 14.7185 14.1601 14.7185 14.02C14.7185 13.8322 14.6438 13.652 14.511 13.5192C14.3782 13.3863 14.198 13.3117 14.0101 13.3117ZM11.4899 14.9876C11.3498 14.9876 11.2128 15.0292 11.0963 15.107C10.9799 15.1848 10.8891 15.2955 10.8355 15.4249C10.7818 15.5543 10.7678 15.6967 10.7952 15.8341C10.8225 15.9715 10.8899 16.0978 10.989 16.1968C11.0881 16.2959 11.2143 16.3633 11.3517 16.3907C11.4891 16.418 11.6315 16.404 11.7609 16.3504C11.8904 16.2968 12.001 16.206 12.0788 16.0895C12.1567 15.973 12.1982 15.8361 12.1982 15.696C12.1982 15.5081 12.1236 15.3279 11.9907 15.1951C11.8579 15.0623 11.6777 14.9876 11.4899 14.9876Z" fill="#374957"/>
    </g>
    <defs>
      <clipPath id="clip0_1984_9680">
        <rect width="17" height="17" fill="white"/>
      </clipPath>
    </defs>
  </svg>
  {job.expiry}
</div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 8C9.06087 8 10.0783 7.57857 10.8284 6.82843C11.5786 6.07828 12 5.06087 12 4C12 2.93913 11.5786 1.92172 10.8284 1.17157C10.0783 0.421427 9.06087 0 8 0C6.93913 0 5.92172 0.421427 5.17157 1.17157C4.42143 1.92172 4 2.93913 4 4C4 5.06087 4.42143 6.07828 5.17157 6.82843C5.92172 7.57857 6.93913 8 8 8ZM2 14.6667C2 12.2667 5.93333 11.3333 8 11.3333C10.0667 11.3333 14 12.2667 14 14.6667V16H2V14.6667Z" fill="currentColor"/>
                  </svg>
                  {job.applied} Applied
                </span>
                <span className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3C4.66667 3 1.82 5.07333 0.666667 8C1.82 10.9267 4.66667 13 8 13C11.3333 13 14.18 10.9267 15.3333 8C14.18 5.07333 11.3333 3 8 3ZM8 11.3333C6.16 11.3333 4.66667 9.84 4.66667 8C4.66667 6.16 6.16 4.66667 8 4.66667C9.84 4.66667 11.3333 6.16 11.3333 8C11.3333 9.84 9.84 11.3333 8 11.3333ZM8 6C6.89333 6 6 6.89333 6 8C6 9.10667 6.89333 10 8 10C9.10667 10 10 9.10667 10 8C10 6.89333 9.10667 6 8 6Z" fill="currentColor"/>
                  </svg>
                  {job.views} Views
                </span>
              </div>
              
<div className="flex gap-2">
  <Link
    to={`/jobs/${job.id}/apply`}
    className="bg-[#FFCF3F] hover:bg-[#e6ba39] px-4 py-2 rounded-lg text-sm font-medium"
  >
    Apply Now
  </Link>

  <Link
    to={`/jobs/${job.id}`}
    className="bg-[#FFE7A4] border hover:bg-[#f5dd94] px-4 py-2 rounded-lg text-sm font-medium"
  >
    View Details
  </Link>
</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const DealRoomSection = React.memo(({ company }) => {
  const [activeTab, setActiveTab] = useState("My Participants");
  
  const tabs = ["My Deals", "My Participants"];
  
  // Mock deals data
  const deals = [
    {
      id: 1,
      title: "My Test Oil Platform Acquisition",
      type: "Acquisition",
      description: "Testing deal room creation for authenticated us",
      estimatedValue: "50M",
      targetClosed: "21/09/2025",
      status: "Active",
      participants: 1,
      files: 0,
      verified: true
    },
    {
      id: 2,
      title: "My Test Oil Platform Acquisition",
      type: "Acquisition",
      description: "Testing deal room creation for authenticated us",
      estimatedValue: "50M",
      targetClosed: "21/09/2025",
      status: "Active",
      participants: 1,
      files: 0,
      verified: true
    },
    {
      id: 3,
      title: "My Test Oil Platform Acquisition",
      type: "Acquisition",
      description: "Testing deal room creation for authenticated us",
      estimatedValue: "50M",
      targetClosed: "21/09/2025",
      status: "Active",
      participants: 1,
      files: 0,
      verified: true
    },
    {
      id: 4,
      title: "My Test Oil Platform Acquisition",
      type: "Acquisition",
      description: "Testing deal room creation for authenticated us",
      estimatedValue: "50M",
      targetClosed: "21/09/2025",
      status: "Active",
      participants: 1,
      files: 0,
      verified: true
    }
  ];

    const participants = [
    {
      id: 1,
      title: "RENO Oil Platform",
      description: "Secure collaboration spaces for M&A and partnerships",
      dateCreated: "7/10/2025",
      documents: 12,
      participantCount: 23
    },
    {
      id: 2,
      title: "RENO Oil Platform",
      description: "Secure collaboration spaces for M&A and partnerships",
      dateCreated: "7/10/2025",
      documents: 12,
      participantCount: 23
    },
    {
      id: 3,
      title: "RENO Oil Platform",
      description: "Secure collaboration spaces for M&A and partnerships",
      dateCreated: "7/10/2025",
      documents: 12,
      participantCount: 23
    },
    {
      id: 4,
      title: "RENO Oil Platform",
      description: "Secure collaboration spaces for M&A and partnerships",
      dateCreated: "7/10/2025",
      documents: 12,
      participantCount: 23
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Tabs and Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "h-[48px] px-5 rounded-xl text-sm font-medium transition-colors border",
                activeTab === tab
                  ? "bg-white border-gray-300 text-gray-900"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <Link
  to={`/deal-rooms?company=${company?.id || ''}`}
  className="inline-flex items-center gap-2 px-5 py-3 bg-[#FFE8A3] hover:bg-[#FFD700] rounded-xl transition-colors font-medium text-gray-900 text-sm"
>
  visit Deal room
</Link>
      </div>

      {/* Section Title */}
      <h2 className="text-2xl font-bold text-gray-900">{activeTab}</h2>


{/* Content based on active tab */}
{activeTab === "My Participants" ? (
  // My Participants Cards
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {participants.map((participant) => (
      <div key={participant.id} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow">
        <h3 className="font-semibold text-lg text-gray-900">{participant.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{participant.description}</p>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Date Created: {participant.dateCreated}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M9 1H3C2.44772 1 2 1.44772 2 2V14C2 14.5523 2.44772 15 3 15H13C13.5523 15 14 14.5523 14 14V6L9 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M9 1V6H14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span>Documents: {participant.documents}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 14C2 11 4.5 9 8 9C11.5 9 14 11 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Participants: {participant.participantCount}</span>
          </div>
        </div>
        
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3C4.5 3 1.5 5.5 0.5 8C1.5 10.5 4.5 13 8 13C11.5 13 14.5 10.5 15.5 8C14.5 5.5 11.5 3 8 3Z" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          View
        </button>
      </div>
    ))}
  </div>
) : (
  // My Deals Cards
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {deals.map((deal) => (
      <div key={deal.id} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow">
        {/* Icon */}
        <div className="w-12 h-12 bg-[#FFE8A3] rounded-xl flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#374957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#374957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 13H8" stroke="#374957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17H8" stroke="#374957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9H9H8" stroke="#374957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Title and Type */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-gray-900">{deal.title}</h3>
          <span className="inline-block bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200">
            {deal.type}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">{deal.description}</p>

        {/* Details */}
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Estimated value :</span>
            <span className="font-semibold text-gray-900">{deal.estimatedValue}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Target closed :</span>
            <span className="font-semibold text-gray-900">{deal.targetClosed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <span 
              className="font-semibold px-3 py-1 rounded-md"
              style={{
                color: '#00D707',
                backgroundColor: '#00D7071C'
              }}
            >
              {deal.status}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="font-medium text-gray-700">{deal.participants}</span>
            </span>
            
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 19 19" fill="none">
                <g clipPath="url(#clip0_1984_10255)">
                  <path d="M13.458 11.0834C13.458 11.2933 13.3746 11.4947 13.2261 11.6431C13.0777 11.7916 12.8763 11.875 12.6663 11.875H6.33301C6.12304 11.875 5.92168 11.7916 5.77322 11.6431C5.62475 11.4947 5.54134 11.2933 5.54134 11.0834C5.54134 10.8734 5.62475 10.672 5.77322 10.5236C5.92168 10.3751 6.12304 10.2917 6.33301 10.2917H12.6663C12.8763 10.2917 13.0777 10.3751 13.2261 10.5236C13.3746 10.672 13.458 10.8734 13.458 11.0834ZM10.2913 13.4584H6.33301C6.12304 13.4584 5.92168 13.5418 5.77322 13.6902C5.62475 13.8387 5.54134 14.0401 5.54134 14.25C5.54134 14.46 5.62475 14.6613 5.77322 14.8098C5.92168 14.9583 6.12304 15.0417 6.33301 15.0417H10.2913C10.5013 15.0417 10.7027 14.9583 10.8511 14.8098C10.9996 14.6613 11.083 14.46 11.083 14.25C11.083 14.0401 10.9996 13.8387 10.8511 13.6902C10.7027 13.5418 10.5013 13.4584 10.2913 13.4584Z" fill="#374957"/>
                </g>
              </svg>
              <span className="font-medium text-gray-700">{deal.files}</span>
            </span>
            
            {deal.verified && (
              <span className="flex items-center gap-1.5 text-gray-700">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <g clipPath="url(#clip0_1984_10257)">
                    <path d="M12.6667 0H3.33333C2.4496 0.00105857 1.60237 0.352588 0.97748 0.97748C0.352588 1.60237 0.00105857 2.4496 0 3.33333L0 12.6667C0.00105857 13.5504 0.352588 14.3976 0.97748 15.0225C1.60237 15.6474 2.4496 15.9989 3.33333 16H12.6667C13.5504 15.9989 14.3976 15.6474 15.0225 15.0225C15.6474 14.3976 15.9989 13.5504 16 12.6667V3.33333C15.9989 2.4496 15.6474 1.60237 15.0225 0.97748C14.3976 0.352588 13.5504 0.00105857 12.6667 0V0ZM14.6667 12.6667C14.6667 13.1971 14.456 13.7058 14.0809 14.0809C13.7058 14.456 13.1971 14.6667 12.6667 14.6667H3.33333C2.8029 14.6667 2.29419 14.456 1.91912 14.0809C1.54405 13.7058 1.33333 13.1971 1.33333 12.6667V3.33333C1.33333 2.8029 1.54405 2.29419 1.91912 1.91912C2.29419 1.54405 2.8029 1.33333 3.33333 1.33333H12.6667C13.1971 1.33333 13.7058 1.54405 14.0809 1.91912C14.456 2.29419 14.6667 2.8029 14.6667 3.33333V12.6667Z" fill="#374957"/>
                    <path d="M6.2222 10.6132L3.60954 8.00052C3.48452 7.87554 3.31498 7.80533 3.1382 7.80533C2.96143 7.80533 2.79189 7.87554 2.66687 8.00052C2.54189 8.12554 2.47168 8.29508 2.47168 8.47185C2.47168 8.64863 2.54189 8.81817 2.66687 8.94319L5.27954 11.5558C5.40336 11.6797 5.55037 11.778 5.71217 11.845C5.87397 11.9121 6.0474 11.9466 6.22254 11.9466C6.39768 11.9466 6.5711 11.9121 6.73291 11.845C6.89471 11.778 7.04172 11.6797 7.16554 11.5558L13.3335 5.38786C13.4585 5.26284 13.5287 5.0933 13.5287 4.91652C13.5287 4.73975 13.4585 4.57021 13.3335 4.44519C13.2085 4.32021 13.039 4.25 12.8622 4.25C12.6854 4.25 12.5159 4.32021 12.3909 4.44519L6.2222 10.6132Z" fill="#374957"/>
                  </g>
                </svg>
                <span className="font-medium text-xs">Verified</span>
              </span>
            )}
          </div>
          
          <Link
  to={`/deal-rooms/${deal.id}`}
  className="px-4 py-2 bg-[#FFE8A3] hover:bg-[#FFD700] rounded-xl text-xs sm:text-sm font-medium text-gray-900 transition-colors whitespace-nowrap"
>
  View Details
</Link>
        </div>
      </div>
    ))}
  </div>
)}
    </div>
  );
});

// ==========================================
// SERVICES SECTION COMPONENT (with bottom "View more services" button)
// Add this at the bottom of your file (before export default CompanyProfile)
// ==========================================

const ServicesSection = React.memo(({ company }) => {
  // Use actual company services data
  const services = company?.services || [];

  // Helper function to strip HTML tags and truncate text
  const getTruncatedText = (htmlString, maxLength = 150) => {
    if (!htmlString) return "No description available";
    
    // Strip HTML tags
    const strippedText = htmlString.replace(/<[^>]*>/g, ' ')
                                   .replace(/&nbsp;/g, ' ')
                                   .replace(/\s+/g, ' ')
                                   .trim();
    
    // Truncate if longer than maxLength
    if (strippedText.length > maxLength) {
      return strippedText.substring(0, maxLength) + '...';
    }
    
    return strippedText;
  };

  return (
    <div className="space-y-4">
      {/* Services List */}
      {services.length > 0 ? (
        <>
          {services.map((service) => (
            <div key={service.id} className="bg-white border rounded-xl p-6 space-y-4 hover:shadow-md transition">
              {/* Service Header */}
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">{service.title || service.name}</h3>
                
                {/* Bookmark Icon */}
                <button className="text-gray-400 hover:text-gray-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Description - Truncated */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {getTruncatedText(service.description || service.about, 150)}
              </p>

              {/* Footer with Company Info and View Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden">
                    <img 
                      src={company?.logo || "images/default-company-logo.png"} 
                      alt={company?.company_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<span class="text-xs font-bold">' + (company?.company_name?.charAt(0) || 'C') + '</span>';
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{company?.company_name || "Company"}</span>
                </div>

                {/* View Button with Link */}
                <Link 
                  to={`/services/${service.id}`}
                  className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          ))}

          {/* "View more services" button at the bottom - centered */}
          <div className="flex justify-center pt-6">
            <Link 
              to={`/co/services?company=${company?.id}`}
              className="bg-yellow-400 hover:bg-yellow-500 px-8 py-3 rounded-full text-sm font-medium transition-colors"
            >
              View more services
            </Link>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <p className="text-gray-500">No services available yet</p>
        </div>
      )}
    </div>
  );
});

const ProductsSection = React.memo(({ company }) => {
  const products = company?.products || [];

  return (
    <div className="space-y-6">
      {products.length > 0 ? (
        <>
          {/* Products Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link 
                key={product.id} 
                to={`/products/${product.id}`}
                className="block"
              >
                <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition">
                  {/* Product Image */}
                  <div className="aspect-[4/3] bg-gray-200">
                    <img 
                      src={product.image || product.product_image || product.images?.[0] || "/images/default-product.png"}
                      alt={product.name || product.title || "Product"}
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        e.target.onerror = null;
                        e.target.src = "/images/default-product.png"; 
                      }}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4 space-y-1">
                    <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
                      {product.name || product.title || product.product_name || "Untitled Product"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {company?.company_name || "Connectize"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View more products button */}
          <div className="flex justify-center pt-4">
            <Link 
              to={`/products?company=${company?.id}`}
              className="bg-yellow-400 hover:bg-yellow-500 px-8 py-3 rounded-full text-sm font-medium transition-colors inline-block"
            >
              View more products
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products available yet</p>
        </div>
      )}
    </div>
  );
});

const ActivitiesSection = React.memo(({ company }) => {
  // State for post creation
  const [postContent, setPostContent] = React.useState("");
  const [selectedImage, setSelectedImage] = React.useState(null);
  const fileInputRef = React.useRef(null);

  // Use real posts/activities data from company
  const posts = company?.posts || company?.activities || [];

  // Handle image selection
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // You can also preview the image here if needed
    }
  };

  // Handle post creation
  const handleCreatePost = () => {
    if (!postContent.trim() && !selectedImage) return;
    
    // TODO: Add your API call here to create the post
    console.log('Creating post:', {
      content: postContent,
      image: selectedImage,
      company_id: company?.id
    });
    
    // Reset form after posting
    setPostContent("");
    setSelectedImage(null);
  };

  return (
    <div className="space-y-4">
      {/* Create Post Section */}
      <div className="bg-white rounded-lg p-6">
        {/* Input field */}
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full text-gray-400 text-xl mb-4 resize-none border-none outline-none focus:ring-0"
          rows={2}
        />
        
        <div className="flex items-center justify-between">
          {/* Media buttons */}
          <div className="flex gap-3">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Image button */}
            <button 
              onClick={handleImageClick}
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
              title="Add image"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 5C2.5 4.33696 2.76339 3.70107 3.23223 3.23223C3.70107 2.76339 4.33696 2.5 5 2.5H15C15.663 2.5 16.2989 2.76339 16.7678 3.23223C17.2366 3.70107 17.5 4.33696 17.5 5V15C17.5 15.663 17.2366 16.2989 16.7678 16.7678C16.2989 17.2366 15.663 17.5 15 17.5H5C4.33696 17.5 3.70107 17.2366 3.23223 16.7678C2.76339 16.2989 2.5 15.663 2.5 15V5Z" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 8.125C7.84518 8.125 8.125 7.84518 8.125 7.5C8.125 7.15482 7.84518 6.875 7.5 6.875C7.15482 6.875 6.875 7.15482 6.875 7.5C6.875 7.84518 7.15482 8.125 7.5 8.125Z" fill="#22C55E" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5 11.25L13.125 6.875L5 15" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* GIF button */}
            <button 
              onClick={() => {
                // TODO: Add GIF picker modal here
                console.log('GIF button clicked');
                alert('GIF picker would open here - needs integration');
              }}
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
              title="Add GIF"
            >
              <span className="text-orange-500 font-bold text-sm">GIF</span>
            </button>

            {/* Emoji button */}
            <button 
              onClick={() => {
                // TODO: Add emoji picker here
                console.log('Emoji button clicked');
                alert('Emoji picker would open here - needs integration');
              }}
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
              title="Add emoji"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="7.5" stroke="#F59E0B" strokeWidth="1.5"/>
                <circle cx="7.5" cy="8.75" r="0.625" fill="#F59E0B"/>
                <circle cx="12.5" cy="8.75" r="0.625" fill="#F59E0B"/>
                <path d="M7.5 11.875C7.5 11.875 8.125 13.125 10 13.125C11.875 13.125 12.5 11.875 12.5 11.875" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Create Post button */}
          <button 
            onClick={handleCreatePost}
            disabled={!postContent.trim() && !selectedImage}
            className="bg-yellow-400 hover:bg-yellow-500 px-8 py-2.5 rounded-full font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Post
          </button>
        </div>

        {/* Show selected image preview */}
        {selectedImage && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Image selected: {selectedImage.name}</span>
            <button 
              onClick={() => setSelectedImage(null)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        )}

        {/* Yellow divider line */}
        <div className="border-t border-yellow-400 mt-4"></div>
      </div>

      {/* Posts Feed */}
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg p-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Company Logo */}
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center overflow-hidden">
                  {post.author_avatar || company?.logo ? (
                    <img 
                      src={post.author_avatar || company?.logo}
                      alt={post.author || company?.company_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<span class="text-xl font-bold">' + (company?.company_name?.charAt(0) || 'C') + '</span>';
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold">{company?.company_name?.charAt(0) || 'C'}</span>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-black">
                      {post.author || company?.company_name || "Connectize"}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {post.username || `@${company?.slug || "prosper"}`}
                    </span>
                    <span className="text-gray-400 text-sm">
                      • {post.timestamp || post.created_at || "a week ago"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Three dots menu */}
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>

            {/* Post Content - YELLOW TEXT */}
            <p className="text-yellow-500 font-medium mb-4">
              {post.content || post.text || post.description || ""}
            </p>

            {/* Post Actions */}
            <div className="flex items-center gap-6 text-gray-500 text-sm">
              {/* Comments */}
              <button className="flex items-center gap-1.5 hover:text-blue-500">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M6 14H14L18 18V4C18 3.46957 17.7893 2.96086 17.4142 2.58579C17.0391 2.21071 16.5304 2 16 2H4C3.46957 2 2.96086 2.21071 2.58579 2.58579C2.21071 2.96086 2 3.46957 2 4V14C2 14.5304 2.21071 15.0391 2.58579 15.4142C2.96086 15.7893 3.46957 16 4 16H6V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{post.comments || post.comments_count || 0}</span>
              </button>

              {/* Likes */}
              <button className="flex items-center gap-1.5 hover:text-red-500">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 17.5L8.825 16.45C4.5 12.525 1.875 10.175 1.875 7.25C1.875 4.9 3.65 3.125 6 3.125C7.325 3.125 8.5875 3.7375 10 4.7375C11.4125 3.7375 12.675 3.125 14 3.125C16.35 3.125 18.125 4.9 18.125 7.25C18.125 10.175 15.5 12.525 11.175 16.45L10 17.5Z" fill="currentColor"/>
                </svg>
                <span>{post.likes || post.likes_count || 1}</span>
              </button>

              {/* Downloads */}
              <button className="flex items-center gap-1.5 hover:text-green-500">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 13.75L6.25 10L7.3125 8.9375L9.375 11V3.75H10.625V11L12.6875 8.9375L13.75 10L10 13.75ZM5 16.25C4.65833 16.25 4.36979 16.1302 4.13438 15.8906C3.89896 15.651 3.78125 15.3583 3.75 15V12.5H5V15H15V12.5H16.25V15C16.25 15.3417 16.1302 15.6302 15.8906 15.8656C15.651 16.101 15.3583 16.2187 15 16.25H5Z" fill="currentColor"/>
                </svg>
              </button>

              {/* Share */}
              <button className="flex items-center gap-1.5 hover:text-blue-500">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M15 6.66667C16.3807 6.66667 17.5 5.54738 17.5 4.16667C17.5 2.78595 16.3807 1.66667 15 1.66667C13.6193 1.66667 12.5 2.78595 12.5 4.16667C12.5 5.54738 13.6193 6.66667 15 6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 12.5C6.38071 12.5 7.5 11.3807 7.5 10C7.5 8.61929 6.38071 7.5 5 7.5C3.61929 7.5 2.5 8.61929 2.5 10C2.5 11.3807 3.61929 12.5 5 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 18.3333C16.3807 18.3333 17.5 17.214 17.5 15.8333C17.5 14.4526 16.3807 13.3333 15 13.3333C13.6193 13.3333 12.5 14.4526 12.5 15.8333C12.5 17.214 13.6193 18.3333 15 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.15833 11.1417L12.85 14.6917" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12.8417 5.30833L7.15833 8.85833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))
      ) : (
        /* Empty State */
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No activities yet</p>
        </div>
      )}
    </div>
  );
});
export default CompanyProfile;