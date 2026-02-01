import {
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Badge } from "@chakra-ui/react";
import { LocationOnOutlined, PersonOutline } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { use, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserById } from "../../api-services/users";
import { SuggestionList } from "../../components/admin/feeds/TopServiceSuggestions";
import { CreateNewLink } from "../../components/admin/markets/carousel";
import NoPage from "../../components/NoPage";
import PageLoading from "../../components/PageLoading";
import LightParagraph from "../../components/ParagraphText";
import SEO from "../../components/SEO";
import Header from "../../components/userProfile/header";
import ProfileSection from "../../components/userProfile/profile-section";
import UserProfileHeadings from "../../components/userProfile/user-profile-heading";
import { useAuth } from "../../context/userContext";
import { VerifiedIcon } from "../../icon";
import { CompanyUserType } from "../../lib/helpers/types";
import { capitalizeFirst, formatPhoneNumber, ensureUrlProtocol } from "../../lib/utils";
import { Calendar, Briefcase, FileText } from "lucide-react";
import { EventsSection } from "./companyProfile";
import { workforceAPI } from "../../api-services/workforce";
import ApplicationJobsCard from "../../components/workforce/ApplicationJobsCard";
import { dealRoomService, workforceService } from "../../api-services/oilgas";
import { DealRoomCard } from "../../components/dealRoom/DealRoomCard";

