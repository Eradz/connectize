import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../logo";
import { getSession } from "../../lib/session";
import useRedirect from "../../hooks/useRedirect";
import HeadingText from "../HeadingText";
import { useAuth } from "../../context/userContext";

function Profile() {
  const session = getSession();

  const { user: currentUser } = useAuth();

  useRedirect(!session, "/login");

  useRedirect(currentUser && !currentUser?.is_first_time_user, "/");

  useEffect(() => {
    document.title =
      "Complete your profile to start enjoying connectize's great services | Connectize";
  }, []);

  return (
    <section className="mx-auto flex flex-col justify-center items-center text-center space-y-6 min-h-[80vh]">
      <HeadingText>
        Would you like to set up <br />
        your profile now?
      </HeadingText>
      <img src="/images/passportOne.png" alt="passport" width="140px" />
      <div className="flex max-md:flex-col gap-3 font-semibold text-sm">
        <Link
          to="/update-profile"
          className="bg-gold hover:bg-opacity-60 rounded-full w-[250px] p-2"
        >
          Let's Go
        </Link>
        <Link
          to="/"
          className="bg-gray-300 hover:bg-opacity-60 rounded-full w-[250px] p-2"
        >
          Not Now
        </Link>
      </div>
    </section>
  );
}

export default Profile;
