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
      <Routes>
        {/* Comprehensive Admin CMS System */}
        <Route path="/admin/*" element={<ComprehensiveAdmin />} />
        
  {/* Main App Routes - Feed as Home Page */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/feed" replace />} />
          
          <Route path="feed" element={<FeedLayout />}>
            <Route index element={<NewsFeed />} />
            <Route path="posts/:id" element={<SinglePostPage />} />
          </Route>

          <Route path="profile" element={<Profile />} />

          {/* Profile Update Routes */}
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
          
          {/* Marketplace Routes */}
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="marketplace/cart" element={<MarketplaceCart />} />
          <Route path="marketplace/checkout" element={<MarketplaceCheckout />} />
          <Route path="marketplace/listing/:id" element={<MarketplaceListingDetail />} />
          <Route path="marketplace/my-listings" element={<MyListings />} />
          <Route path="marketplace/create-listing" element={<CreateListing />} />
          <Route path="marketplace/edit-listing/:id" element={<EditListing />} />
          <Route path="marketplace/orders" element={<MarketplaceOrders />} />
          <Route path="marketplace/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="marketplace/seller-orders" element={<SellerOrders />} />
          <Route path="marketplace/seller-payments" element={<SellerPayments />} />
          
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
          <Route path="co/settings" element={<SettingsPage />} />
          <Route path="user/:userId" element={<UserProfile />} />
          
          {/* Company-specific routes with "co" prefix */}
          <Route path="co/bookmarks" element={<BookMark />} />
          <Route path="co/representatives" element={<RepresentativesPage />} />
          <Route path="co/:userId" element={<UserProfile />} />
          <Route path="co/:company" element={<CompanyProfile />} />
          <Route path="co/notifications" element={<NotificationItem />} />
          
          {/* Knowledge Hub Routes */}
          <Route path="knowledge" element={<KnowledgeHubDashboard />} />
          <Route path="knowledge/articles" element={<KnowledgeArticles />} />
          <Route path="knowledge/articles/:slug" element={<KnowledgeArticleDetail />} />
          <Route path="knowledge/articles/create" element={<KnowledgeArticleCreate />} />
          <Route path="knowledge/forums" element={<KnowledgeForums />} />
          <Route path="knowledge/forums/create" element={<KnowledgeForumCreate />} />
          <Route path="knowledge/forums/:slug" element={<KnowledgeForumDetail />} />
          <Route path="knowledge/topics" element={<KnowledgeTopics />} />
          <Route path="knowledge/topics/:slug" element={<KnowledgeTopicDetail />} />
          <Route path="knowledge/forums/:forumSlug/topics/create" element={<KnowledgeTopicCreate />} />
          <Route path="knowledge/categories" element={<KnowledgeCategories />} />
          <Route path="knowledge/categories/:slug" element={<KnowledgeCategoryDetail />} />
          <Route path="knowledge/tags/:slug" element={<KnowledgeTagDetail />} />
          <Route path="knowledge/search" element={<KnowledgeSearch />} />
          <Route path="knowledge/forums/invite" element={<KnowledgeForumInvite />} />
          
          {/* Hub Platform Routes - Using main app layout */}
          <Route path="dashboard" element={<PlatformDashboard />} />
          
          {/* Deal Rooms */}
          <Route path="deals" element={<DealRooms />} />
          <Route path="deals/create" element={<DealRoomCreate />} />
          <Route path="deals/:id" element={<DealRoomDetail />} />
          <Route path="deals/:id/edit" element={<DealRoomEdit />} />
          {/* Deal Room Detail Tab Routes (previously only available under /platform) */}
          <Route path="deals/:id/documents" element={<DealRoomDetail />} />
          <Route path="deals/:id/participants" element={<DealRoomDetail />} />
          <Route path="deals/:id/milestones" element={<DealRoomDetail />} />
          <Route path="deals/:id/activities" element={<DealRoomDetail />} />
          <Route path="deals/:id/valuations" element={<DealRoomDetail />} />
          <Route path="deals/:id/reports" element={<DealRoomDetail />} />
          <Route path="deals/my-participations" element={<MyParticipations />} />
          
          {/* Workforce */}
          <Route path="jobs" element={<WorkforceJobs />} />
          <Route path="jobs/create" element={<WorkforceJobCreate />} />
          <Route path="jobs/update/:id" element={<WorkforceJobCreate />} />
          <Route path="jobs/saved" element={<WorkforceSavedJobs />} />
          <Route path="jobs/:id" element={<WorkforceJobDetail />} />
          <Route path="jobs/:id/apply" element={<WorkforceJobDetail />} />
          <Route path="jobs/my-posted" element={<WorkforceMyPostedJobs />} />
          <Route path="professionals" element={<WorkforceProfessionals />} />
          <Route path="professionals/create" element={<WorkforceProfileCreate />} />
          <Route path="professionals/:id" element={<WorkforceProfileDetail />} />
          <Route path="professionals/:id/edit" element={<WorkforceProfileEdit />} />
          <Route path="events" element={<WorkforceEvents />} />
          <Route path="events/create" element={<WorkforceEventCreate />} />
          <Route path="events/earnings" element={<CompanyEarnings />} />
          <Route path="events/my-events" element={<WorkforceMyEvents />} />
          <Route path="events/my-registrations" element={<WorkforceMyRegistrations />} />
          <Route path="events/my-bookmarks" element={<WorkforceMyBookmarks />} />
          <Route path="events/:id/edit" element={<WorkforceEventCreate />} />
          <Route path="events/:id" element={<WorkforceEventDetail />} />
          <Route path="applications" element={<WorkforceApplications />} />
          
          {/* AI Services */}
          <Route path="ai" element={<AIDashboard />} />
          <Route path="ai/matching" element={<AISubpage />} />
          <Route path="ai/opportunities" element={<AISubpage />} />
          <Route path="ai/compliance" element={<AISubpage />} />
          <Route path="ai/analytics" element={<AISubpage />} />
          <Route path="ai/insights" element={<AISubpage />} />
          
          {/* Logistics Hub */}
          <Route path="logistics" element={<LogisticsDashboard />} />
          <Route path="logistics/inventory" element={<LogisticsInventory />} />
          <Route path="logistics/inventory/create" element={<LogisticsInventoryForm />} />
          <Route path="logistics/inventory/:id/edit" element={<LogisticsInventoryEdit />} />
          <Route path="logistics/inventory/:id" element={<LogisticsInventoryDetailView />} />
          <Route path="logistics/requests" element={<LogisticsRequestList />} />
          <Route path="logistics/requests/create" element={<LogisticsRequestCreate />} />
          <Route path="logistics/requests/:id" element={<LogisticsRequestDetail />} />
          <Route path="logistics/requests/:id/edit" element={<LogisticsRequestEdit />} />
          <Route path="logistics/shipments" element={<LogisticsShipments />} />
          <Route path="logistics/shipments/create" element={<LogisticsShipmentCreate />} />
          <Route path="logistics/shipments/:id" element={<LogisticsShipmentDetail />} />
          <Route path="logistics/tracking" element={<LogisticsTracking />} />
          <Route path="logistics/become-provider" element={<BecomeProvider />} />
          <Route path="logistics/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="logistics/provider-settings" element={<ProviderSettings />} />
          
          {/* Inventory Management */}
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="inventory/items" element={<InventoryItems />} />
          <Route path="inventory/warehouses" element={<InventoryWarehouses />} />
          <Route path="inventory/transactions" element={<InventoryTransactions />} />
          <Route path="inventory/alerts" element={<InventoryAlerts />} />
          <Route path="inventory/reports" element={<InventoryReports />} />
          
          {/* Subscriptions */}
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="subscriptions/*" element={<SubscriptionRoutes />} />
          {/* Direct plan detail (plural form) route to match webRoutes.subscriptionPlanDetail */}
          <Route path="subscriptions/plans/:planId" element={<SubscriptionPlanDetail />} />
          
          <Route path='ads' element={<FeaturedAdsPage />} />
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
          <Route path={toRelativePath(webRoutes.knowledgeForumDetail)} element={<KnowledgeForumDetail />} />
          <Route path={toRelativePath(webRoutes.knowledgeForumTopicCreate)} element={<KnowledgeTopicCreate />} />
          <Route path={toRelativePath(webRoutes.knowledgeForumTopicDetail)} element={<KnowledgeTopicDetail />} />
          <Route path={toRelativePath(webRoutes.knowledgeTopics)} element={<KnowledgeTopics />} />
          <Route path={toRelativePath(webRoutes.knowledgeCategories)} element={<KnowledgeCategories />} />
          <Route path={toRelativePath(webRoutes.knowledgeCategoryDetail)} element={<KnowledgeCategoryDetail />} />
          <Route path={toRelativePath(webRoutes.knowledgeTagDetail)} element={<KnowledgeTagDetail />} />
          <Route path={toRelativePath(webRoutes.knowledgeSearch)} element={<KnowledgeSearch />} />
          <Route path="knowledge/forums/invite" element={<KnowledgeForumInvite />} />
          
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
