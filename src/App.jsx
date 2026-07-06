import React, { lazy, Suspense } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import SEO from "./components/SEO";
import { webRoutes } from "./lib/webRoutes";
import AppLayout from "./pages/AppLayout";
import BiddingProjectDetail from "./pages/bidding/BiddingProjectDetail";
import FeedLayout from "./pages/FeedLayout";
import GlobalPrefetch from "./components/GlobalPrefetch";
import AuthLayout from "./pages/authentication/AuthLayout";
import ConfirmResetPassword from "./pages/authentication/confirmPasswordReset";
import Login from "./pages/authentication/login";
import ReactivationPage from "./pages/authentication/reactivation";
import ResetPasswordPage from "./pages/authentication/reset-password";
import Signup from "./pages/authentication/signup";
import VerifyAccount from "./pages/authentication/verify-account";
import ScrollTop from "./utils/ScrollTop";

// SSO callback components
const LinkedInCallback = lazy(() => import("./components/sso/LinkedInLoginButton").then(m => ({ default: m.LinkedInCallback })));
const EnterpriseSSOCallback = lazy(() => import("./components/sso/EnterpriseSSOButton").then(m => ({ default: m.EnterpriseSSOCallback })));

// Lightweight loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-400">Loading...</span>
    </div>
  </div>
);

// Lazy-loaded page components
const NotificationItem = lazy(() => import("./components/notifications").then(m => ({ default: m.NotificationItem })));
const Address = lazy(() => import("./components/profile/address"));
const Bio = lazy(() => import("./components/profile/bio"));
const Contact = lazy(() => import("./components/profile/contact"));
const Home = lazy(() => import("./components/profile/home"));
const ProfileLayout = lazy(() => import("./components/profile/layout"));
const Overview = lazy(() => import("./components/profile/overview"));
const Profile = lazy(() => import("./components/profile/profile"));
const CreatePostPage = lazy(() => import("./pages/posts/CreatePostPage"));
const SuccessPage = lazy(() => import("./pages/authentication/successpage"));
const BookMark = lazy(() => import("./pages/bookmark"));
const BlockedUsersPage = lazy(() => import("./pages/blocked-users/index"));
const BlockedCompaniesPage = lazy(() => import("./pages/blocked-companies/index"));
const CompaniesPage = lazy(() => import("./pages/companies"));
const CreateCompany = lazy(() => import("./pages/company"));
const CompanyDocuments = lazy(() => import("./pages/company/CompanyDocuments"));
const CompanyInformation = lazy(() => import("./pages/company/CompanyInformation"));
const EditCompanyPage = lazy(() => import("./pages/company/edit"));
const CompanyLayout = lazy(() => import("./pages/company/layout"));
const CompanyProfile = lazy(() => import("./pages/feed/companyProfile"));
const NewsFeed = lazy(() => import("./pages/feed/newsFeed"));
const UserProfile = lazy(() => import("./pages/feed/userProfile"));
const Analysis = lazy(() => import("./pages/market/analysis"));
const Listing = lazy(() => import("./pages/market/listing"));
const Market = lazy(() => import("./pages/market/market"));
const Product = lazy(() => import("./pages/market/product"));
const MessagesLayout = lazy(() => import("./pages/messages/layout"));
const NotFound = lazy(() => import("./pages/not-found"));
const PostInsightsPage = lazy(() => import("./pages/posts/postInsightsPage"));
const SinglePostPage = lazy(() => import("./pages/posts/singlePostPage"));
const RepresentativesPage = lazy(() => import("./pages/representatives"));
const AcceptRepresentation = lazy(() => import("./pages/representatives/AcceptRepresentation"));
const AssignRepresentative = lazy(() => import("./pages/representatives/AssignRepresentative"));
const Search = lazy(() => import("./pages/search"));
const Services = lazy(() => import("./pages/service/service"));
const ServiceAdmin = lazy(() => import("./pages/service/serviceAdmin"));
const ServiceOverView = lazy(() => import("./pages/service/serviceOverview"));
const SettingsPage = lazy(() => import("./pages/settings"));
const EnterpriseSSOSetupPage = lazy(() => import("./pages/settings/EnterpriseSSOSetup"));
const PrivacyPolicy = lazy(() => import("./pages/terms&policies/policy"));
const TermsAndConditions = lazy(() => import("./pages/terms&policies/terms"));

// Admin
const ComprehensiveAdmin = lazy(() => import("./pages/admin/ComprehensiveAdmin"));

// Platform
const PlatformLayout = lazy(() => import("./pages/platform/PlatformLayout"));
const PlatformDashboard = lazy(() => import("./pages/businesshub/BusinessHub"));
const DealRooms = lazy(() => import("./components/dealRoom/DealRooms"));
const DealRoomCreate = lazy(() => import("./components/dealRoom/DealRoomCreate"));
const DealRoomEdit = lazy(() => import("./components/dealRoom/DealRoomEdit"));
const DealRoomDetail = lazy(() => import("./components/dealRoom/DealRoomDetail"));
const EnterpriseApp = lazy(() => import("./components/enterprise/EnterpriseApp"));

