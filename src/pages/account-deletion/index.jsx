import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import SEO from "../../components/SEO";
import { sendSupportMessage } from "../../api-services/support";
import { webRoutes } from "../../lib/webRoutes";

const initialForm = {
  fullName: "",
  email: "",
  reason: "",
  consent: false,
  website: "",
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-light_grey bg-white px-4 py-3 text-dark outline-none transition placeholder:text-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/30";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountDeletionPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [formError, setFormError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.website) {
      setRequestId("submitted");
      return;
    }

    if (!form.fullName.trim() || !form.email.trim()) {
      setFormError("Enter your full name and the email address used for your Connectize account.");
      return;
    }

    if (!emailPattern.test(form.email.trim())) {
      setFormError("Enter a valid email address for your Connectize account.");
      return;
    }

    if (!form.consent) {
      setFormError("Confirm that you understand account deletion is permanent.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    const reason = form.reason.trim() || "No reason provided.";
    const result = await sendSupportMessage({
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      subject: "Account deletion request",
      message: [
        "I request permanent deletion of my Connectize account and the personal data associated with it.",
        `Connectize account email: ${form.email.trim()}`,
        `Reason: ${reason}`,
        "I understand that Connectize will contact me at this email address to verify account ownership before completing the request.",
      ].join("\n\n"),
    });

    setIsSubmitting(false);

    const submittedRequestId = result?.results?.id || result?.id;
    if (result?.success && submittedRequestId) {
      setRequestId(submittedRequestId);
      setForm(initialForm);
      return;
    }

    setFormError(
      "We could not submit your request. Please try again or email info@connectize.co with the subject “Account deletion request.”",
    );
  };

  return (
    <div className="min-h-screen bg-background text-dark">
      <SEO
        title="Request Account Deletion | Connectize"
        description="Request permanent deletion of your Connectize account and associated personal data."
        url="https://connectize.co/account-deletion"
      />

      <header className="border-b border-light_grey bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4" aria-label="Account deletion navigation">
          <Link to="/" className="flex items-center gap-3" aria-label="Connectize home">
            <img src="/images/logo.png" alt="Connectize" className="h-11 w-11 object-contain" />
            <span className="text-lg font-semibold">Connectize</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-custom_grey transition hover:bg-background hover:text-dark focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Back to Connectize
          </Link>
        </nav>
      </header>

      <main>
        <section className="border-b border-light_grey bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-sm font-semibold text-primary-800">
                <ShieldCheck size={17} aria-hidden="true" />
                Connectize privacy control
              </span>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Request deletion of your Connectize account
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-custom_grey sm:text-lg">
                Use this page to request permanent deletion of your Connectize account and associated personal data. You do not need the mobile app or an active login to submit a request.
              </p>
            </div>

            <div className="rounded-2xl border border-light_grey bg-background p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary-100 p-3 text-primary-800">
                  <Clock3 size={24} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-semibold">What happens next</h2>
                  <p className="mt-2 text-sm leading-6 text-custom_grey">
                    The Connectize support team will contact the account email to verify ownership. After verification, we will process the deletion and send a completion notice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
          <div className="space-y-6">
            <article className="rounded-2xl border border-light_grey bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold">How to request deletion</h2>
              <ol className="mt-5 space-y-4">
                {[
                  "Enter your name and the email used for your Connectize account.",
                  "Confirm that you understand the deletion is permanent, then submit the form.",
                  "Complete the ownership verification sent to your account email.",
                  "Connectize will delete or de-identify the account data and confirm completion.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-custom_grey">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold font-semibold text-dark">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>

            <article className="rounded-2xl border border-light_grey bg-white p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <Trash2 className="text-error-600" size={22} aria-hidden="true" />
                <h2 className="text-xl font-semibold">Data deleted or de-identified</h2>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-custom_grey">
                <li>Account, profile, authentication, and contact information.</li>
                <li>Posts, comments, uploaded media, messages, saved items, and notifications associated with the account.</li>
                <li>Connections, follows, and personal representative or membership associations.</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-light_grey bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold">Data that may be retained</h2>
              <p className="mt-3 text-sm leading-6 text-custom_grey">
                Connectize may retain limited records where necessary for security, fraud prevention, dispute resolution, tax or accounting obligations, or other legal requirements. We may also retain a record of the deletion request and verification. Such records are restricted, are not used to restore your public account, and are kept only for as long as required for those purposes before deletion or anonymization.
              </p>
              <Link
                to={webRoutes.privacyPolicy}
                className="mt-4 inline-flex text-sm font-semibold text-primary-800 underline decoration-gold decoration-2 underline-offset-4 hover:text-dark"
              >
                Read the Connectize Privacy Policy
              </Link>
            </article>
          </div>

          <section className="h-fit rounded-2xl border border-light_grey bg-white p-6 shadow-medium sm:p-8" aria-labelledby="deletion-request-form-title">
            {requestId ? (
              <div className="py-8 text-center" role="status">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-700">
                  <CheckCircle2 size={30} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-2xl font-semibold">Request received</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-custom_grey">
                  Check your email for the next verification step. For your security, Connectize will not delete an account until ownership has been verified.
                </p>
                {requestId !== "submitted" && (
                  <p className="mt-4 text-sm font-medium text-dark">Support request #{requestId}</p>
                )}
                <button
                  type="button"
                  onClick={() => setRequestId(null)}
                  className="mt-6 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-dark transition hover:bg-custom_yellow focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <>
                <h2 id="deletion-request-form-title" className="text-2xl font-semibold">Account deletion request</h2>
                <p className="mt-2 text-sm leading-6 text-custom_grey">
                  Use the exact email address associated with the account so we can verify your request.
                </p>

                <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
                  <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(event) => updateField("website", event.target.value)}
                    />
                  </div>

                  <label className="block text-sm font-medium text-dark" htmlFor="full-name">
                    Full name
                    <input
                      id="full-name"
                      name="full_name"
                      type="text"
                      autoComplete="name"
                      required
                      value={form.fullName}
                      onChange={(event) => updateField("fullName", event.target.value)}
                      className={inputClassName}
                      placeholder="Your full name"
                    />
                  </label>

                  <label className="block text-sm font-medium text-dark" htmlFor="account-email">
                    Connectize account email
                    <input
                      id="account-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      className={inputClassName}
                      placeholder="name@example.com"
                    />
                  </label>

                  <label className="block text-sm font-medium text-dark" htmlFor="deletion-reason">
                    Reason for leaving <span className="font-normal text-custom_grey">(optional)</span>
                    <textarea
                      id="deletion-reason"
                      name="reason"
                      rows={4}
                      value={form.reason}
                      onChange={(event) => updateField("reason", event.target.value)}
                      className={`${inputClassName} resize-y`}
                      placeholder="Tell us why you are deleting your account"
                    />
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-light_grey bg-background p-4 text-sm leading-6 text-dark">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(event) => updateField("consent", event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-light_grey accent-gold focus:ring-gold"
                    />
                    <span>
                      I understand that deleting my Connectize account is permanent and that deleted account data cannot be restored.
                    </span>
                  </label>

                  {formError && (
                    <p className="rounded-xl border border-error-100 bg-error-50 px-4 py-3 text-sm leading-6 text-error-700" role="alert">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-error-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                    {isSubmitting ? "Submitting request…" : "Request account deletion"}
                  </button>
                </form>

                <div className="mt-6 border-t border-light_grey pt-5 text-sm leading-6 text-custom_grey">
                  <p className="flex items-start gap-2">
                    <Mail size={18} className="mt-1 shrink-0" aria-hidden="true" />
                    <span>
                      If the form is unavailable, email{" "}
                      <a className="font-semibold text-primary-800 underline" href="mailto:info@connectize.co?subject=Account%20deletion%20request">
                        info@connectize.co
                      </a>{" "}
                      from your account email with the subject “Account deletion request.”
                    </span>
                  </p>
                </div>
              </>
            )}
          </section>
        </section>

        <section className="border-y border-light_grey bg-white">
          <div className="mx-auto max-w-6xl px-5 py-8">
            <h2 className="text-lg font-semibold">Before submitting</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-custom_grey">
              Save any information you need before deletion. If you have a paid subscription billed through Google Play or another payment provider, cancel it with that provider first; deleting a Connectize account does not automatically cancel third-party billing.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-dark text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Connectize. All rights reserved.</p>
          <div className="flex flex-wrap gap-5 text-gray-300">
            <Link className="hover:text-gold" to={webRoutes.privacyPolicy}>Privacy Policy</Link>
            <Link className="hover:text-gold" to={webRoutes.termsAndConditions}>Terms</Link>
            <a className="hover:text-gold" href="mailto:info@connectize.co">Contact support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
