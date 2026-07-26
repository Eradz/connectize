import { createSEO } from "../../components/SEO";
import { Link } from "react-router-dom";
import { webRoutes } from "../../lib/webRoutes";
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
    <aside className="mx-auto mt-6 max-w-4xl rounded-xl border border-light_grey bg-white p-5 shadow-soft">
      <h2 className="text-lg font-semibold text-dark">Account and data deletion</h2>
      <p className="mt-2 text-sm leading-6 text-custom_grey">
        You can request permanent deletion of your Connectize account and its associated data without signing in.
      </p>
      <Link
        to={webRoutes.accountDeletion}
        className="mt-4 inline-flex rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-dark transition hover:bg-custom_yellow focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
      >
        Request account deletion
      </Link>
    </aside>
    <article
      className="privacy-policy-document"
      dangerouslySetInnerHTML={{ __html: policyMarkup }}
    />
  </section>
);

export default PrivacyPolicy;
