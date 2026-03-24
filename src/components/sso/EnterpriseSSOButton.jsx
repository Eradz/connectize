import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { checkSSODomain, enterpriseSSOCallback } from "../../api-services/sso";
import { getCurrentUser } from "../../api-services/users";
import { useAuth } from "../../context/userContext";

export default function EnterpriseSSOButton({ onSSODetected }) {
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCheck = async () => {
    if (!email.includes("@")) {
      toast.error("Enter a valid work email address.");
      return;
    }
    setChecking(true);

    const result = await checkSSODomain(email);
    setChecking(false);

    if (result?.sso_available || result?.sso_required) {
      onSSODetected?.(result);
    } else {
      toast.error("No enterprise SSO configured for this email domain.");
    }
  };

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex items-center justify-center gap-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Sign in with Company SSO
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-gray-300 p-3">
      <p className="text-sm text-gray-600">Enter your work email to sign in with your company&apos;s SSO:</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCheck()}
        placeholder="you@company.com"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={checking || !email.includes("@")}
          className="flex-1 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {checking ? "Checking..." : "Continue with SSO"}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
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
  const hasRun = useRef(false);

  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    let config_id = null;
    try {
      const parsed = JSON.parse(stateParam || "{}");
      config_id = parsed.config_id;
    } catch {
      navigate("/login");
      return;
    }

    if (!code || !config_id) {
      navigate("/login");
      return;
    }

    (async () => {
      sessionStorage.removeItem("enterprise_sso_state");
      const redirectUri = `${window.location.origin}/sso/enterprise/callback`;
      const result = await enterpriseSSOCallback({
        config_id,
        code,
        redirect_uri: redirectUri,
      });

      if (result.success) {
        const userData = await getCurrentUser();
        setUser(userData);
        navigate(userData?.is_first_time_user ? "/profile" : "/");
      } else {
        if (result.message) {
          toast.error(result.message);
        }
        navigate("/login");
      }
    })();
  }, [code, stateParam, navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Signing in with your company...</span>
      </div>
    </div>
  );
}
