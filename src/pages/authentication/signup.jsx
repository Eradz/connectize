import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { authenticationService } from "../../api-services/authentication";
import Form from "../../components/form";
import CheckAgreement from "../../components/form/checkAgreement";
import HeadingText from "../../components/HeadingText";
import { REGISTER_EMAIL_KEY } from "../../lib/helpers";
import SEO, { createSEO } from "../../components/SEO";
import SSOLoginSection from "../../components/sso/SSOLoginSection";

export const meta = () =>
  createSEO({
    title: "Sign Up | Connectize - Join the Oil & Gas Community",
    description: "Create your Connectize account and connect with thousands of oil and gas professionals. Network, collaborate, and grow your energy sector career.",
  keywords: "signup, register, oil and gas, energy jobs, professional network, join Connectize",
  });


// Two account types the toggle switches between. Kept outside the
// component so the array identity is stable across renders.
const ACCOUNT_TYPES = [
  { key: "user", label: "For Users" },
  { key: "company", label: "For Companies" },
];

// Free/consumer email providers. Users must sign up with one of these,
// companies are blocked from using any of them.
const GENERIC_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "zoho.com",
];

function buildValidationSchema(accountType) {
  return Yup.object().shape({
    email: Yup.string()
      // Keyboards and paste readily add a trailing space, and Yup's email test
      // rejects whitespace - so a perfectly good address came back as "Invalid
      // Email Address". Casting trims it before the test runs.
      .trim()
      .email("Invalid Email Address")
      .required("Fill in a valid email address")
      .test(
        "account-type-email-domain",
        "Invalid email for this account type",
        function (value) {
          if (!value) return true; // let .required()/.email() report those

          const domain = value.split("@")[1]?.toLowerCase();
          if (!domain) return true;

          const isGeneric = GENERIC_EMAIL_DOMAINS.includes(domain);

          if (accountType === "company" && isGeneric) {
            return this.createError({
              message:
                "Company accounts need a company email address (e.g. name@yourcompany.com), not a personal provider like Gmail, Yahoo, or Outlook.",
            });
          }

          return true;
        }
      ),

    password: Yup.string()
      .min(8, "Password should be at least 8 characters long")
      .matches(
        /^[a-zA-Z0-9@!#$%^&*()_+|~=`{}[\]:";'<>?,./-]+$/,
        "Only alphanumeric characters and special characters allowed."
      )
      .required("Fill in your password"),
    confirmPassword: Yup.string()
      .required("Password confirmation is required")
      .test(
        "passwords-match",
        "Password and confirm password must match",
        function (value) {
          return this.parent.password === value;
        }
      ),
    isChecked: Yup.boolean().oneOf(
      [true],
      "You must accept the terms and conditions"
    ),
  });
}

function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite_token");
  const invitedEmail = searchParams.get("email");

  // Which signup flow is active. Defaults to "user" since that's the
  // pre-selected tab in the design.
  const [accountType, setAccountType] = useState("user");
  const isCompany = accountType === "company";

  // Recomputed whenever the tab switches, since "valid email" means
  // something different for users vs. companies.
  const validationSchema = useMemo(
    () => buildValidationSchema(accountType),
    [accountType]
  );

  const formValues = {
    email: invitedEmail || "",
    password: "",
    confirmPassword: "",
    isChecked: false,
  };

  const formik = useFormik({
    initialValues: formValues,
    validationSchema: validationSchema,
    onSubmit: async ({ email, password, confirmPassword }, { resetForm }) => {
      const success = await authenticationService({
        values: {
          email,
          username: email,
          password1: password,
          password2: confirmPassword,
          account_type: accountType,
          ...(inviteToken ? { invite_token: inviteToken } : {}),
        },
        url: "registration",
        resetForm,
        type: "register",
      });

      if (success) {
        localStorage.setItem(REGISTER_EMAIL_KEY, email);
        navigate("/verify-account");
      }
    },
  });

  useEffect(() => {
    formik.setValues(formValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // The email that was valid under one tab may not be under the other,
    // so re-check it as soon as the person switches.
    if (formik.values.email) {
      formik.validateField("email");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountType]);

  const fields = [
    {
      name: "email",
      type: "email",
      label: isCompany ? "Company Email/Username" : "Email/Username",
      placeholder: isCompany ? "Example@companymail.com" : "Name@example.com",
      validate: true,
      helpText: isCompany
        ? "Use your company's own domain (e.g. name@yourcompany.com). Personal providers like Gmail, Yahoo, or Outlook aren't accepted for company accounts."
        : "Join Connectize with any valid email address.",
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      placeholder: "At least 8 characters",
      validate: true,
    },
    {
      name: "confirmPassword",
      type: "password",
      label: "Confirm Password",
      placeholder: "At least 8 characters",
      validate: true,
    },
  ];

  return (
    <section className="space-y-4">
      <SEO
        title="User Registration"
        description="Connect, Collaborate and Thrive with Connectize"
      />
      <div>
        <HeadingText>
          Build your professional presence with{" "}
          <span className="text-[#F5A623]">Connectize</span>
        </HeadingText>
        <p className="text-gray-500 mt-1">
          Create your company profile and connect with the industry.
        </p>
      </div>

      {/* Account type toggle: pill-shaped tab switcher */}
      <div className="flex bg-gray-100 rounded-full p-1">
        {ACCOUNT_TYPES.map(({ key, label }) => {
          const active = accountType === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setAccountType(key)}
              aria-pressed={active}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#F5A623] text-black"
                  : "bg-transparent text-gray-500"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <Form
        formik={formik}
        status={"none"}
        inputArray={fields}
        bottomCustomComponents={<CheckAgreement formik={formik} />}
        button={{
          type: "submit",
          text: "Signup",
          submitText: "Creating your account...",
          style: "!md:w-[60%] mt-4",
        }}
      />

      <p className="text-center xs:text-sm font-[400]">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-black">
          Login
        </Link>
      </p>

      <SSOLoginSection />
    </section>
  );
}

export default Signup;