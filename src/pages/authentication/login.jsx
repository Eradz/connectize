/* eslint-disable react/react-in-jsx-scope */
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { loginUser } from "../../api-services/authentication";
import { getCurrentUser } from "../../api-services/users";
import SEO, { createSEO } from "../../components/SEO";
import { useAuth } from "../../context/userContext";
import Logo from "../../components/logo";
import SvgIcon from "./loginsvg";

export const meta = () =>
  createSEO({
    title: "Login to connectize",
    description: "Connect, Collaborate and Thrive with Connectize",
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
});

function Login() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [rememberMe, setRememberMe] = useState(false);

  const nextParam = searchParams.get("next");

  const navigateTo =
    user && user?.is_first_time_user
      ? "/profile"
      : searchParams.has("next")
        ? nextParam
        : "/";

  const formValues = {
    username: "",
    email: "",
    password: "",
  };

  const formik = useFormik({
    initialValues: formValues,
    validationSchema: validationSchema,
    onSubmit: async ({ email, password }, { resetForm }) => {
      try {
        console.log("🔐 Starting login process...");
        const success = await loginUser({ email, password, resetForm });
        console.log("Login result:", success);

        if (success) {
          console.log("✅ Login successful, fetching user data...");
          const userData = await getCurrentUser();
          console.log("User data:", userData);
          setUser(userData);
        } else {
          console.error("❌ Login failed - success is false");
        }
      } catch (error) {
        console.error("❌ Login error caught:", error);
        console.error("Error stack:", error.stack);
      }
    },
  });

  if (user) navigate(navigateTo);

  useEffect(() => {
    formik.setValues(formValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SEO
        title="Login to connectize"
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

            {/* Welcome Message */}
            <h1 className="text-[26px] font-semibold mb-5 text-[#1a1a1a]">
              👋 Welcome {user?.name ? `"${user.name}"` : '"Ronney"'}
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
                {formik.touched.password && formik.errors.password && (
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

              {/* Remember Me & Forgotten Password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border-2 border-gray-300 rounded focus:ring-0 text-gray-900 cursor-pointer"
                  />
                  <span className="text-sm text-[#1a1a1a]">Remember me</span>
                </label>
                <Link
  to="/reset-password"
  className="text-sm text-black hover:underline font-bold"
>
  Forgotten password
</Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-[#F5C518] hover:bg-[#E5B508] text-[#1a1a1a] font-semibold py-2.5 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-3"
              >
                {formik.isSubmitting ? "Checking..." : "Sign in"}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-[#666666] mt-4">
              Don't have an account{" "}
              <Link to="/signup" className="font-bold text-black">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - Background */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <SvgIcon style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;