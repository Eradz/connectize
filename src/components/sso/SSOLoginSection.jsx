import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getSSOProviders } from "../../api-services/sso";
import GoogleLoginButton from "./GoogleLoginButton";
import LinkedInLoginButton from "./LinkedInLoginButton";
import EnterpriseSSOButton, { startEnterpriseSSOFlow } from "./EnterpriseSSOButton";

/**
 * Renders all available SSO login buttons.
 * Fetches provider availability from the backend on mount.
 */
export default function SSOLoginSection({accountType = "user"}) {
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {pathname} = useLocation();
  useEffect(() => {
    getSSOProviders()
      .then(setProviders)
      .catch(() => setProviders({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const handleSSODetected = (ssoConfig) => {
    if (ssoConfig.sso_required || ssoConfig.sso_available) {
      startEnterpriseSSOFlow(ssoConfig);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <span className="relative bg-white px-3 text-sm text-gray-500">
          Or continue with
        </span>
      </div>

      <div className="space-y-2">
        {
           ( (pathname.includes("/signup") && accountType !== "company") || pathname.includes("/login")) && (
            <div>
        {providers?.google?.enabled && (
          <GoogleLoginButton
            clientId={providers.google.client_id}
            onError={setError}
          />
        )}

        {providers?.linkedin?.enabled && (
          <LinkedInLoginButton
            clientId={providers.linkedin.client_id}
            onError={setError}
          />
        )}

        
        </div>
      ) 
    }
    {((pathname.includes("/signup") && accountType === "company") || pathname.includes("/login")) && providers?.enterprise_sso && (
          <EnterpriseSSOButton onSSODetected={handleSSODetected} />
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
