import { useNavigate, useSearchParams } from "react-router-dom";
import { linkedinSSOLogin } from "../../api-services/sso";
import { getCurrentUser } from "../../api-services/users";
import { useAuth } from "../../context/userContext";

export default function LinkedInLoginButton({ clientId, onError }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  if (!clientId) return null;

  const handleClick = () => {
    const redirectUri = `${window.location.origin}/sso/linkedin/callback`;
    const state = crypto.randomUUID();
    sessionStorage.setItem("linkedin_sso_state", state);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: "openid profile email",
    });

    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center justify-center gap-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
          fill="#0A66C2"
        />
      </svg>
      Continue with LinkedIn
    </button>
  );
}

/**
 * Callback handler component — mount at /sso/linkedin/callback
 */
export function LinkedInCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = sessionStorage.getItem("linkedin_sso_state");

  if (!code || state !== storedState) {
    navigate("/login");
    return null;
  }

  // Exchange code on mount
  (async () => {
    sessionStorage.removeItem("linkedin_sso_state");
    const redirectUri = `${window.location.origin}/sso/linkedin/callback`;
    const success = await linkedinSSOLogin({ code, redirect_uri: redirectUri });

    if (success) {
      const userData = await getCurrentUser();
      setUser(userData);
      navigate(userData?.is_first_time_user ? "/profile" : "/");
    } else {
      navigate("/login");
    }
  })();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Signing in with LinkedIn...</span>
      </div>
    </div>
  );
}
