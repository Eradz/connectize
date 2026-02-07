import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import SEO from "./components/SEO";
import { NotificationItem } from "./components/notifications";
import Address from "./components/profile/address";
import Bio from "./components/profile/bio";
import Contact from "./components/profile/contact";
import Home from "./components/profile/home";
import ProfileLayout from "./components/profile/layout";
import Overview from "./components/profile/overview";
import Profile from "./components/profile/profile";
import { webRoutes } from "./lib/webRoutes";
import AppLayout from "./pages/AppLayout";

// Helper function to remove leading slash from route paths
const removeLeadingSlash = (path) => {
  if (!path) return path;
  return path.startsWith("/") ? path.slice(1) : path.includes("/co/") ? path.replace("/co/", "")  :path;
};
import FeedLayout from "./pages/FeedLayout";
import AuthLayout from "./pages/authentication/AuthLayout";
import ConfirmResetPassword from "./pages/authentication/confirmPasswordReset";
import Login from "./pages/authentication/login";
import ReactivationPage from "./pages/authentication/reactivation";
import ResetPasswordPage from "./pages/authentication/reset-password";
import Signup from "./pages/authentication/signup";
import SuccessPage from "./pages/authentication/successpage";
import VerifyAccount from "./pages/authentication/verify-account";
import BookMark from "./pages/bookmark";
import CompaniesPage from "./pages/companies";
import CreateCompany from "./pages/company";
import CompanyDocuments from "./pages/company/CompanyDocuments";
import CompanyInformation from "./pages/company/CompanyInformation";
import EditCompanyPage from "./pages/company/edit";
import CompanyLayout from "./pages/company/layout";
import CompanyProfile from "./pages/feed/companyProfile";
import NewsFeed from "./pages/feed/newsFeed";
import UserProfile from "./pages/feed/userProfile";
import Analysis from "./pages/market/analysis";
import Listing from "./pages/market/listing";
import Market from "./pages/market/market";
import Product from "./pages/market/product";
import MessagesLayout from "./pages/messages/layout";
import NotFound from "./pages/not-found";
import SinglePostPage from "./pages/posts/singlePostPage";
import RepresentativesPage from "./pages/representatives";
import AcceptRepresentation from "./pages/representatives/AcceptRepresentation";
import AssignRepresentative from "./pages/representatives/AssignRepresentative";
import Search from "./pages/search";
import Services from "./pages/service/service";
import ServiceAdmin from "./pages/service/serviceAdmin";
import ServiceOverView from "./pages/service/serviceOverview";
import SettingsPage from "./pages/settings";
import PrivacyPolicy from "./pages/terms&policies/policy";
import TermsAndConditions from "./pages/terms&policies/terms";
import TermsLayout from "./pages/terms&policies/termsLayout";

// Comprehensive Admin CMS Implementation
import ComprehensiveAdmin from "./pages/admin/ComprehensiveAdmin";

// Oil & Gas Platform Components
import PlatformLayout from "./pages/platform/PlatformLayout";
import PlatformDashboard from "./pages/businesshub/BusinessHub";
import DealRooms from "./components/dealRoom/DealRooms";
import DealRoomCreate from "./components/dealRoom/DealRoomCreate";
import DealRoomEdit from "./components/dealRoom/DealRoomEdit";

