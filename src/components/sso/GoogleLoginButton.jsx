import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { googleSSOLogin } from "../../api-services/sso";
import { getCurrentUser } from "../../api-services/users";
import { useAuth } from "../../context/userContext";

export default function GoogleLoginButton({ clientId, onError }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  if (!clientId) return null;

  const handleSuccess = async (credentialResponse) => {
    const credential = credentialResponse.credential;
    if (!credential) {
      onError?.("No credential received from Google");
      return;
    }

    const success = await googleSSOLogin(credential);
    if (success) {
      const userData = await getCurrentUser();
      setUser(userData);
      navigate(userData?.is_first_time_user ? "/profile" : "/");
    } else {
      onError?.("Google sign-in failed. Please try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.("Google sign-in was cancelled")}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </GoogleOAuthProvider>
  );
}
