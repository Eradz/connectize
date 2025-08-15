import { Route, Routes } from "react-router-dom";
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
import PlatformDashboard from "./pages/platform/PlatformDashboard";
import DealRooms from "./pages/platform/DealRooms";
import DealRoomCreate from "./pages/platform/DealRoomCreate";
import DealRoomEdit from "./pages/platform/DealRoomEdit";
import WorkforceJobs from "./pages/platform/WorkforceJobs";
import WorkforceJobCreate from "./pages/platform/WorkforceJobCreate";
import WorkforceJobDetail from "./pages/platform/WorkforceJobDetail";
import WorkforceProfessionals from "./pages/platform/WorkforceProfessionals";
import WorkforceProfileDetail from "./pages/platform/WorkforceProfileDetail";
import WorkforceApplications from "./pages/platform/WorkforceApplications";
import WorkforceEvents from "./pages/platform/WorkforceEvents";
import AIDashboard from "./pages/platform/AIDashboard";
import DealRoomDetail from "./pages/platform/DealRoomDetail";
import AISubpage from "./pages/platform/AISubpage";
import LogisticsDashboard from "./pages/platform/LogisticsDashboard";
import LogisticsInventory from "./pages/platform/LogisticsInventory";
import LogisticsInventoryForm from "./pages/platform/LogisticsInventoryForm";
import LogisticsInventoryDetailView from "./pages/platform/LogisticsInventoryDetailView";
import LogisticsShipments from "./pages/platform/LogisticsShipments";
import LogisticsShipmentCreate from "./pages/platform/LogisticsShipmentCreate";
import LogisticsShipmentDetail from "./pages/platform/LogisticsShipmentDetail";
import LogisticsSuppliers from "./pages/platform/LogisticsSuppliers";
import LogisticsSupplierDetail from "./pages/platform/LogisticsSupplierDetail";
import LogisticsTracking from "./pages/platform/LogisticsTracking";
import TrustDashboard from "./pages/platform/TrustDashboard";
import SpecializedToolsDashboard from "./pages/platform/SpecializedToolsDashboard";

function App() {
  return (
    <>
      <SEO />
      <Routes>
        {/* Comprehensive Admin CMS System */}
        <Route path="/admin/*" element={<ComprehensiveAdmin />} />
        
  {/* Oil & Gas Platform Routes - Set as Default */}
        <Route path="/" element={<PlatformLayout />}>
          <Route index element={<PlatformDashboard />} />
          <Route path={webRoutes.platformDashboard} element={<PlatformDashboard />} />
          <Route path={webRoutes.dealRooms} element={<DealRooms />} />
          <Route path={webRoutes.dealRoomCreate} element={<DealRoomCreate />} />
          <Route path={webRoutes.dealRoomDetail} element={<DealRoomDetail />} />
          <Route path={webRoutes.dealRoomEdit} element={<DealRoomEdit />} />
          <Route path={webRoutes.dealRoomDocuments} element={<DealRoomDetail />} />
          <Route path={webRoutes.dealRoomParticipants} element={<DealRoomDetail />} />
          <Route path={webRoutes.dealRoomMilestones} element={<DealRoomDetail />} />
          <Route path={webRoutes.dealRoomActivities} element={<DealRoomDetail />} />
          <Route path={webRoutes.dealRoomValuations} element={<DealRoomDetail />} />
          <Route path={webRoutes.dealRoomReports} element={<DealRoomDetail />} />
          <Route path={webRoutes.workforceJobs} element={<WorkforceJobs />} />
          <Route path={webRoutes.workforceJobCreate} element={<WorkforceJobCreate />} />
          <Route path={webRoutes.workforceJobDetail} element={<WorkforceJobDetail />} />
          <Route path={webRoutes.workforceJobApply} element={<WorkforceJobDetail />} />
          <Route path={webRoutes.workforceProfiles} element={<WorkforceProfessionals />} />
          <Route path={webRoutes.workforceProfileDetail} element={<WorkforceProfileDetail />} />
          <Route path={webRoutes.workforceApplications} element={<WorkforceApplications />} />
          <Route path={webRoutes.workforceEvents} element={<WorkforceEvents />} />
          <Route path={webRoutes.aiDashboard} element={<AIDashboard />} />
          <Route path={webRoutes.aiMatching} element={<AISubpage />} />
          <Route path={webRoutes.aiOpportunities} element={<AISubpage />} />
          <Route path={webRoutes.aiCompliance} element={<AISubpage />} />
          <Route path={webRoutes.aiAnalytics} element={<AISubpage />} />
          <Route path={webRoutes.aiInsights} element={<AISubpage />} />
          <Route path={webRoutes.logisticsDashboard} element={<LogisticsDashboard />} />
          <Route path={webRoutes.logisticsInventory} element={<LogisticsInventory />} />
          <Route path={webRoutes.logisticsInventoryForm} element={<LogisticsInventoryForm />} />
          <Route path={webRoutes.logisticsInventoryDetail} element={<LogisticsInventoryDetailView />} />
          <Route path={webRoutes.logisticsShipments} element={<LogisticsShipments />} />
          <Route path={webRoutes.logisticsShipmentCreate} element={<LogisticsShipmentCreate />} />
          <Route path={webRoutes.logisticsShipmentDetail} element={<LogisticsShipmentDetail />} />
          <Route path={webRoutes.logisticsSuppliers} element={<LogisticsSuppliers />} />
          <Route path={webRoutes.logisticsSupplierDetail} element={<LogisticsSupplierDetail />} />
          <Route path={webRoutes.logisticsTracking} element={<LogisticsTracking />} />
          <Route path={webRoutes.trustDashboard} element={<TrustDashboard />} />
          <Route path={webRoutes.toolsDashboard} element={<SpecializedToolsDashboard />} />
        </Route>
        
  {/* Main App Routes under /app prefix */}
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

  {/* Authentication Routes (top-level to preserve existing links) */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/verify-account" element={<VerifyAccount />} />
  <Route path="/reset-password" element={<ResetPasswordPage />} />
  <Route path="/confirm-reset-password" element={<ConfirmResetPassword />} />
  <Route path="/reactivate-account" element={<ReactivationPage />} />

        {/* Misc Pages */}
  <Route path="/success" element={<SuccessPage />} />
  {/* Keep original terms routes for compatibility */}
  <Route path={webRoutes.termsAndConditions} element={<TermsAndConditions />} />
  <Route path={webRoutes.privacyPolicy} element={<PrivacyPolicy />} />
        
        {/* Catch all for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