// Enterprise Dashboard Components
import EnterpriseApp from "./components/enterprise/EnterpriseApp";
import WorkforceJobs from "./pages/platform/WorkforceJobs";
import WorkforceJobCreate from "./pages/platform/WorkforceJobCreate";
import WorkforceMyPostedJobs from "./pages/platform/WorkforceMyPostedJobs";
import WorkforceSavedJobs from "./pages/platform/WorkforceSavedJobs";
import WorkforceJobDetail from "./pages/platform/WorkforceJobDetail";
import WorkforceProfessionals from "./pages/platform/WorkforceProfessionals";
import WorkforceProfileCreate from "./pages/platform/WorkforceProfileCreate";
import WorkforceProfileDetail from "./pages/platform/WorkforceProfileDetail";
import WorkforceProfileEdit from "./pages/platform/WorkforceProfileEdit";
import WorkforceApplications from "./pages/platform/WorkforceApplications";
import WorkforceEvents from "./pages/platform/WorkforceEvents";
import WorkforceEventDetail from "./pages/platform/WorkforceEventDetail";
import WorkforceEventCreate from "./pages/platform/WorkforceEventCreate";
import WorkforceMyEvents from "./pages/platform/WorkforceMyEvents";
import WorkforceMyRegistrations from "./pages/platform/WorkforceMyRegistrations";
import WorkforceMyBookmarks from "./pages/platform/WorkforceMyBookmarks";
import CompanyEarnings from "./pages/platform/CompanyEarnings";
import AIDashboard from "./pages/platform/AIDashboard";
import DealRoomDetail from "./components/dealRoom/DealRoomDetail";
import MyParticipations from "./pages/platform/MyParticipations";
import AISubpage from "./pages/platform/AISubpage";
import LogisticsDashboard from "./pages/platform/LogisticsDashboard";
import LogisticsInventory from "./pages/platform/LogisticsInventory";
import LogisticsInventoryForm from "./pages/platform/LogisticsInventoryForm";
import LogisticsInventoryEdit from "./pages/platform/LogisticsInventoryEdit";
import LogisticsInventoryDetailView from "./pages/platform/LogisticsInventoryDetailView";
import LogisticsRequests from "./pages/platform/LogisticsRequests";
import LogisticsRequestList from "./pages/platform/LogisticsRequestList";
import LogisticsRequestDetail from "./pages/platform/LogisticsRequestDetail";
import LogisticsRequestCreate from "./pages/platform/LogisticsRequestCreate";
import LogisticsRequestEdit from "./pages/platform/LogisticsRequestEdit";
import LogisticsShipments from "./pages/platform/LogisticsShipments";
import LogisticsShipmentCreate from "./pages/platform/LogisticsShipmentCreate";
import LogisticsShipmentDetail from "./pages/platform/LogisticsShipmentDetail";
import LogisticsTracking from "./pages/platform/LogisticsTracking";
import BecomeProvider from "./pages/logistics/BecomeProvider";
import ProviderDashboard from "./pages/logistics/ProviderDashboard";
import ProviderSettings from "./pages/logistics/ProviderSettings";
import LogisticsTest from "./pages/test/LogisticsTest";
import FeaturedAdsPage from "./pages/platform/FeaturedAds";
import SubscriptionsPage from "./pages/platform/Subscriptions";
import SubscriptionPlanDetail from "./pages/subscription/SubscriptionPlanDetail";

// Enhanced Subscription System
import SubscriptionRoutes from "./routes/SubscriptionRoutes";

// Debug Components
import SubscriptionDebug from "./debug/SubscriptionDebug";

// Inventory Management Components
import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import InventoryItems from "./pages/inventory/InventoryItems";
import InventoryWarehouses from "./pages/inventory/InventoryWarehouses";
import InventoryTransactions from "./pages/inventory/InventoryTransactions";
import InventoryAlerts from "./pages/inventory/InventoryAlerts";
import InventoryReports from "./pages/inventory/InventoryReports";

// Knowledge Hub Components  
import KnowledgeHubDashboard from "./pages/knowledge/KnowledgeHubDashboard";
import KnowledgeArticles from "./pages/knowledge/KnowledgeArticles";
import KnowledgeArticleDetail from "./pages/knowledge/KnowledgeArticleDetail";
import KnowledgeForums from "./pages/knowledge/KnowledgeForums";
import KnowledgeTopics from "./pages/knowledge/KnowledgeTopics";
import KnowledgeCategories from "./pages/knowledge/KnowledgeCategories";
import KnowledgeCategoryDetail from "./pages/knowledge/KnowledgeCategoryDetail";
import KnowledgeTagDetail from "./pages/knowledge/KnowledgeTagDetail";
import KnowledgeSearch from "./pages/knowledge/KnowledgeSearch";
import KnowledgeArticleCreate from "./pages/knowledge/KnowledgeArticleCreate";
import KnowledgeForumCreate from "./pages/knowledge/KnowledgeForumCreate";
import KnowledgeForumDetail from "./pages/knowledge/KnowledgeForumDetail";
import KnowledgeTopicCreate from "./pages/knowledge/KnowledgeTopicCreate";
import KnowledgeTopicDetail from "./pages/knowledge/KnowledgeTopicDetail";
import KnowledgeForumInvite from "./pages/knowledge/KnowledgeForumInvite";

// Marketplace Components
import Marketplace from "./pages/marketplace/Marketplace";
import MarketplaceCart from "./pages/marketplace/Cart";
import MarketplaceCheckout from "./pages/marketplace/Checkout";
import MyListings from "./pages/marketplace/MyListings";
import CreateListing from "./pages/marketplace/CreateListing";
import MarketplaceListingDetail from "./pages/marketplace/ListingDetail";
import EditListing from "./pages/marketplace/EditListing";
import MarketplaceOrders from "./pages/marketplace/Orders";
import OrderConfirmation from "./pages/marketplace/OrderConfirmation";
import SellerOrders from "./pages/marketplace/SellerOrders";
import SellerPayments from "./pages/marketplace/SellerPayments";

// Global prefetch for instant loading
import GlobalPrefetch from "./components/GlobalPrefetch";
import LogisticsInventoryCreate from "./pages/platform/LogisticsInventoryCreate";