// Workforce
const WorkforceJobs = lazy(() => import("./pages/platform/WorkforceJobs"));
const WorkforceJobCreate = lazy(() => import("./pages/platform/WorkforceJobCreate"));
const WorkforceMyPostedJobs = lazy(() => import("./pages/platform/WorkforceMyPostedJobs"));
const WorkforceSavedJobs = lazy(() => import("./pages/platform/WorkforceSavedJobs"));
const WorkforceJobDetail = lazy(() => import("./pages/platform/WorkforceJobDetail"));
const WorkforceProfessionals = lazy(() => import("./pages/platform/WorkforceProfessionals"));
const WorkforceProfileCreate = lazy(() => import("./pages/platform/WorkforceProfileCreate"));
const WorkforceProfileDetail = lazy(() => import("./pages/platform/WorkforceProfileDetail"));
const WorkforceProfileEdit = lazy(() => import("./pages/platform/WorkforceProfileEdit"));
const WorkforceApplications = lazy(() => import("./pages/platform/WorkforceApplications"));
const WorkforceJobApplications = lazy(() => import("./pages/platform/WorkforceJobApplications"));
const WorkforceEvents = lazy(() => import("./pages/platform/WorkforceEvents"));
const WorkforceEventDetail = lazy(() => import("./pages/platform/WorkforceEventDetail"));
const WorkforceEventCreate = lazy(() => import("./pages/platform/WorkforceEventCreate"));
const WorkforceMyEvents = lazy(() => import("./pages/platform/WorkforceMyEvents"));
const WorkforceMyRegistrations = lazy(() => import("./pages/platform/WorkforceMyRegistrations"));
const WorkforceMyBookmarks = lazy(() => import("./pages/platform/WorkforceMyBookmarks"));
const CompanyEarnings = lazy(() => import("./pages/platform/CompanyEarnings"));
const AIDashboard = lazy(() => import("./pages/platform/AIDashboard"));
const MyParticipations = lazy(() => import("./pages/platform/MyParticipations"));
const AISubpage = lazy(() => import("./pages/platform/AISubpage"));

// Logistics
const LogisticsDashboard = lazy(() => import("./pages/platform/LogisticsDashboard"));
const LogisticsInventory = lazy(() => import("./pages/platform/LogisticsInventory"));
const LogisticsInventoryForm = lazy(() => import("./pages/platform/LogisticsInventoryForm"));
const LogisticsInventoryEdit = lazy(() => import("./pages/platform/LogisticsInventoryEdit"));
const LogisticsInventoryDetailView = lazy(() => import("./pages/platform/LogisticsInventoryDetailView"));
const LogisticsRequests = lazy(() => import("./pages/platform/LogisticsRequests"));
const LogisticsRequestList = lazy(() => import("./pages/platform/LogisticsRequestList"));
const LogisticsRequestDetail = lazy(() => import("./pages/platform/LogisticsRequestDetail"));
const LogisticsRequestCreate = lazy(() => import("./pages/platform/LogisticsRequestCreate"));
const LogisticsRequestEdit = lazy(() => import("./pages/platform/LogisticsRequestEdit"));
const LogisticsShipments = lazy(() => import("./pages/platform/LogisticsShipments"));
const LogisticsShipmentCreate = lazy(() => import("./pages/platform/LogisticsShipmentCreate"));
const LogisticsShipmentDetail = lazy(() => import("./pages/platform/LogisticsShipmentDetail"));
const LogisticsTracking = lazy(() => import("./pages/platform/LogisticsTracking"));
const BecomeProvider = lazy(() => import("./pages/logistics/BecomeProvider"));
const ProviderDashboard = lazy(() => import("./pages/logistics/ProviderDashboard"));
const ProviderSettings = lazy(() => import("./pages/logistics/ProviderSettings"));
const LogisticsTest = lazy(() => import("./pages/test/LogisticsTest"));
const LogisticsInventoryCreate = lazy(() => import("./pages/platform/LogisticsInventoryCreate"));

// Subscriptions & Ads
const FeaturedAdsPage = lazy(() => import("./pages/platform/FeaturedAds"));
const SubscriptionsPage = lazy(() => import("./pages/platform/Subscriptions"));
const SubscriptionPlanDetail = lazy(() => import("./pages/subscription/SubscriptionPlanDetail"));
const SubscriptionRoutes = lazy(() => import("./routes/SubscriptionRoutes"));
const SubscriptionDebug = lazy(() => import("./debug/SubscriptionDebug"));

// Inventory
const InventoryDashboard = lazy(() => import("./pages/inventory/InventoryDashboard"));
const InventoryItems = lazy(() => import("./pages/inventory/InventoryItems"));
const InventoryWarehouses = lazy(() => import("./pages/inventory/InventoryWarehouses"));
const CreateWarehouse = lazy(() => import("./pages/inventory/CreateWarehouse"));
const WarehouseDetail = lazy(() => import("./pages/inventory/WarehouseDetail"));
const InventoryTransactions = lazy(() => import("./pages/inventory/InventoryTransactions"));
const InventoryAlerts = lazy(() => import("./pages/inventory/InventoryAlerts"));
const InventoryReports = lazy(() => import("./pages/inventory/InventoryReports"));

// Knowledge Hub
const KnowledgeHubDashboard = lazy(() => import("./pages/knowledge/KnowledgeHubDashboard"));
const KnowledgeArticles = lazy(() => import("./pages/knowledge/KnowledgeArticles"));
const KnowledgeArticleDetail = lazy(() => import("./pages/knowledge/KnowledgeArticleDetail"));
const KnowledgeForums = lazy(() => import("./pages/knowledge/KnowledgeForums"));
const KnowledgeTopics = lazy(() => import("./pages/knowledge/KnowledgeTopics"));
const KnowledgeCategories = lazy(() => import("./pages/knowledge/KnowledgeCategories"));
const KnowledgeCategoryDetail = lazy(() => import("./pages/knowledge/KnowledgeCategoryDetail"));
const KnowledgeTagDetail = lazy(() => import("./pages/knowledge/KnowledgeTagDetail"));
const KnowledgeSearch = lazy(() => import("./pages/knowledge/KnowledgeSearch"));
const KnowledgeArticleCreate = lazy(() => import("./pages/knowledge/KnowledgeArticleCreate"));
const KnowledgeArticleEdit = lazy(() => import("./pages/knowledge/KnowledgeArticleEdit"));
const KnowledgeForumCreate = lazy(() => import("./pages/knowledge/KnowledgeForumCreate"));
const KnowledgeForumDetail = lazy(() => import("./pages/knowledge/KnowledgeForumDetail"));
const KnowledgeForumMembers = lazy(() => import("./pages/knowledge/KnowledgeForumMembers"));
const KnowledgeTopicCreate = lazy(() => import("./pages/knowledge/KnowledgeTopicCreate"));
const KnowledgeTopicDetail = lazy(() => import("./pages/knowledge/KnowledgeTopicDetail"));
const KnowledgeForumInvite = lazy(() => import("./pages/knowledge/KnowledgeForumInvite"));

