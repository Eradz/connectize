export const PROFILE_COMPLETION_ROUTE = "/update-profile/overview";
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