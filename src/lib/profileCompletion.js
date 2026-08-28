// The wizard's first step (home.jsx) is where first_name and last_name are
// entered, so that is where someone told to "complete your profile" needs to go.
// /update-profile/overview is the final review step and redirects away when the
// earlier steps are unfinished.
export const PROFILE_COMPLETION_ROUTE = "/update-profile";
export const PROFILE_COMPLETION_MESSAGE =
  "Complete your first and last name before creating or responding to content.";

export function createProfileCompletionRedirect({ notify, navigate, schedule }) {
  let redirecting = false;

  return (responseData) => {
    if (responseData?.code !== "profile_incomplete") return false;
    if (redirecting) return true;
    redirecting = true;

    const goToProfile = () => navigate(PROFILE_COMPLETION_ROUTE);
    notify(responseData.detail || PROFILE_COMPLETION_MESSAGE, {
      duration: 10000,
      action: {
        label: "Complete profile",
        onClick: goToProfile,
      },
    });
    schedule(goToProfile, 1200);
    return true;
  };
}
// The interceptors that call createProfileCompletionRedirect still reject/rethrow,
// so callers with their own catch-all error toast would report the same 403 twice -
// once as the actionable "Complete profile" prompt, once as a generic failure. Use
// this to skip the generic branch for an error the redirect already surfaced.
export function isProfileIncompleteError(error) {
  return error?.response?.data?.code === "profile_incomplete";
}