function App() {
  // Helper function to convert absolute paths to relative paths for nested routes
  // Adds a safety guard so undefined values don't crash the app.
  const toRelativePath = (path) => {
    if (typeof path !== 'string') {
      return undefined; // React Router will ignore undefined paths; ensures no runtime error
    }
    return path.startsWith('/') ? path.slice(1) : path;
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
            <Route path="posts/:id" element={<SinglePostPage />} />
          </Route>
          <Route path={removeLeadingSlash(webRoutes.profile)} element={<Profile />} />

          {/* Profile Update Routes */}
          <Route path={removeLeadingSlash(webRoutes.home)} element={<Home />}/>
          <Route path="profile-update" element={<ProfileLayout />}>
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
          <Route path={removeLeadingSlash(webRoutes.userProfile)} element={<UserProfile />} />
          
          {/* Company-specific routes with "co" prefix */}
          <Route path={removeLeadingSlash(webRoutes.bookmarks)} element={<BookMark />} />
          <Route path={removeLeadingSlash(webRoutes.representatives)} element={<RepresentativesPage />} />
          <Route path="co/:userId" element={<UserProfile />} />
          <Route path="co/:company" element={<CompanyProfile />} />
          <Route path={removeLeadingSlash(webRoutes.coNotifications)} element={<NotificationItem />} />
          
          {/* Knowledge Hub Routes */}
          <Route path={removeLeadingSlash(webRoutes.knowledgeHub)} element={<KnowledgeHubDashboard />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeArticles)} element={<KnowledgeArticles />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeArticleDetail)} element={<KnowledgeArticleDetail />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeArticleCreate)} element={<KnowledgeArticleCreate />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeForums)} element={<KnowledgeForums />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeForumCreate)} element={<KnowledgeForumCreate />} />
          <Route path="knowledge/forums/invite" element={<KnowledgeForumInvite />} />
          <Route path={removeLeadingSlash(webRoutes.knowledgeForumDetail)} element={<KnowledgeForumDetail />} />
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
          
          {/* Workforce */}
          <Route path={removeLeadingSlash(webRoutes.workforceJobs)} element={<WorkforceJobs />} />
          <Route path={removeLeadingSlash(webRoutes.workforceJobCreate)} element={<WorkforceJobCreate />} />
          <Route path={removeLeadingSlash(webRoutes.workforceJobUpdate)} element={<WorkforceJobCreate />} />
          <Route path={removeLeadingSlash(webRoutes.workforceSavedJobs)} element={<WorkforceSavedJobs />} />
          <Route path={removeLeadingSlash(webRoutes.workforceJobDetail)} element={<WorkforceJobDetail />} />
          <Route path={removeLeadingSlash(webRoutes.workforceJobApply)} element={<WorkforceJobDetail />} />
          <Route path={removeLeadingSlash(webRoutes.workforceMyPostedJobs)} element={<WorkforceMyPostedJobs />} />
          <Route path={removeLeadingSlash(webRoutes.workforceProfiles)} element={<WorkforceProfessionals />} />
          <Route path={removeLeadingSlash(webRoutes.workforceProfileCreate)} element={<WorkforceProfileCreate />} />
          <Route path={removeLeadingSlash(webRoutes.workforceProfileDetail)} element={<WorkforceProfileDetail />} />
          <Route path={removeLeadingSlash(webRoutes.workforceProfileEdit)} element={<WorkforceProfileEdit />} />
          <Route path={removeLeadingSlash(webRoutes.workforceEvents)} element={<WorkforceEvents />} />
          <Route path={removeLeadingSlash(webRoutes.workforceEventCreate)} element={<WorkforceEventCreate />} />
          <Route path={removeLeadingSlash(webRoutes.workforceCompanyEarnings)} element={<CompanyEarnings />} />
          <Route path={removeLeadingSlash(webRoutes.workforceMyEvents)} element={<WorkforceMyEvents />} />
          <Route path={removeLeadingSlash(webRoutes.workforceMyRegistrations)} element={<WorkforceMyRegistrations />} />
          <Route path={removeLeadingSlash(webRoutes.workforceMyBookmarks)} element={<WorkforceMyBookmarks />} />
          <Route path={removeLeadingSlash(webRoutes.workforceEventEdit)} element={<WorkforceEventCreate />} />
          <Route path={removeLeadingSlash(webRoutes.workforceEventDetail)} element={<WorkforceEventDetail />} />
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
          <Route path={toRelativePath(webRoutes.knowledgeForumDetail)} element={<KnowledgeForumDetail />} />
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
            <Route path="posts/:id" element={<SinglePostPage />} />
          </Route>

          <Route path="profile" element={<Profile />} />

          {/* Profile Update Routes */}
          <Route path="update-profile" element={<Home />}/>
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
  {/* Keep original terms routes for compatibility */}
  <Route path={webRoutes.termsAndConditions} element={<TermsAndConditions />} />
  <Route path={webRoutes.privacyPolicy} element={<PrivacyPolicy />} />
        
  {/* Legacy alias for old /platform/* paths */}
  <Route path="/platform/*" element={<LegacyPlatformRedirect />} />

  {/* Catch all for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
