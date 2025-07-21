import React, { useState } from "react";
import { getSession } from "../../lib/session";
import useRedirect from "../../hooks/useRedirect";
import { Outlet } from "react-router-dom";

function ProfileLayout() {
  const currentYear = new Date().getFullYear();

  const session = getSession();

  useRedirect(!session, "/login");

  // saving the uploaded image here is required because the overview component where it gets uploaded unmounts when the page changs (like when the user goes back to a previous step) which resets the uploaded image.

  // All the for fields are set in localstorage as in localstorage is the state, but the uploaded image is stored in formik inside the overview page. So to keep the uploaded image even after the overview page/component unmounts, i either have to save the image in localstorage of push the state up here in the layout.jsx component and i obviously went with the later.

  /**
   * @description uploadedProfileImage type string | File | null
   
   */
  const [uploadedProfileImage, setUploadedProfileImage] = useState(null);

  return (
    <>
      <main className="container max-w-screen-lg mx-auto">
        <Outlet context={{ uploadedProfileImage, setUploadedProfileImage }} />
      </main>
      <footer className="text-center py-6 text-sm bg-white rounded-md">
        <p>ALL RIGHT RESERVED &copy; {currentYear}</p>
      </footer>
    </>
  );
}

export default ProfileLayout;