// Bidding
const BiddingProjects = lazy(() => import("./pages/bidding/BiddingProjects"));
const CreateBiddingProject = lazy(() => import("./pages/bidding/CreateBiddingProject"));
const SubmitBid = lazy(() => import("./pages/bidding/SubmitBid"));
const BidSubmissionDetail = lazy(() => import("./pages/bidding/BidSubmissionDetail"));
const EvaluationPanel = lazy(() => import("./pages/bidding/EvaluationPanel"));
const BiddingTemplates = lazy(() => import("./pages/bidding/BiddingTemplates"));
const ComplianceVault = lazy(() => import("./pages/bidding/ComplianceVault"));
const PrequalificationSchemes = lazy(() => import("./pages/bidding/PrequalificationSchemes"));
const PrequalificationReview = lazy(() => import("./pages/bidding/PrequalificationReview"));
const SupplierScorecard = lazy(() => import("./pages/bidding/SupplierScorecard"));

// Marketplace
const Marketplace = lazy(() => import("./pages/marketplace/Marketplace"));
const MarketplaceCart = lazy(() => import("./pages/marketplace/Cart"));
const MarketplaceCheckout = lazy(() => import("./pages/marketplace/Checkout"));
const MyListings = lazy(() => import("./pages/marketplace/MyListings"));
const CreateListing = lazy(() => import("./pages/marketplace/CreateListing"));
const MarketplaceListingDetail = lazy(() => import("./pages/marketplace/ListingDetail"));
const EditListing = lazy(() => import("./pages/marketplace/EditListing"));
const MarketplaceOrders = lazy(() => import("./pages/marketplace/Orders"));
const OrderConfirmation = lazy(() => import("./pages/marketplace/OrderConfirmation"));
const SellerOrders = lazy(() => import("./pages/marketplace/SellerOrders"));
const SellerPayments = lazy(() => import("./pages/marketplace/SellerPayments"));

