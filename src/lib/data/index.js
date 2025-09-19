import { BookmarkFilledIcon } from "@radix-ui/react-icons";
import {
  CompanyIcon,
  HomeIcon,
  Message,
  Setting,
  StoreIcon,
  Support,
  UserGroup,
} from "../../icon";
import { webRoutes } from "../webRoutes";

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const feedNavItems = [
  { name: "Home", to: webRoutes.feed, icon: HomeIcon, smallNavigation: true },
  {
    name: "Messages",
    to: webRoutes.messages,
    icon: Message,
    smallNavigation: true,
  },
  {
    name: "Representatives",
    to: webRoutes.representatives,
    icon: UserGroup,
    smallNavigation: true,
  },
  {
    name: "Companies",
    to: webRoutes.companies,
    icon: CompanyIcon,
    smallNavigation: true,
  },
  {
    name: "Market",
    to: webRoutes.market,
    icon: StoreIcon,
    smallNavigation: true,
  },
  {
    name: "Bookmarks",
    to: webRoutes.bookmarks,
    icon: BookmarkFilledIcon,
    smallNavigation: false,
  },
  {
    name: "Settings",
    to: webRoutes.settings,
    icon: Setting,
    smallNavigation: false,
  },
  {
    name: "Support",
    to: webRoutes.support,
    icon: Support,
    smallNavigation: false,
  },
  // { name: "Analysis", to: webRoutes.analysis, icon: ChartBar, smallNavigation: false },
];

// index key for complete profile

export const currentProfileIndexKey = "currentProfileIndex";

// personal information
export const first_nameKey = "first_name";
export const last_nameKey = "last_name";
export const genderKey = "gender";
export const roleKey = "role";
export const ageKey = "age";
export const imageKey = "image";
// contact
export const personal_emailKey = "personal_email";
export const company_emailKey = "company_email";
export const phone_numberKey = "phone_number";
// address
export const nationalityKey = "nationality";
export const stateKey = "state";
export const cityKey = "city";
export const postal_codeKey = "postal_code";
export const company_addressKey = "company_address";
// bio
export const bioKey = "bio";
export const website_urlKey = "website_url";
export const social_media_urlKey = "social_media_url";
