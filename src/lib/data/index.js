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
import UserIcon from "../../icon/UserIcon";
import { UserCircleIcon } from "@heroicons/react/24/outline";

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
    name: "Profile",
    to: webRoutes.userProfile,
    icon: UserCircleIcon,
    smallNavigation: true,
  },
  {
    name: "Representatives",
    to: webRoutes.representatives,
    icon: UserGroup,
    smallNavigation: true,
  },
  {
    name: "Messages",
    to: webRoutes.messages,
    icon: Message,
    smallNavigation: true,
  },
  {
    name: "Companies",
    to: webRoutes.companies,
    icon: CompanyIcon,
    smallNavigation: true,
  },
  {
    name: "Settings",
    to: webRoutes.settings,
    icon: Setting,
    smallNavigation: false,
  },
  {
    name: "Market",
    to: webRoutes.market,
    icon: StoreIcon,
    smallNavigation: true,
  },
  // {
  //   name: "Bookmarks",
  //   to: webRoutes.bookmarks,
  //   icon: BookmarkFilledIcon,
  //   smallNavigation: false,
  // },
  // {
  //   name: "Support",
  //   to: webRoutes.support,
  //   icon: Support,
  //   smallNavigation: false,
  // },
  // { name: "Analysis", to: webRoutes.analysis, icon: ChartBar, smallNavigation: false },
];
// Hub Navigation Items - Oil & Gas Platform Features
export const hubNavItems = [
  {
    name: "Platform Dashboard",
    to: webRoutes.platformDashboard,
    icon: "PlatformDashboard",
    description: "Overview of platform activities"
  },
  {
    name: "Deal Rooms",
    to: webRoutes.dealRooms,
    icon: "DealIcon",
    description: "Manage oil & gas deals",
    subItems: [
      { name: "All Deal Rooms", to: webRoutes.dealRooms },
      { name: "Create Deal Room", to: webRoutes.dealRoomCreate },
      { name: "My Participations", to: webRoutes.myParticipations }
    ]
  },
  {
    name: "Workforce",
    to: webRoutes.workforceJobs,
    icon: "BriefCaseIcon",
    description: "Job marketplace and events",
    subItems: [
      { name: "Job Marketplace", to: webRoutes.workforceJobs },
      { name: "Saved Jobs", to: webRoutes.workforceSavedJobs },
      { name: "My Posted Jobs", to: webRoutes.workforceMyPostedJobs },
      { name: "My Applications", to: webRoutes.workforceApplications },
      { name: "Professionals", to: webRoutes.workforceProfiles },
      { name: "Industry Events", to: webRoutes.workforceEvents },
      { name: "My Registered Events", to: webRoutes.workforceMyRegistrations },
      { name: "My Created Events", to: webRoutes.workforceMyEvents }
    ]
  },
  // {
  //   name: "AI Services",
  //   to: webRoutes.aiDashboard,
  //   icon: "AISecondIcon",
  //   description: "AI-powered insights",
  //   subItems: [
  //     { name: "AI Dashboard", to: webRoutes.aiDashboard },
  //     { name: "Smart Matching", to: webRoutes.aiMatching },
  //     { name: "Opportunities", to: webRoutes.aiOpportunities }
  //   ]
  // },
  {
    name: "Knowledge Hub",
    to: webRoutes.knowledgeHub,
    icon: "OpenBookIcon",
    description: "Industry knowledge base",
    subItems: [
      { name: "Articles", to: webRoutes.knowledgeArticles },
      { name: "Forums", to: webRoutes.knowledgeForums },
      // { name: "Topics", to: webRoutes.knowledgeTopics },
      { name: "Categories", to: webRoutes.knowledgeCategories },
      { name: "Search", to: webRoutes.knowledgeSearch },
    ]
  },
  {
    name: "Logistics Hub",
    to: webRoutes.logisticsDashboard,
    icon: "LogisticIcon",
    description: "Supply chain management",
    subItems: [
      { name: "Logistics Overview", to: webRoutes.logisticsDashboard },
      { name: "Shipment Requests", to: webRoutes.logisticsRequests },
      { name: "Inventory", to: webRoutes.logisticsInventory },
      { name: "Shipments", to: webRoutes.logisticsShipments },
      { name: "Become a Provider", to: webRoutes.logisticsBecomeProvider },
      { name: "Provider Dashboard", to: webRoutes.logisticsProviderDashboard }
    ]
  },
  {
    name: "Marketplace",
    to: webRoutes.marketplace,
    icon: "StoreIcon",
    description: "Buy and sell products",
    subItems: [
      { name: "Browse Listings", to: webRoutes.marketplace },
      { name: "My Listings", to: webRoutes.marketplaceMyListings },
      { name: "Create Listing", to: webRoutes.marketplaceCreateListing },
      { name: "Shopping Cart", to: webRoutes.marketplaceCart },
      { name: "My Orders", to: webRoutes.marketplaceOrders },
      { name: "Seller Orders", to: webRoutes.marketplaceSellerOrders }
    ]
  },
  {
    name: "Subscriptions",
    to: webRoutes.subscriptions,
    icon: "CreditCardIcon",
    description: "Manage your subscription"
  }
];

// Admin Navigation Items
export const adminNavItems = [
  {
    name: "Admin Dashboard",
    to: "/admin/dashboard",
    icon: "Shield",
    description: "Comprehensive admin panel",
    requiresAdmin: true
  }
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
