import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { authenticationService } from "../../api-services/authentication";
import { SUCCESS_TYPE_KEY } from "../../lib/data/authentication";
import { REGISTER_EMAIL_KEY } from "../../lib/helpers";
import SEO from "../../components/SEO";
import Logo from "../../components/logo";
import SvgIcon from "./StunningBackgroundSVG";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid Email Address")
    .required("Please enter a valid email address"),

  password: Yup.string()
    .min(8, "Password must contain at least one uppercase letter, one lowercase letter, and one number.")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number."
    )
    .required("Password must contain at least one uppercase letter, one lowercase letter, and one number."),
  confirmPassword: Yup.string()
    .required("Password confirmation is required")
    .test(
      "passwords-match",
      "Password must be the same",
      function (value) {
        return this.parent.password === value;
      }
    ),
  isChecked: Yup.boolean().oneOf(
    [true],
    "You must accept the terms and conditions"
  ),
});

function Signup() {
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState(0);

  const formValues = {
    email: "",
    password: "",
    confirmPassword: "",
    isChecked: false,
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    return strength;
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
        },
        url: "registration",
        resetForm,
        type: "register",
      });

      if (success) {
        localStorage.setItem(SUCCESS_TYPE_KEY, REGISTER_EMAIL_KEY);
        localStorage.setItem(REGISTER_EMAIL_KEY, email);
        navigate("/success");
      }
    },
  });

  useEffect(() => {
    formik.setValues(formValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formik.values.password));
  }, [formik.values.password]);

  const isPasswordStrong = passwordStrength === 4;
  const isConfirmPasswordValid =
    formik.values.confirmPassword &&
    !formik.errors.confirmPassword &&
    formik.touched.confirmPassword &&
    isPasswordStrong;

  return (
    <>
      <SEO
        title="User Registration"
        description="Connect, Collaborate and Thrive with Connectize"
      />
      <div className="flex bg-white h-screen overflow-hidden">
        {/* LEFT SIDE - Form */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-8">
          <div className="w-full max-w-[380px]">
            {/* Logo */}
            <div className="mb-10">
              <Logo url="/login" />
            </div>

            <h1 className="text-[26px] font-semibold mb-5 text-[#1a1a1a]">
              Create new account
            </h1>

            <form onSubmit={formik.handleSubmit} className="space-y-3.5">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#1a1a1a] mb-2"
                >
                  Company email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Example@companymail.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none text-sm transition ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white focus:border-gray-400"
                  }`}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="flex items-start gap-1.5 mt-1.5 text-red-500 text-xs">
                    <svg
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#1a1a1a] mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 digits"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none text-sm transition ${
                    formik.touched.password && formik.errors.password
                      ? "border border-red-500 bg-red-50"
                      : "border border-gray-300 bg-white focus:border-gray-400"
                  }`}
                />

                {/* Password Strength Indicators */}
                <div className="flex gap-1.5 mt-2">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded transition-colors ${
                        passwordStrength >= level ? "bg-red-500" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {formik.touched.password &&
                  formik.values.password &&
                  formik.errors.password && (
                    <p className="flex items-start gap-1.5 mt-1.5 text-red-500 text-xs">
                      <svg
                        className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formik.errors.password}
                    </p>
                  )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#1a1a1a] mb-2"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Password must be the same"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none text-sm transition ${
                    isConfirmPasswordValid
                      ? "border border-green-500 bg-green-50"
                      : "border border-gray-300 bg-white focus:border-gray-400"
                  }`}
                />
                {isConfirmPasswordValid && (
                  <p className="flex items-start gap-1.5 mt-1.5 text-green-600 text-xs">
                    <svg
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Password is strong
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  id="isChecked"
                  name="isChecked"
                  type="checkbox"
                  checked={formik.values.isChecked}
                  onChange={formik.handleChange}
                  className="w-4 h-4 mt-0.5 border-2 border-gray-300 rounded focus:ring-0 text-gray-900 cursor-pointer"
                />
                <label htmlFor="isChecked" className="text-sm text-[#1a1a1a] cursor-pointer leading-tight">
                  I agree to{" "}
                  <Link
                    to="/terms-and-conditions"
                    className="font-semibold text-[#1a1a1a] underline"
                  >
                    Terms and Condition
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-[#F5C518] hover:bg-[#E5B508] text-[#1a1a1a] font-semibold py-2.5 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-3"
              >
                {formik.isSubmitting ? "Creating your account..." : "Sign up"}
              </button>
            </form>

            <p className="text-center text-sm text-[#666666] mt-4">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#1a1a1a] underline">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - Background */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
          <div className="absolute inset-0 w-full h-full">
            <SvgIcon style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div className="relative z-10 flex flex-col justify-end w-full h-full px-16 pb-16">
            <div className="text-white max-w-[600px]">
              <h2 className="text-[32px] font-normal leading-tight mb-2">
                Join <span className="font-bold">Connectize.co</span> today.
              </h2>

              <p className="text-[32px] font-normal leading-[1.1] mb-4">
                Register now to expand your network and elevate your business
              </p>

              <p className="text-[15px] leading-relaxed font-normal">
                <span className="font-bold underline decoration-2 underline-offset-2">
                  Register
                </span>{" "}
                to access all the features of our services and manage your business all in one platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;