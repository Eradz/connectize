import { Link } from "react-router-dom";
import Logo from "./logo";
import { webRoutes } from "../lib/webRoutes";

/**
 * Lightweight top bar shown to signed-out visitors on public, crawlable pages
 * (post / profile / company / knowledge article). It replaces the
 * authenticated Navbar + Sidebar, which assume a logged-in user, and gives
 * anonymous visitors a clear path to log in or sign up.
 */
const PublicNavbar = () => (
  <nav
    className="w-full min-h-16 flex items-center bg-white ios-safe-top"
    style={{ backgroundColor: "#ffffff", borderBottom: "2px solid #f1c644" }}
  >
    <div className="w-full lg:w-[80rem] lg:mx-auto flex items-center justify-between gap-4 px-4 md:px-6">
      <Logo url="/" size="48px" />
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to={webRoutes.login}
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-gray-300"
        >
          Log in
        </Link>
        <Link
          to={webRoutes.signup}
          className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:bg-custom_yellow"
        >
          Sign up
        </Link>
      </div>
    </div>
  </nav>
);

export default PublicNavbar;
