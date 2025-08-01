import {
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Badge } from "@chakra-ui/react";
import { LocationOnOutlined, PersonOutline } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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
import { capitalizeFirst } from "../../lib/utils";

const emptyWord = "Not Added";

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  // console.log(userId);

  const { data: paramUser, isLoading } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId && !!currentUser,
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
            <ProfileSection title="Short Bio">
              <LightParagraph>
                {bio || "User have not added a bio"}
              </LightParagraph>
            </ProfileSection>
            <ProfileSection title="about">
              <ul className="space-y-4 divide-y">
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
                  value={phone_number}
                />
                <ProfileAboutList
                  Icon={MailOutlined}
                  title="Email"
                  value={email}
                />
              </ul>
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
              associated
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
  return (
    <li className="flex gap-2 items-start pt-4">
      <Icon className="!size-6 xs:!size-5" />
      <div className="flex gap-1 items-baseline max-sm:flex-col">
        <strong className="leading-none">{title}:</strong>
        <LightParagraph>
          {value && formattedValue?.includes("http") ? (
            <a href={value} target="__blank" className="!underline">
              {value}
            </a>
          ) : formattedTitle?.includes("email") &&
            formattedValue?.includes("@") ? (
            <a
              href={`mailto:${value}`}
              target="__blank"
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
