import { useEffect, useState } from "react";
import { getSSOProviders } from "../../api-services/sso";
import GoogleLoginButton from "./GoogleLoginButton";
import LinkedInLoginButton from "./LinkedInLoginButton";
import EnterpriseSSOButton, { startEnterpriseSSOFlow } from "./EnterpriseSSOButton";

/**
 * Renders all available SSO login buttons.
 * Fetches provider availability from the backend on mount.
 */
export default function SSOLoginSection() {
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSSOProviders().then(setProviders);
  }, []);

  if (!providers) return null;

  const hasAnyProvider =
    providers.google?.enabled ||
    providers.linkedin?.enabled ||
    providers.enterprise_sso;

  if (!hasAnyProvider) return null;

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
        {providers.google?.enabled && (
          <GoogleLoginButton
            clientId={providers.google.client_id}
            onError={setError}
          />
        )}

        {providers.linkedin?.enabled && (
          <LinkedInLoginButton
            clientId={providers.linkedin.client_id}
            onError={setError}
          />
        )}

        {providers.enterprise_sso && (
          <EnterpriseSSOButton onSSODetected={handleSSODetected} />
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
