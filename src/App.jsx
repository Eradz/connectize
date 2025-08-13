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

function App() {
  return (
    <>
      <SEO />
      <Routes>
        {/* Comprehensive Admin CMS System */}
        <Route path="/admin/*" element={<ComprehensiveAdmin />} />
        
        <Route path={webRoutes.notFound} element={<NotFound />} />

        {/* Main App */}
        <Route path="/" element={<AppLayout />}>
          <Route path={webRoutes.feed} element={<FeedLayout />}>
            <Route path={webRoutes.newsFeed} element={<NewsFeed />} />
            <Route path={webRoutes.singlePost} element={<SinglePostPage />} />
          </Route>

          <Route path={webRoutes.profile} element={<Profile />} />

          {/* Profile Update Routes */}
          <Route path="/" element={<ProfileLayout />}>
            <Route path={webRoutes.address} element={<Address />} />
            <Route path={webRoutes.bio} element={<Bio />} />
            <Route path={webRoutes.contact} element={<Contact />} />
            <Route path={webRoutes.home} element={<Home />} />
            <Route path={webRoutes.overview} element={<Overview />} />
          </Route>

          {/* Company Routes */}
          <Route element={<CompanyLayout />}>
            <Route path={webRoutes.createCompany} element={<CreateCompany />} />
            <Route
              path={webRoutes.companyDocuments}
              element={<CompanyDocuments />}
            />
            <Route
              path={webRoutes.companyInformation}
              element={<CompanyInformation />}
            />
          </Route>

          <Route path={webRoutes.analysis} element={<Analysis />} />
          <Route path={webRoutes.bookmarks} element={<BookMark />} />
          <Route path={webRoutes.companies} element={<CompaniesPage />} />
          <Route
            path={webRoutes.coNotifications}
            element={<NotificationItem />}
          />
          <Route path={webRoutes.company} element={<CompanyProfile />} />
          <Route
            path={webRoutes.companyEditProfile}
            element={<EditCompanyPage />}
          />
          <Route path={webRoutes.market} element={<Market />} />

          <Route path={webRoutes.messages} element={<MessagesLayout />} />

          <Route path={webRoutes.productDetails} element={<Product />} />
          <Route path={webRoutes.productListing} element={<Listing />} />
          <Route
            path={webRoutes.representatives}
            element={<RepresentativesPage />}
          />
          <Route
            path={webRoutes.assignRepresentative}
            element={<AssignRepresentative />}
          />
          <Route
            path={webRoutes.acceptRepresentation}
            element={<AcceptRepresentation />}
          />
          <Route path={webRoutes.search} element={<Search />} />
          <Route path={webRoutes.services} element={<Services />} />
          <Route path={webRoutes.servicesAdd} element={<ServiceAdmin />} />
          <Route
            path={webRoutes.servicesDetail}
            element={<ServiceOverView />}
          />
          <Route path={webRoutes.settings} element={<SettingsPage />} />
          <Route path={webRoutes.userProfile} element={<UserProfile />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route path={webRoutes.signup} element={<Signup />} />
          <Route path={webRoutes.login} element={<Login />} />
          <Route
            path={webRoutes.reactivateAccount}
            element={<ReactivationPage />}
          />
          <Route path={webRoutes.verifyAccount} element={<VerifyAccount />} />
          <Route
            path={webRoutes.resetPassword}
            element={<ResetPasswordPage />}
          />
          <Route
            path={webRoutes.confirmResetPassword}
            element={<ConfirmResetPassword />}
          />
        </Route>

        {/* Misc Pages */}
        <Route path={webRoutes.success} element={<SuccessPage />} />
        <Route path="/" element={<TermsLayout />}>
          <Route
            path={webRoutes.termsAndConditions}
            element={<TermsAndConditions />}
          />
          <Route path={webRoutes.privacyPolicy} element={<PrivacyPolicy />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
