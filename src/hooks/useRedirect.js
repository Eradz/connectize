import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useRedirect = (shouldRedirect, to = "/") => {
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldRedirect) {
      navigate(to, { replace: true });
    }
  }, [shouldRedirect, navigate, to]);
};

export default useRedirect;