function App() {
  // Helper function to convert absolute paths to relative paths for nested routes
  // Adds a safety guard so undefined values don't crash the app.
  const toRelativePath = (path) => {
    if (typeof path !== 'string') {
      return undefined; // React Router will ignore undefined paths; ensures no runtime error
    }
    return path.startsWith('/') ? path.slice(1) : path;
  };
  
const removeLeadingSlash = (path) => {
  if (!path) return path;
  return path.startsWith("/") ? path.slice(1) : path.includes("/co/") ? path.replace("/co/", "")  :path;
};
  
  // Redirect legacy /platform/* URLs to new root-based routes
  const LegacyPlatformRedirect = () => {
    const location = useLocation();
    const target = location.pathname.replace(/^\/platform/, '') || '/';
    return <Navigate to={target} replace />;
  };

  return (
    <div>
      <SEO />
      {/* Prefetch key data in background after user logs in */}
      <GlobalPrefetch />
      <ScrollTop/>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Comprehensive Admin CMS System */}
        <Route path="/admin/*" element={<ComprehensiveAdmin />} />
        
  {/* Main App Routes - Feed as Home Page */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to={webRoutes.feedLayout} replace />} />
          
          <Route path={removeLeadingSlash(webRoutes.feedLayout)} element={<FeedLayout />}>
            <Route index element={<NewsFeed />} />
          </Route>
          <Route path="" element={<FeedLayout />}>
            <Route path="posts/:id/insights" element={<PostInsightsPage />} />
          </Route>
          {/* Public, crawlable post detail — no auth wall so it can be indexed */}
          <Route path="posts/:id" element={<SinglePostPage />} />
          <Route path={removeLeadingSlash(webRoutes.createPost)} element={<CreatePostPage />} />
          <Route path={removeLeadingSlash(webRoutes.profile)} element={<Profile />} />

          {/* Profile Update Routes */}
          <Route path={removeLeadingSlash(webRoutes.home)} element={<Home />}/>
          <Route path={removeLeadingSlash(webRoutes.profileUpdate)} element={<ProfileLayout />}>
            <Route path={removeLeadingSlash(webRoutes.address)} element={<Address />} />
            <Route path={removeLeadingSlash(webRoutes.bio)} element={<Bio />} />
            <Route path={removeLeadingSlash(webRoutes.contact)} element={<Contact />} />
            <Route path="home" element={<Home />} />
            <Route path={removeLeadingSlash(webRoutes.overview)} element={<Overview />} />
          </Route>

          {/* Company Routes */}
          <Route path="company" element={<CompanyLayout />}>
            <Route path="create" element={<CreateCompany />} />
            <Route path="documents" element={<CompanyDocuments />} />
            <Route path="information" element={<CompanyInformation />} />
          </Route>

          {/* Company creation routes matching webRoutes paths */}
          <Route element={<CompanyLayout />}>
            <Route path={removeLeadingSlash(webRoutes.createCompany)} element={<CreateCompany />} />
            <Route path={removeLeadingSlash(webRoutes.companyDocuments)} element={<CompanyDocuments />} />
            <Route path={removeLeadingSlash(webRoutes.companyInformation)} element={<CompanyInformation />} />
          </Route>

          <Route path={removeLeadingSlash(webRoutes.analysis)} element={<Analysis />} />
          <Route path={removeLeadingSlash(webRoutes.bookmark)} element={<BookMark />} />
          <Route path={removeLeadingSlash(webRoutes.companies)} element={<CompaniesPage />} />
          <Route path={removeLeadingSlash(webRoutes.notifications)} element={<NotificationItem />} />
          <Route path="company/:company" element={<CompanyProfile />} />
          <Route path="company/:company/edit" element={<EditCompanyPage />} />
          <Route path={removeLeadingSlash(webRoutes.market)} element={<Market />} />
          
          {/* Marketplace Routes */}
          <Route path={removeLeadingSlash(webRoutes.marketplace)} element={<Marketplace />} />
          <Route path={removeLeadingSlash(webRoutes.marketplaceCart)} element={<MarketplaceCart />} />
          <Route path={removeLeadingSlash(webRoutes.marketplaceCheckout)} element={<MarketplaceCheckout />} />
          <Route path={removeLeadingSlash(webRoutes.marketplaceListing)} element={<MarketplaceListingDetail />} />
          <Route path={removeLeadingSlash(webRoutes.marketplaceMyListings)} element={<MyListings />} />
          <Route path={removeLeadingSlash(webRoutes.marketplaceCreateListing)} element={<CreateListing />} />
          <Route path={removeLeadingSlash(webRoutes.marketplaceEditListing)} element={<EditListing />} />
          <Route path={removeLeadingSlash(webRoutes.marketplaceOrders)} element={<MarketplaceOrders />} />
          <Route path={removeLeadingSlash(webRoutes.marketplaceOrderConfirmation)} element={<OrderConfirmation />} />
          <Route path={removeLeadingSlash(webRoutes.marketplaceSellerOrders)} element={<SellerOrders />} />
          <Route path="marketplace/seller-payments" element={<SellerPayments />} />
          
          <Route path={removeLeadingSlash(webRoutes.messages)} element={<MessagesLayout />} />
          <Route path={removeLeadingSlash(webRoutes.productDetails)} element={<Product />} />
          <Route path={removeLeadingSlash(webRoutes.productListing)} element={<Listing />} />
          <Route path={removeLeadingSlash(webRoutes.representative)} element={<RepresentativesPage />} />
          <Route path="representatives/assign" element={<AssignRepresentative />} />
          <Route path={removeLeadingSlash(webRoutes.acceptRepresentation)} element={<AcceptRepresentation />} />
          <Route path={removeLeadingSlash(webRoutes.search)} element={<Search />} />
          <Route path={removeLeadingSlash(webRoutes.services)} element={<Services />} />
          <Route path={removeLeadingSlash(webRoutes.servicesAdd)} element={<ServiceAdmin />} />
          <Route path={removeLeadingSlash(webRoutes.servicesDetail)} element={<ServiceOverView />} />
          <Route path={removeLeadingSlash(webRoutes.settings)} element={<SettingsPage />} />
          <Route path={removeLeadingSlash(webRoutes.enterpriseSSOSetup)} element={<EnterpriseSSOSetupPage />} />
          <Route path={removeLeadingSlash(webRoutes.userProfile)} element={<UserProfile />} />
          
          {/* Company-specific routes with "co" prefix */}
          <Route path={removeLeadingSlash(webRoutes.bookmarks)} element={<BookMark />} />
          <Route path={removeLeadingSlash(webRoutes.representatives)} element={<RepresentativesPage />} />
          <Route path={removeLeadingSlash(webRoutes.assignRepresentative)} element={<AssignRepresentative />} />
          <Route path={removeLeadingSlash(webRoutes.blockedUsers)} element={<BlockedUsersPage />} />
          <Route path={removeLeadingSlash(webRoutes.blockedCompanies)} element={<BlockedCompaniesPage />} />
          <Route path="co/:userId" element={<UserProfile />} />
          <Route path="co/:company" element={<CompanyProfile />} />
          <Route path="co/company/:company/edit" element={<EditCompanyPage />} />
          <Route path={removeLeadingSlash(webRoutes.coNotifications)} element={<NotificationItem />} />
          
          {/* Knowledge Hub Routes */}
          <Route path={removeLeadingSlash(webRoutes.knowledgeHub)} element={<KnowledgeHubDashboard />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeArticles)} element={<KnowledgeArticles />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeArticleDetail)} element={<KnowledgeArticleDetail />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeArticleCreate)} element={<KnowledgeArticleCreate />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeArticleEdit)} element={<KnowledgeArticleEdit />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeForums)} element={<KnowledgeForums />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeForumCreate)} element={<KnowledgeForumCreate />} />
          <Route path="knowledge/forums/invite" element={<KnowledgeForumInvite />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeForumMembers)} element={<KnowledgeForumMembers />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeForumDetail)} element={<KnowledgeForumDetail />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeForumMembers)} element={<KnowledgeForumMembers />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeForumTopicCreate)} element={<KnowledgeTopicCreate />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeTopics)} element={<KnowledgeTopics />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeForumTopicDetail)} element={<KnowledgeTopicDetail />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeCategories)} element={<KnowledgeCategories />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeCategoryDetail)} element={<KnowledgeCategoryDetail />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeTagDetail)} element={<KnowledgeTagDetail />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeSearch)} element={<KnowledgeSearch />} />
          
          {/* Hub Platform Routes - Using main app layout */}
          <Route path={removeLeadingSlash(webRoutes.dashboard)} element={<PlatformDashboard />} />
          
          {/* Deal Rooms */}
          <Route path={removeLeadingSlash(webRoutes.dealRooms)} element={<DealRooms />} />
          <Route path={removeLeadingSlash(webRoutes.dealRoomCreate)} element={<DealRoomCreate />} />
          <Route path={removeLeadingSlash(webRoutes.dealRoomDetail)} element={<DealRoomDetail />} />
          <Route path={removeLeadingSlash(webRoutes.dealRoomEdit)} element={<DealRoomEdit />} />
          {/* Deal Room Detail Tab Routes (previously only available under /platform) */}
          <Route path={removeLeadingSlash(webRoutes.dealRoomDocuments)} element={<DealRoomDetail />} />
          <Route path={removeLeadingSlash(webRoutes.dealRoomParticipants)} element={<DealRoomDetail />} />
          <Route path={removeLeadingSlash(webRoutes.dealRoomMilestones)} element={<DealRoomDetail />} />
          <Route path={removeLeadingSlash(webRoutes.dealRoomActivities)} element={<DealRoomDetail />} />
          <Route path={removeLeadingSlash(webRoutes.dealRoomValuations)} element={<DealRoomDetail />} />
          <Route path={removeLeadingSlash(webRoutes.dealRoomReports)} element={<DealRoomDetail />} />
          <Route path={removeLeadingSlash(webRoutes.myParticipations)} element={<MyParticipations />} />
          
          {/* Bidding */}
          <Route path={removeLeadingSlash(webRoutes.bidding)} element={<BiddingProjects />} />
          <Route path={removeLeadingSlash(webRoutes.biddingCreate)} element={<CreateBiddingProject />} />
          <Route path={removeLeadingSlash(webRoutes.biddingEdit)} element={<CreateBiddingProject />} />
          <Route path={removeLeadingSlash(webRoutes.biddingDetail)} element={<BiddingProjectDetail />} />
          <Route path={removeLeadingSlash(webRoutes.biddingBidDetail)} element={<BidSubmissionDetail />} />
          <Route path={removeLeadingSlash(webRoutes.biddingSubmit)} element={<SubmitBid />} />
          <Route path={removeLeadingSlash(webRoutes.biddingEvaluate)} element={<EvaluationPanel />} />
          <Route path={removeLeadingSlash(webRoutes.biddingTemplates)} element={<BiddingTemplates />} />
          <Route path={removeLeadingSlash(webRoutes.biddingCompliance)} element={<ComplianceVault />} />
          <Route path={removeLeadingSlash(webRoutes.biddingPrequalification)} element={<PrequalificationSchemes />} />
          <Route path={removeLeadingSlash(webRoutes.biddingPrequalificationReview)} element={<PrequalificationReview />} />
          <Route path={removeLeadingSlash(webRoutes.supplierScorecard)} element={<SupplierScorecard />} />
          
          {/* Workforce */}
          <Route path={removeLeadingSlash(webRoutes.workforceJobs)} element={<WorkforceJobs />} />
          <Route path={removeLeadingSlash(webRoutes.workforceJobCreate)} element={<WorkforceJobCreate />} />
          <Route path={removeLeadingSlash(webRoutes.workforceJobUpdate)} element={<WorkforceJobCreate />} />
          <Route path={removeLeadingSlash(webRoutes.workforceSavedJobs)} element={<WorkforceSavedJobs />} />
          <Route path={removeLeadingSlash(webRoutes.workforceJobDetail)} element={<WorkforceJobDetail />} />
          <Route path={removeLeadingSlash(webRoutes.workforceJobApply)} element={<WorkforceJobDetail />} />
          <Route path={removeLeadingSlash(webRoutes.workforceMyPostedJobs)} element={<WorkforceMyPostedJobs />} />
          <Route path={removeLeadingSlash(webRoutes.workforceApplicationsManage)} element={<WorkforceJobApplications />} />
          <Route path="workforce/jobs/:id/applications" element={<WorkforceJobApplications />} />
          <Route path={removeLeadingSlash(webRoutes.workforceProfiles)} element={<WorkforceProfessionals />} />
          <Route path={removeLeadingSlash(webRoutes.workforceProfileCreate)} element={<WorkforceProfileCreate />} />
          <Route path={removeLeadingSlash(webRoutes.workforceProfileDetail)} element={<WorkforceProfileDetail />} />
          <Route path={removeLeadingSlash(webRoutes.workforceProfileEdit)} element={<WorkforceProfileEdit />} />
          <Route path={removeLeadingSlash(webRoutes.workforceEvents)} element={<WorkforceEvents />} />
          <Route path="workforce/events" element={<WorkforceEvents />} />
          <Route path={removeLeadingSlash(webRoutes.workforceEventCreate)} element={<WorkforceEventCreate />} />
          <Route path={removeLeadingSlash(webRoutes.workforceCompanyEarnings)} element={<CompanyEarnings />} />
          <Route path={removeLeadingSlash(webRoutes.workforceMyEvents)} element={<WorkforceMyEvents />} />
          <Route path={removeLeadingSlash(webRoutes.workforceMyRegistrations)} element={<WorkforceMyRegistrations />} />
          <Route path={removeLeadingSlash(webRoutes.workforceMyBookmarks)} element={<WorkforceMyBookmarks />} />
          <Route path={removeLeadingSlash(webRoutes.workforceEventEdit)} element={<WorkforceEventCreate />} />
          <Route path={removeLeadingSlash(webRoutes.workforceEventDetail)} element={<WorkforceEventDetail />} />
          <Route path="workforce/events/:id" element={<WorkforceEventDetail />} />
          <Route path={removeLeadingSlash(webRoutes.workforceApplications)} element={<WorkforceApplications />} />
          
          {/* AI Services */}
          <Route path={removeLeadingSlash(webRoutes.aiDashboard)} element={<AIDashboard />} />
          <Route path="ai/matching" element={<AISubpage />} />
          <Route path="ai/opportunities" element={<AISubpage />} />
          <Route path="ai/compliance" element={<AISubpage />} />
          <Route path="ai/analytics" element={<AISubpage />} />
          <Route path="ai/insights" element={<AISubpage />} />
          
          {/* Logistics Hub */}
          <Route path={removeLeadingSlash(webRoutes.logisticsDashboard)} element={<LogisticsDashboard />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsInventory)} element={<LogisticsInventory />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsInventoryCreate)} element={<LogisticsInventoryCreate />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsInventoryEdit)} element={<LogisticsInventoryEdit />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsInventoryDetail)} element={<LogisticsInventoryDetailView />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsRequests)} element={<LogisticsRequestList />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsRequestCreate)} element={<LogisticsRequestCreate />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsRequestDetail)} element={<LogisticsRequestDetail />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsRequestEdit)} element={<LogisticsRequestEdit />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsShipments)} element={<LogisticsShipments />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsShipmentCreate)} element={<LogisticsShipmentCreate />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsShipmentDetail)} element={<LogisticsShipmentDetail />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsTracking)} element={<LogisticsTracking />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsBecomeProvider)} element={<BecomeProvider />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsProviderDashboard)} element={<ProviderDashboard />} />
          <Route path={removeLeadingSlash(webRoutes.logisticsProviderSettings)} element={<ProviderSettings />} />
          
          {/* Inventory Management */}
          <Route path={removeLeadingSlash(webRoutes.inventoryDashboard)} element={<InventoryDashboard />} />
          <Route path={removeLeadingSlash(webRoutes.inventoryItems)} element={<InventoryItems />} />
          <Route path={removeLeadingSlash(webRoutes.inventoryWarehouses)} element={<InventoryWarehouses />} />
          <Route path={removeLeadingSlash(webRoutes.inventoryWarehouseCreate)} element={<CreateWarehouse />} />
          <Route path={removeLeadingSlash(webRoutes.inventoryWarehouseDetail)} element={<WarehouseDetail />} />
          <Route path={removeLeadingSlash(webRoutes.inventoryWarehouseEdit)} element={<CreateWarehouse />} />
          <Route path={removeLeadingSlash(webRoutes.inventoryTransactions)} element={<InventoryTransactions />} />
          <Route path={removeLeadingSlash(webRoutes.inventoryAlerts)} element={<InventoryAlerts />} />
          <Route path={removeLeadingSlash(webRoutes.inventoryReports)} element={<InventoryReports />} />
          
          {/* Subscriptions */}
          <Route path={removeLeadingSlash(webRoutes.subscriptions)} element={<SubscriptionsPage />} />
          <Route path={removeLeadingSlash(webRoutes.subscriptions) + "/*"} element={<SubscriptionRoutes />} />
          {/* Direct plan detail (plural form) route to match webRoutes.subscriptionPlanDetail */}
          <Route path={removeLeadingSlash(webRoutes.subscriptionPlanDetail)} element={<SubscriptionPlanDetail />} />
          
          <Route path="ads" element={<FeaturedAdsPage />} />
          {/* Direct company routes (for URLs like /Connectize) - Must be last to avoid conflicts */}
          <Route path=":company" element={<CompanyProfile />} />
          <Route path=":company/edit" element={<CompanyProfile />} />
        </Route>

  {/* Oil & Gas Platform Routes */}
        <Route path="/platform" element={<PlatformLayout />}>
          <Route index element={<PlatformDashboard />} />
          <Route path="dashboard" element={<PlatformDashboard />} />
          <Route path={toRelativePath(webRoutes.dealRooms)} element={<DealRooms />} />
          <Route path={toRelativePath(webRoutes.myParticipations)} element={<MyParticipations />} />
          <Route path={toRelativePath(webRoutes.dealRoomCreate)} element={<DealRoomCreate />} />
          <Route path={toRelativePath(webRoutes.dealRoomDetail)} element={<DealRoomDetail />} />
          <Route path={toRelativePath(webRoutes.dealRoomEdit)} element={<DealRoomEdit />} />
          <Route path={toRelativePath(webRoutes.dealRoomDocuments)} element={<DealRoomDetail />} />
          <Route path={toRelativePath(webRoutes.dealRoomParticipants)} element={<DealRoomDetail />} />
          <Route path={toRelativePath(webRoutes.dealRoomMilestones)} element={<DealRoomDetail />} />
          <Route path={toRelativePath(webRoutes.dealRoomActivities)} element={<DealRoomDetail />} />
          <Route path={toRelativePath(webRoutes.dealRoomValuations)} element={<DealRoomDetail />} />
          <Route path={toRelativePath(webRoutes.dealRoomReports)} element={<DealRoomDetail />} />
          <Route path={toRelativePath(webRoutes.workforceJobs)} element={<WorkforceJobs />} />
          <Route path={toRelativePath(webRoutes.workforceJobCreate)} element={<WorkforceJobCreate />} />
          <Route path={toRelativePath(webRoutes.workforceMyPostedJobs)} element={<WorkforceMyPostedJobs />} />
          <Route path={toRelativePath(webRoutes.workforceApplicationsManage)} element={<WorkforceJobApplications />} />
          <Route path={toRelativePath(webRoutes.workforceSavedJobs)} element={<WorkforceSavedJobs />} />
          <Route path={toRelativePath(webRoutes.workforceJobDetail)} element={<WorkforceJobDetail />} />
          <Route path={toRelativePath(webRoutes.workforceJobApply)} element={<WorkforceJobDetail />} />
          <Route path={toRelativePath(webRoutes.workforceProfiles)} element={<WorkforceProfessionals />} />
          <Route path={toRelativePath(webRoutes.workforceProfileCreate)} element={<WorkforceProfileCreate />} />
          <Route path={toRelativePath(webRoutes.workforceProfileDetail)} element={<WorkforceProfileDetail />} />
          <Route path={toRelativePath(webRoutes.workforceProfileEdit)} element={<WorkforceProfileEdit />} />
          <Route path={toRelativePath(webRoutes.workforceApplications)} element={<WorkforceApplications />} />
          <Route path={toRelativePath(webRoutes.workforceEvents)} element={<WorkforceEvents />} />
          <Route path={toRelativePath(webRoutes.workforceEventCreate)} element={<WorkforceEventCreate />} />
          <Route path={toRelativePath(webRoutes.workforceEventDetail)} element={<WorkforceEventDetail />} />
          <Route path={toRelativePath(webRoutes.workforceMyEvents)} element={<WorkforceMyEvents />} />
          <Route path={toRelativePath(webRoutes.workforceMyRegistrations)} element={<WorkforceMyRegistrations />} />
          <Route path={toRelativePath(webRoutes.workforceMyBookmarks)} element={<WorkforceMyBookmarks />} />
          <Route path={toRelativePath(webRoutes.workforceCompanyEarnings)} element={<CompanyEarnings />} />
          <Route path={toRelativePath(webRoutes.aiDashboard)} element={<AIDashboard />} />
          <Route path={toRelativePath(webRoutes.aiMatching)} element={<AISubpage />} />
          <Route path={toRelativePath(webRoutes.aiOpportunities)} element={<AISubpage />} />
          <Route path={toRelativePath(webRoutes.aiCompliance)} element={<AISubpage />} />
          <Route path={toRelativePath(webRoutes.aiAnalytics)} element={<AISubpage />} />
          <Route path={toRelativePath(webRoutes.aiInsights)} element={<AISubpage />} />
          <Route path={toRelativePath(webRoutes.featuredAds)} element={<FeaturedAdsPage />} />
          
          {/* Enhanced Subscription System Routes */}
          <Route path="subscriptions/*" element={<SubscriptionRoutes />} />
          
          {/* Debug Routes */}
          <Route path="debug/subscription" element={<SubscriptionDebug />} />
          
          {/* Legacy subscription routes for backward compatibility */}
          <Route path={toRelativePath(webRoutes.subscriptions)} element={<SubscriptionsPage />} />
          <Route path={toRelativePath(webRoutes.subscriptionPlanDetail)} element={<SubscriptionPlanDetail />} />
          {/* Legacy alias for user subscription path */}
          <Route path={toRelativePath(webRoutes.userSubscription)} element={<SubscriptionsPage />} />
          
          {/* Enterprise Suite Routes */}
          <Route path={toRelativePath(webRoutes.enterprise)} element={<EnterpriseApp />} />
          <Route path="enterprise/*" element={<EnterpriseApp />} />
          
          <Route path={toRelativePath(webRoutes.logisticsDashboard)} element={<LogisticsDashboard />} />
          <Route path={toRelativePath(webRoutes.logisticsInventory)} element={<LogisticsInventory />} />
          <Route path={toRelativePath(webRoutes.logisticsInventoryCreate)} element={<LogisticsInventoryForm />} />
          <Route path={toRelativePath(webRoutes.logisticsInventoryEdit)} element={<LogisticsInventoryEdit />} />
          <Route path={toRelativePath(webRoutes.logisticsInventoryDetail)} element={<LogisticsInventoryDetailView />} />
          <Route path={toRelativePath(webRoutes.logisticsRequests)} element={<LogisticsRequestList />} />
          <Route path={toRelativePath(webRoutes.logisticsRequestDetail)} element={<LogisticsRequestDetail />} />
          <Route path={toRelativePath(webRoutes.logisticsRequestCreate)} element={<LogisticsRequestCreate />} />
          <Route path={toRelativePath(webRoutes.logisticsRequestEdit)} element={<LogisticsRequestEdit />} />
          <Route path={toRelativePath(webRoutes.logisticsShipments)} element={<LogisticsShipments />} />
          <Route path={toRelativePath(webRoutes.logisticsShipmentCreate)} element={<LogisticsShipmentCreate />} />
          <Route path={toRelativePath(webRoutes.logisticsShipmentEdit)} element={<LogisticsShipmentCreate />} />
          <Route path={toRelativePath(webRoutes.logisticsShipmentDetail)} element={<LogisticsShipmentDetail />} />
          <Route path={toRelativePath(webRoutes.logisticsTracking)} element={<LogisticsTracking />} />
          <Route path={toRelativePath(webRoutes.logisticsBecomeProvider)} element={<BecomeProvider />} />
          <Route path={toRelativePath(webRoutes.logisticsProviderDashboard)} element={<ProviderDashboard />} />
          
          {/* Inventory Routes */}
          <Route path={toRelativePath(webRoutes.inventoryDashboard)} element={<InventoryDashboard />} />
          <Route path={toRelativePath(webRoutes.inventoryWarehouses)} element={<InventoryWarehouses />} />
          <Route path={toRelativePath(webRoutes.inventoryWarehouseCreate)} element={<CreateWarehouse />} />
          <Route path={toRelativePath(webRoutes.inventoryWarehouseDetail)} element={<WarehouseDetail />} />
          <Route path={toRelativePath(webRoutes.inventoryWarehouseEdit)} element={<CreateWarehouse />} />
          <Route path={toRelativePath(webRoutes.inventoryItems)} element={<InventoryItems />} />
          <Route path={toRelativePath(webRoutes.inventoryTransactions)} element={<InventoryTransactions />} />
          <Route path={toRelativePath(webRoutes.inventoryReports)} element={<InventoryReports />} />
          <Route path={toRelativePath(webRoutes.inventoryAlerts)} element={<InventoryAlerts />} />
          
          {/* Knowledge Hub Routes */}
          <Route path={toRelativePath(webRoutes.knowledgeHub)} element={<KnowledgeHubDashboard />} />
          <Route path={toRelativePath(webRoutes.knowledgeArticles)} element={<KnowledgeArticles />} />
          <Route path={toRelativePath(webRoutes.knowledgeArticleDetail)} element={<KnowledgeArticleDetail />} />
          <Route path={toRelativePath(webRoutes.knowledgeArticleCreate)} element={<KnowledgeArticleCreate />} />
          <Route path={toRelativePath(webRoutes.knowledgeForums)} element={<KnowledgeForums />} />
          <Route path={toRelativePath(webRoutes.knowledgeForumCreate)} element={<KnowledgeForumCreate />} />
          <Route path="knowledge/forums/invite" element={<KnowledgeForumInvite />} />
          <Route path={toRelativePath(webRoutes.knowledgeForumMembers)} element={<KnowledgeForumMembers />} />
          <Route path={toRelativePath(webRoutes.knowledgeForumDetail)} element={<KnowledgeForumDetail />} />
          <Route path={toRelativePath(webRoutes.knowledgeForumMembers)} element={<KnowledgeForumMembers />} />
          <Route path={toRelativePath(webRoutes.knowledgeForumTopicCreate)} element={<KnowledgeTopicCreate />} />
          <Route path={toRelativePath(webRoutes.knowledgeForumTopicDetail)} element={<KnowledgeTopicDetail />} />
          <Route path={toRelativePath(webRoutes.knowledgeTopics)} element={<KnowledgeTopics />} />
          <Route path={toRelativePath(webRoutes.knowledgeCategories)} element={<KnowledgeCategories />} />
          <Route path={toRelativePath(webRoutes.knowledgeCategoryDetail)} element={<KnowledgeCategoryDetail />} />
          <Route path={toRelativePath(webRoutes.knowledgeTagDetail)} element={<KnowledgeTagDetail />} />
          <Route path={toRelativePath(webRoutes.knowledgeSearch)} element={<KnowledgeSearch />} />
          
          {/* Test Routes */}
          <Route path="test/logistics" element={<LogisticsTest />} />
        </Route>
        
  {/* Legacy App Routes (for backward compatibility) */}
        <Route path="/app" element={<AppLayout />}>
          <Route path="feed" element={<FeedLayout />}>
            <Route index element={<NewsFeed />} />
            <Route path="posts/:id/insights" element={<PostInsightsPage />} />
            <Route path="posts/:id" element={<SinglePostPage />} />
          </Route>

          <Route path="profile" element={<Profile />} />

          {/* Profile Update Routes */}
          <Route path={removeLeadingSlash(webRoutes.profileUpdate)} element={<Home />}/>
          <Route path="profile-update" element={<ProfileLayout />}>
            <Route path="address" element={<Address />} />
            <Route path="bio" element={<Bio />} />
            <Route path="contact" element={<Contact />} />
            <Route path="home" element={<Home />} />
            <Route path="overview" element={<Overview />} />
          </Route>

          {/* Company Routes */}
          <Route path="company" element={<CompanyLayout />}>
            <Route path="create" element={<CreateCompany />} />
            <Route path="documents" element={<CompanyDocuments />} />
            <Route path="information" element={<CompanyInformation />} />
          </Route>

          {/* Company creation routes matching webRoutes paths */}
          <Route element={<CompanyLayout />}>
            <Route path="create-company" element={<CreateCompany />} />
            <Route path="company-documents" element={<CompanyDocuments />} />
            <Route path="company-information" element={<CompanyInformation />} />
          </Route>

          <Route path="analysis" element={<Analysis />} />
          <Route path="bookmarks" element={<BookMark />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="notifications" element={<NotificationItem />} />
          <Route path="company/:company" element={<CompanyProfile />} />
          <Route path="company/:company/edit" element={<EditCompanyPage />} />
          <Route path="market" element={<Market />} />
          <Route path="messages" element={<MessagesLayout />} />
          <Route path="products/:id" element={<Product />} />
          <Route path="products/listing" element={<Listing />} />
          <Route path="representatives" element={<RepresentativesPage />} />
          <Route path="representatives/assign" element={<AssignRepresentative />} />
          <Route path="representatives/accept" element={<AcceptRepresentation />} />
          <Route path="search" element={<Search />} />
          <Route path="services" element={<Services />} />
          <Route path="services/add" element={<ServiceAdmin />} />
          <Route path="services/:id" element={<ServiceOverView />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/enterprise-sso" element={<EnterpriseSSOSetupPage />} />
          <Route path="user/:userId" element={<UserProfile />} />
        </Route>

  {/* Authentication Routes (with AuthLayout) */}
  <Route path="/" element={<AuthLayout />}>
    <Route path="login" element={<Login />} />
    <Route path="signup" element={<Signup />} />
    <Route path="verify-account" element={<VerifyAccount />} />
    <Route path="reset-password" element={<ResetPasswordPage />} />
    <Route path="confirm-reset-password" element={<ConfirmResetPassword />} />
    <Route path="reactivate-account" element={<ReactivationPage />} />
  </Route>

        {/* Misc Pages */}
  <Route path="/success" element={<SuccessPage />} />

  {/* SSO Callback Routes */}
  <Route path={webRoutes.ssoLinkedInCallback} element={<LinkedInCallback />} />
  <Route path={webRoutes.ssoEnterpriseCallback} element={<EnterpriseSSOCallback />} />
  {/* Keep original terms routes for compatibility */}
  <Route path={webRoutes.termsAndConditions} element={<TermsAndConditions />} />
  <Route path={webRoutes.privacyPolicy} element={<PrivacyPolicy />} />
        
  {/* Legacy alias for old /platform/* paths */}
  <Route path="/platform/*" element={<LegacyPlatformRedirect />} />

  {/* Catch all for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </div>
  );
}

export default App;
