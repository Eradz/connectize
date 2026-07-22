import { createSEO } from "../../components/SEO";
import privacyPolicyHtml from "./privacy-policy.html?raw";
import "./privacy-policy.css";

export const meta = () =>
  createSEO({
    title: "Privacy Policy | Connectize",
    description:
      "Read the Connectize Privacy Policy to understand how we collect, use, and protect your personal data.",
    keywords: "privacy policy, data protection, GDPR, Connectize",
  });

// Termly includes two document-level style blocks. The same rules are scoped to
// this page in privacy-policy.css so the policy cannot restyle the wider app.
const policyMarkup = privacyPolicyHtml.replace(
  /<style[\s\S]*?<\/style>/gi,
  "",
);

const PrivacyPolicy = () => (
  <section className="privacy-policy-page" aria-labelledby="privacy-policy-title">
    <h1 id="privacy-policy-title" className="sr-only">
      Connectize Privacy Policy
    </h1>
    <article
      className="privacy-policy-document"
      dangerouslySetInnerHTML={{ __html: policyMarkup }}
    />
  </section>
);

export default PrivacyPolicy;