const emptyWord = "Not Added";

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('about');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

    useEffect(() => {
      loadMyRegistrations();
      loadApplications();
      loadJobs();
    }, []);
  
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
  // console.log(userId);

  const { data: paramUser, isLoading } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId && !!currentUser,
    // ✅ Cache profile data for instant display on revisit
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const headerProps = useMemo(
    () => ({
      banner: paramUser?.banner || "",
      name: `${paramUser?.first_name || ""} ${paramUser?.last_name || ""}`,
      logo: paramUser?.avatar || "",
    }),
    [paramUser]
  );

  if (isLoading) return <PageLoading hasLogo={false} />;
  if (!paramUser) return <NoPage />;

  const {
    verified,
    bio,
    email,
    gender,
    date_of_birth,
    role,
    address,
    city,
    region,
    phone_number,
    country,
  } = paramUser;

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-md overflow-hidden">
      <SEO
        title={`${paramUser?.first_name || paramUser?.email || ""} ${
          paramUser?.last_name || ""
        } | connectize`}
      />
      <Header type="user" {...headerProps} />

      <section className="mt-8 container !px-0 space-y-6">
        <UserProfileHeadings {...paramUser} />

        {currentUser &&
          currentUser?.companies?.length < 1 &&
          currentUser?.user_type === CompanyUserType && (
            <CreateNewLink text="Create company" url="/create-company" />
          )}

        <section className="flex max-lg:flex-col gap-y-4 gap-x-3 w-full">
          <section className="space-y-4 lg:w-[65.5%] shrink-0">

            {/* Tabbed About Section */}
            <ProfileSection title="">
              <div className="border-b">
                <div className="flex gap-8">
                  {[
                    { id: 'about', label: 'About', icon: null },
                    { id: 'events', label: 'Events', icon: null },
                    { id: 'workforce', label: 'Workforce', icon: null },
                    { id: 'deals', label: 'My Deals', icon:null }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-4 px-2 font-medium text-sm transition-all ${
                        activeTab === tab.id
                          ? 'text-gray-900 border-b-2 border-gold'
                          : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {tab.icon && <tab.icon className="w-4 h-4" />}
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'about' && (
                  <div className="space-y-4">
                  <ProfileSection title="Short Bio">
                    <LightParagraph>
                      {bio || "User have not added a bio"}
                    </LightParagraph>
                  </ProfileSection>
                  <ProfileSection title="About" >
                    {currentUser?.id === Number(userId) && (
                      <ProfileAboutList
                        Icon={PersonOutline}
                        title="Gender"
                        value={
                          gender ? (
                            <>
                              {gender}{" "}
                              <Badge className="!text-[.55rem]">
                                only visible to you
                              </Badge>
                            </>
                          ) : (
                            emptyWord
                          )
                        }
                      />
                    )}
                    {currentUser?.id === Number(userId) && (
                      <ProfileAboutList
                        Icon={CalendarOutlined}
                        title="Date of Birth"
                        value={
                          date_of_birth ? (
                            <>
                              {date_of_birth}{" "}
                              <Badge className="!text-[.55rem]">
                                only visible to you
                              </Badge>
                            </>
                          ) : (
                            emptyWord
                          )
                        }
                      />
                    )}
                    <ProfileAboutList
                      Icon={TagOutlined}
                      title="Role"
                      value={role ? capitalizeFirst(role) : emptyWord}
                    />
                    <ProfileAboutList
                      Icon={LocationOnOutlined}
                      title="Location"
                      value={
                        address || city || region || country
                          ? `${address || ""} ${city || ""} ${region || ""} ${
                              country || ""
                            }`
                          : emptyWord
                      }
                    />
                    <ProfileAboutList
                      Icon={PhoneOutlined}
                      title="Phone number"
                      value={formatPhoneNumber(phone_number, country)}
                    />
                    <ProfileAboutList
                      Icon={MailOutlined}
                      title="Email"
                      value={email}
                    />
                  </ProfileSection>
                  </div>
                )}

                {activeTab === 'events' && (
                  registrations.length > 0 ? (
                    <EventsSection company={registrations} />
                  ) : (
                    <div className="py-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-gray-900 font-medium mb-2">No Events</h3>
                      <p className="text-gray-500 text-sm">This user hasn't created any events yet</p>
                    </div>
                  ) 
                )}

                {activeTab === 'workforce' && (
                  applications.length > 0 ? (
                    applications.map((job) => (
                      <ApplicationJobsCard key={job.id} job={job} setApplications={setApplications} />
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-gray-900 font-medium mb-2">No Workforce</h3>
                      <p className="text-gray-500 text-sm">This user hasn't added any workforce members</p>
                    </div>
                  )
                )}

                {activeTab === 'deals' && (
                  jobs.length > 0 ? (
                    <div className="md:bg-white border-gray-200 md:px-4  grid grid-cols-1 md:grid-cols-2 gap-6">
                      {jobs.slice(0,3).map((job) => (
                        <DealRoomCard key={job.id} deal={job} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-gray-900 font-medium mb-2">No Deals</h3>
                      <p className="text-gray-500 text-sm">This user hasn't posted any deals yet</p>
                    </div>
                  )
                )}
              </div>
            </ProfileSection>

            <ProfileSection title="Badges">
              <section className="flex flex-wrap gap-x-4 gap-y-2">
                {verified ? (
                  <ProfileBadge text="Identity Verified" color="black" />
                ) : (
                  <LightParagraph>No badge yet...</LightParagraph>
                )}
                {/* <ProfileBadge text="Premium" /> */}
              </section>
            </ProfileSection>
          </section>

          <ProfileSection title="People Associated" className="h-fit lg:w-1/3">
            <SuggestionList
              hasSeeMore
              associated={false}
              thisUser={paramUser}
              viewMoreUrl={`/co/representatives/?user=${paramUser?.id}&status=True`}
            />
          </ProfileSection>
        </section>
      </section>
    </section>
  );
}

export const ProfileAboutList = ({ title = "", value = "", Icon }) => {
  const formattedTitle = title?.toString().toLowerCase();
  const formattedValue = value?.toString().toLowerCase();
  
  // Check if this is a website/URL field
  const isWebsiteField = formattedTitle?.includes("website") || 
                         formattedTitle?.includes("link") ||
                         formattedTitle?.includes("url");
  
  // Check if value looks like a URL (has dots and no spaces, or contains http)
  const looksLikeUrl = value && (
    formattedValue?.includes("http") || 
    (formattedValue?.includes(".") && !formattedValue?.includes(" "))
  );
  
  return (
    <li className="flex gap-2 items-start pt-4">
      <Icon className="!size-6 xs:!size-5" />
      <div className="flex gap-1 items-baseline max-sm:flex-col">
        <strong className="leading-none">{title}:</strong>
        <LightParagraph>
          {(isWebsiteField || looksLikeUrl) && value ? (
            <a 
              href={ensureUrlProtocol(value)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="!text-gold font-bold hover:!underline"
            >
              {value}
            </a>
          ) : formattedTitle?.includes("email") &&
            formattedValue?.includes("@") ? (
            <a
              href={`mailto:${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="!text-gold font-bold hover:!underline"
            >
              {value}
            </a>
          ) : formattedTitle?.includes("phone") && value ? (
            <a
              href={`tel:${value?.replace(/\s/g, "")}`}
              className="!text-gold font-bold hover:!underline"
            >
              {value}
            </a>
          ) : (
            value || emptyWord
          )}{" "}
        </LightParagraph>
      </div>
    </li>
  );
};

const ProfileBadge = ({ color, text }) => {
  return (
    <Badge className="!normal-case !flex gap-1.5 items-center !bg-gray-100 !text-base xs:!text-sm">
      <VerifiedIcon color={color} className={color} />
      <span>{text}</span>
    </Badge>
  );
};
