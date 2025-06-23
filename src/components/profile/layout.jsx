import { Outlet } from "react-router-dom";
import useRedirect from "../../hooks/useRedirect";
import { getSession } from "../../lib/session";

function ProfileLayout() {
  const currentYear = new Date().getFullYear();

  const session = getSession();

  useRedirect(!session, "/login");

  return (
    <>
      <main className="container max-w-screen-lg mx-auto bg-white rounded-md h-[90vh] overflow-y-auto">
        <Outlet />
      </main>
      <footer className="text-center py-6 text-sm bg-white rounded-md">
        <p>ALL RIGHT RESERVED &copy; {currentYear}</p>
      </footer>
    </>
  );
}

export default ProfileLayout;
