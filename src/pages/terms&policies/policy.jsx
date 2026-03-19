import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Privacy Policy | Connectize",
    description: "Read the Connectize Privacy Policy to understand how we collect, use, and protect your personal data.",
  keywords: "privacy policy, data protection, GDPR, Connectize",
  });

import React, { useState } from "react";
import Content from "./components/Content";
import SideNavigation from "./components/SideNavigation";

const policies = [
  {
    title: "Privacy Policy",
    lastUpdated: "Feb 18, 2025",
    content: `At Connectize, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data while using the platform. By using Connectize, you agree to the collection and use of information as described in this policy.`,
    details: [
      {
        heading: "Data Collection",
        text: "We collect personal information when you register, use, or interact with the platform. This may include your name, email address, job history, location, and other relevant professional data.",
      },
      {
        heading: "Data Usage",
        text: "Your data will be used to provide the services on Connectize, including networking opportunities, job listings, and profile management. We may also use your information to communicate important updates, promotions, or service-related notifications.",
      },
      {
        heading: "Data Sharing",
        text: "We do not sell or rent your personal information to third parties.",
      },
      {
        heading: "Data Security",
        text: "We implement industry-standard security measures to protect your data from unauthorized access, loss, or theft. While we strive to protect your data, no method of transmission over the internet is 100% secure.",
      },
      {
        heading: "User Rights",
        text: "You have the right to access, update, or delete your personal information at any time. If you wish to exercise these rights, please contact us directly at info@connectize.co.",
      },
    ],
  },
];

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState(policies[0].title);

  return (
    <>
      <SideNavigation
        array={policies}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <Content array={policies} activeSection={activeSection} />
    </>
  );
};

export default PrivacyPolicy;
