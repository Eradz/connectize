import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { User, Building2, ArrowLeft } from "lucide-react";
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

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid Email Address")
    .required("Fill in a valid email address"),

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

function AccountTypeStep({ accountType, setAccountType, onContinue }) {
  const options = [
    {
      value: "user",
      icon: User,
      title: "I'm a User",
      description:
        "Discover opportunities, network with professionals, and connect with top companies.",
    },
    {
      value: "company",
      icon: Building2,
      title: "I'm a Company",
      description:
        "Post jobs, manage your team, build your brand, and grow your business.",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-black">
          Which best describe you
        </h1>
        <p className="text-gray-500">
          This helps us personalize your experience and set up your account
          correctly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map(({ value, icon: Icon, title, description }) => {
          const selected = accountType === value;
          return (
            <button
              type="button"
              key={value}
              onClick={() => setAccountType(value)}
              className={`relative text-left rounded-2xl p-5 border transition-colors ${
                selected
                  ? "bg-black border-black text-white"
                  : "bg-white border-gray-200 text-black"
              }`}
            >
              <span
                className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selected ? "border-white" : "border-gray-300"
                }`}
              >
                {selected && (
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </span>

              <span className="w-11 h-11 rounded-full bg-amber-400 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-black" />
              </span>

              <p className="font-bold text-lg mb-1">{title}</p>
              <p
                className={`text-sm ${
                  selected ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {description}
              </p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!accountType}
        onClick={onContinue}
        className="w-full sm:w-[60%] mt-2 py-3 rounded-lg bg-black text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </section>
  );
}

function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite_token");
  const invitedEmail = searchParams.get("email");

  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState(null);

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
          account_type: accountType, // "user" | "company"
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

  const fields = [
    {
      name: "email",
      type: "email",
      label: "Company email",
      placeholder: "Example@companymail.com",
      validate: true,
      helpText:
        "Join Connectize with a professional email address. Accounts created with non-professional emails like example@gmail.com etc. will have limited functionalities on connectize",
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
      placeholder: "Enter the same password as above",
      validate: true,
    },
  ];

  if (step === 1) {
    return (
      <AccountTypeStep
        accountType={accountType}
        setAccountType={setAccountType}
        onContinue={() => setStep(2)}
      />
    );
  }

  return (
    <section className="space-y-4">
      <SEO
        title="User Registration"
        description="Connect, Collaborate and Thrive with Connectize"
      />
      <button
        type="button"
        onClick={() => setStep(1)}
        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-black"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <div>
        <HeadingText>Create new account</HeadingText>
      </div>
      <Form
        formik={formik}
        status={"none"}
        inputArray={fields}
        bottomCustomComponents={<CheckAgreement formik={formik} />}
        button={{
          type: "submit",
          text: "Sign up",
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

      <SSOLoginSection accountType={accountType} />
    </section>
  );
}

export default Signup;