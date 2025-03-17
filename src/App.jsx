import { Routes, Route } from "react-router-dom";
import Signup from "./pages/authentication/signup";
import Login from "./pages/authentication/login";
import Profile from "./components/profile/profile";
import Home from "./components/profile/home";
import Contact from "./components/profile/contact";
import Address from "./components/profile/address";
import Bio from "./components/profile/bio";
import SuccessPage from "./pages/authentication/successpage";
import Overview from "./components/profile/overview";
import Services from "./pages/service/service";
import ServiceOverView from "./pages/service/serviceOverview";
import ServiceAdmin from "./pages/service/serviceAdmin";
import Market from "./pages/market/market";
import Product from "./pages/market/product";
import Analysis from "./pages/market/analysis";
import Listing from "./pages/market/listing";
import UserProfile from "./pages/feed/userProfile";
import NewsFeed from "./pages/feed/newsFeed";
import AuthLayout from "./pages/authentication/AuthLayout";
import ResetPasswordPage from "./pages/authentication/reset-password";
import ProfileLayout from "./components/profile/layout";
import ConfirmResetPassword from "./pages/authentication/confirmPasswordReset";
import MarketPlaceLayout from "./pages/MarketPlaceLayout";
import CompanyLayout from "./pages/company/layout";
import CreateCompany from "./pages/company";
import CompanyDocuments from "./pages/company/CompanyDocuments";
import CompanyInformation from "./pages/company/CompanyInformation";
import SinglePostPage from "./pages/posts/singlePostPage";
import FeedLayout from "./pages/FeedLayout";
import VerifyAccount from "./pages/authentication/verify-account";
import CompanyProfile from "./pages/feed/companyProfile";
import NotFound from "./pages/not-found";
import MessagesPage from "./pages/messages";
import RepresentativesPage from "./pages/representatives";
import CompaniesPage from "./pages/companies";
import Search from "./pages/search";
import AssignRepresentative from "./pages/representatives/AssignRepresentative";
import BookMark from "./pages/bookmark";
import AcceptRepresentation from "./pages/representatives/AcceptRepresentation";
import MessagesLayout from "./pages/messages/layout";
import MessagingPage from "./pages/messages/messaging";
import { NotificationItem } from "./components/notifications";
import TermsAndConditions from "./pages/terms&policies/terms";
import PrivacyPolicy from "./pages/terms&policies/policy";
import TermsLayout from "./pages/terms&policies/termsLayout";
import SettingsPage from "./pages/settings";

function App() {
  return (
    <>
      <Routes>
        <Route>
          <Route path="*" element={<NotFound />} />
          {/* Market place */}
          <Route path="/" element={<MarketPlaceLayout />}>
            {/* Landing page */}
            <Route path="/" element={<FeedLayout />}>
              <Route path="/" element={<NewsFeed />} />
              <Route path="/posts/:id" element={<SinglePostPage />} />
            </Route>

            <Route path="/profile" element={<Profile />} />

            {/* Complete profile */}
            <Route path="/" element={<ProfileLayout />}>
              <Route path="update-profile" element={<Home />} />
              <Route path="contact" element={<Contact />} />
              <Route path="address" element={<Address />} />
              <Route path="bio" element={<Bio />} />
              <Route path="overview" element={<Overview />} />
            </Route>

            {/* Create Company */}
            <Route element={<CompanyLayout />}>
              <Route path="create-company" element={<CreateCompany />} />
              <Route path="company-documents" element={<CompanyDocuments />} />
              <Route
                path="company-information"
                element={<CompanyInformation />}
              />
            </Route>
            {/* Bookmark */}
            <Route path="co/notifications" element={<NotificationItem />} />
            {/* Bookmark */}
            <Route path="co/bookmarks" element={<BookMark />} />
            {/* User Profile */}
            <Route path="co/:userId" element={<UserProfile />} />
            {/* Account Setting */}
            <Route path="co/setting" element={<SettingsPage />} />
            {/* Company Profile */}
            <Route path="search" element={<Search />} />
            <Route path=":company" element={<CompanyProfile />} />
            <Route path="analysis" element={<Analysis />} />
            <Route
              path="/co/representatives"
              element={<RepresentativesPage />}
            />
            <Route
              path="/co/representatives/manage"
              element={<AssignRepresentative />}
            />
            <Route
              path="/co/representatives/accept"
              element={<AcceptRepresentation />}
            />
            <Route element={<MessagesLayout />}>
              <Route path="messages" element={<MessagesPage />} />
              <Route path="messages/:room_name" element={<MessagingPage />} />
            </Route>
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="market" element={<Market />} />
            <Route path="products/:id" element={<Product />} />
            <Route path="products/listing" element={<Listing />} />
            {/* Services */}
            <Route path="services" element={<Services />} />

            <Route path="services/:id" element={<ServiceOverView />} />
            <Route path="services/add" element={<ServiceAdmin />} />
          </Route>

          {/* authentication routes */}
          <Route path="/" element={<AuthLayout />}>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-account" element={<VerifyAccount />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/confirm-reset-password"
              element={<ConfirmResetPassword />}
            />
          </Route>

          <Route path="/success" element={<SuccessPage />} />
          <Route path="/" element={<TermsLayout />}>
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditions />}
            />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
