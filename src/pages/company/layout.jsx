import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { getCompanyByIdOrEmail } from "../../api-services/companies";
import LightParagraph from "../../components/ParagraphText";
import Restricted from "../../components/Restricted";
import { useAuth } from "../../context/userContext";
import useRedirect from "../../hooks/useRedirect";
import { UserType } from "../../lib/helpers/types";

const CompanyLayout = () => {
  const { user: currentUser } = useAuth();

  useRedirect(currentUser?.user_type === UserType, `/co/${currentUser?.id}`);

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompanyByIdOrEmail(),
    enabled: !!currentUser,
  });

  return (
    <section className="h-screen overflow-y-auto w-full max-w-screen-md flex justify-center bg-white rounded-md p-6">
      {currentUser?.user_type === UserType ? (
        <Restricted fallback="creating a company" />
      ) : companies.length >= 1 ? (
        <div className="flex flex-col items-center space-y-4">
          <DotLottieReact
            src="/lottie/notification.lottie"
            loop
            autoplay
            className="size-10/12 xs:size-1/2 md:size-56  aspect-square"
          />
          <LightParagraph center>
            You have reached the maximum number of companies per company for
            your subscription
          </LightParagraph>
        </div>
      ) : (
        <Outlet />
      )}
    </section>
  );
};

export default CompanyLayout;
