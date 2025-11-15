import React from "react";
import {
  acceptRepRequest,
  cancelOrDeclineRepRequest,
} from "../../api-services/representatives";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import clsx from "clsx";

export default function AcceptRepresentation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const buttonClass =
    "hover:bg-opacity-70 transition-all duration-300 py-2 px-4 rounded-full text-xs";

  const id = searchParams.get("rep_id");
  const token = searchParams.get("token");
  const companyUrl = searchParams.get("company_url");
  const companyName = searchParams.get("company");

  if (!token) {
    return <Navigate to="/" />;
  }

  const acceptInvite = async () => {
    const results = await acceptRepRequest(id, { token });
    if (results?.success) {
      navigate("/co/representatives");
    }
  };
  return (
    <section className="h-[60vh] flex items-center justify-center size-full text-center">
      <section className="space-y-2">
        <HeadingText>Accept Representation</HeadingText>
        <LightParagraph>
          You have been invited to represent{" "}
          <Link to={companyUrl} className="!text-black">
            {companyName}
          </Link>{" "}
          as a representative. By accepting this invitation, you agree to
          represent <Link to={companyUrl}>{companyName}</Link>.
        </LightParagraph>

        <div className="flex justify-center gap-2 mt-4">
          <Link
            to="/"
            className={clsx(buttonClass, "bg-gray-200")}
            onClick={() => cancelOrDeclineRepRequest(id)}
          >
            Cancel Invitation
          </Link>
          <button
            onClick={acceptInvite}
            className={clsx(buttonClass, "bg-gold")}
          >
            Accept Invitation
          </button>
        </div>
      </section>
    </section>
  );
}
