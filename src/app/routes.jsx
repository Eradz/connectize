import {
  //   type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";
import { webRoutes } from "../lib/webRoutes";

export default [
  layout("../pages/AppLayout.jsx", [
    layout("../pages/FeedLayout.jsx", [
      route(webRoutes.newsFeed, "../pages/feed/newsFeed.jsx"),
      route(webRoutes.singlePost, "../pages/posts/singlePostPage.jsx"),
      route(webRoutes.postInsights, "../pages/posts/postInsightsPage.jsx"),
    ]),

    route(webRoutes.profile, "../components/profile/profile.jsx"),

    // Profile Update Routes
    layout("../components/profile/layout.jsx", [
      route(webRoutes.address, "../components/profile/address.jsx"),
      route(webRoutes.bio, "../components/profile/bio.jsx"),
      route(webRoutes.contact, "../components/profile/contact.jsx"),
      route(webRoutes.home, "../components/profile/home.jsx"),
      route(webRoutes.overview, "../components/profile/overview.jsx"),
    ]),

    // company routes
    layout("../pages/company/layout.jsx", [
      route(webRoutes.createCompany, "../pages/company/index.jsx"),
      route(
        webRoutes.companyDocuments,
        "../pages/company/CompanyDocuments.jsx"
      ),
      route(
        webRoutes.companyInformation,
        "../pages/company/CompanyInformation.jsx"
      ),
    ]),

    route(webRoutes.analysis, "../pages/market/analysis.jsx"),
    route(webRoutes.blockedUsers, "../pages/blocked-users/index.jsx"),
    route(webRoutes.blockedCompanies, "../pages/blocked-companies/index.jsx"),
    route(webRoutes.userConnections, "../pages/connections/index.jsx"),
    route(webRoutes.bookmarks, "../pages/bookmark/index.jsx"),
    route(webRoutes.companies, "../pages/companies/index.jsx"),

    route(webRoutes.coNotifications, "../components/notifications.jsx"),
    route(webRoutes.company, "../pages/feed/companyProfile.jsx"),
    route(webRoutes.companyEditProfile, "../pages/company/edit/index.jsx"),
    route(webRoutes.market, "../pages/market/market.jsx"),
    route(webRoutes.messages, "../pages/messages/layout.jsx"),
    route(webRoutes.productDetails, "../pages/market/product.jsx"),
    route(webRoutes.productListing, "../pages/market/listing.jsx"),

    //
    route(webRoutes.representatives, "../pages/representatives/index.jsx"),
    route(
      webRoutes.assignRepresentative,
      "../pages/representatives/AssignRepresentative.jsx"
    ),
    route(
      webRoutes.acceptRepresentation,
      "../pages/representatives/AcceptRepresentation.jsx"
    ),

    //
    route(webRoutes.search, "../pages/search/index.jsx"),
    route(webRoutes.services, "../pages/service/service.jsx"),
    route(webRoutes.servicesAdd, "../pages/service/serviceAdmin.jsx"),
    route(webRoutes.servicesDetail, "../pages/service/serviceOverview.jsx"),

    //
    route(webRoutes.settings, "../pages/settings/index.jsx"),
    route(webRoutes.enterpriseSSOSetup, "../pages/settings/EnterpriseSSOSetup.jsx"),
    route(webRoutes.manageEmails, "../pages/settings/ManageEmails.jsx"),
    route(webRoutes.userProfile, "../pages/feed/userProfile.jsx"),
    route(webRoutes.support, "../pages/support/Support.jsx"),

    //
  ]),

  //   Authentication Routes
  layout("../pages/authentication/AuthLayout.jsx", [
    route(webRoutes.signup, "../pages/authentication/signup.jsx"),
    route(webRoutes.login, "../pages/authentication/login.jsx"),
    route(
      webRoutes.reactivateAccount,
      "../pages/authentication/reactivation.jsx"
    ),
    route(
      webRoutes.verifyAccount,
      "../pages/authentication/verify-account.jsx"
    ),
    route(
      webRoutes.resetPassword,
      "../pages/authentication/reset-password.jsx"
    ),
    route(
      webRoutes.confirmResetPassword,
      "../pages/authentication/confirmPasswordReset.jsx"
    ),
    route(webRoutes.success, "../pages/authentication/successpage.jsx"),
  ]),

  // Misc Pages
  layout("../pages/terms&policies/termsLayout.jsx", [
    route(webRoutes.termsAndConditions, "../pages/terms&policies/terms.jsx"),
    route(webRoutes.privacyPolicy, "../pages/terms&policies/policy.jsx"),
  ]),
];
