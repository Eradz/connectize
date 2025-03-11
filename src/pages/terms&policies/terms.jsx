import React, { useState } from "react";
import SideNavigation from "./components/SideNavigation";
import Content from "./components/Content";

const terms = [
  {
    title: "Terms and Conditions of Use",
    lastUpdated: "Feb 18, 2025",
    content: `Welcome to Connectize! These Terms and Conditions ("Terms") outline the rules and guidelines for your use of Connectize, a platform created to facilitate professional connections in the oil and gas industry both within Nigeria and globally. By accessing or using Connectize, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you disagree with any part of these Terms, you must refrain from using our services.`,
    details: [
      {
        heading: "Definitions",
        text: (
          <>
            'Connectize' refers to the platform, website, and all related
            services provided for networking and professional development.{" "}
            <strong className="text-black">'User'</strong>,{" "}
            <strong className="text-black">'You'</strong>, or{" "}
            <strong className="text-black">'Your'</strong> refers to any
            individual or entity that accesses or utilizes the Connectize
            platform. 'Content' includes all materials posted or shared within
            the platform, such as profiles, job postings, articles, messages,
            and other forms of communication.{" "}
            <strong className="text-black">'Services'</strong> refer to
            networking tools, job listings, professional development resources,
            and other features offered by Connectize.
          </>
        ),
      },
      {
        heading: "Eligibility",
        text: "You must be at least 18 years old and possess the legal capacity to form a binding contract to access and use Connectize. By using Connectize, you confirm your compliance with this requirement.",
      },
      {
        heading: "User Accounts",
        text: "When creating an account, you must provide accurate, truthful, and complete information. You are solely responsible for the security and confidentiality of your account and password. Connectize reserves the right to suspend or terminate accounts that violate these Terms, without notice and at its discretion.",
      },
      {
        heading: "Acceptable Use",
        text: "By using Connectize, you agree to abide by all applicable laws. Prohibited activities include, but are not limited to: Posting false, misleading, or deceptive content. Engaging in any form of harassment, discrimination, or abusive behavior. Uploading viruses, malicious software, spam, or unauthorized advertisements. Violating intellectual property rights or privacy laws.",
      },
    ],
  },
];

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState(terms[0].title);

  return (
    <>
      <SideNavigation
        array={terms}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <Content array={terms} activeSection={activeSection} />
    </>
  );
};

export default TermsAndConditions;
