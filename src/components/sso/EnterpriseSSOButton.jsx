import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { checkSSODomain, enterpriseSSOCallback } from "../../api-services/sso";
import { getCurrentUser } from "../../api-services/users";
import { useAuth } from "../../context/userContext";

export default function EnterpriseSSOButton({ onSSODetected }) {
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    if (!email.includes("@")) return;
    setChecking(true);

    const result = await checkSSODomain(email);
    setChecking(false);

    if (result?.sso_available) {
      onSSODetected?.(result);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCheck}
        disabled={checking || !email.includes("@")}
        className="flex items-center justify-center gap-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        {checking ? "Checking..." : "Sign in with Company SSO"}
      </button>
    </div>
  );
}

/**
 * Enterprise SSO redirect flow.
 * After the user clicks "Sign in with Company SSO" and SSO is detected,
 * this initiates the OIDC redirect to their IdP.
 */
export function startEnterpriseSSOFlow(ssoConfig) {
  const { config_id, authorization_url, client_id } = ssoConfig;
  if (!authorization_url) return false;

  const redirectUri = `${window.location.origin}/sso/enterprise/callback`;
  const state = JSON.stringify({ config_id, nonce: crypto.randomUUID() });
  sessionStorage.setItem("enterprise_sso_state", state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: client_id,
    redirect_uri: redirectUri,
    state,
    scope: "openid profile email",
  });

  window.location.href = `${authorization_url}?${params}`;
  return true;
}

/**
 * Mount at /sso/enterprise/callback
 */
export function EnterpriseSSOCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");

  let config_id = null;
  try {
    const parsed = JSON.parse(stateParam || "{}");
    config_id = parsed.config_id;
  } catch {
    navigate("/login");
    return null;
  }

  if (!code || !config_id) {
    navigate("/login");
    return null;
  }

  (async () => {
    sessionStorage.removeItem("enterprise_sso_state");
    const redirectUri = `${window.location.origin}/sso/enterprise/callback`;
    const success = await enterpriseSSOCallback({
      config_id,
      code,
      redirect_uri: redirectUri,
    });

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
        <span className="text-sm text-gray-400">Signing in with your company...</span>
      </div>
    </div>
  );
}
