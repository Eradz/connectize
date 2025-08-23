/* eslint-disable react/react-in-jsx-scope */
import { useFormik } from "formik";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { loginUser } from "../../api-services/authentication";
import { getCurrentUser } from "../../api-services/users";
import Form from "../../components/form";
import HeadingText from "../../components/HeadingText";
import SEO from "../../components/SEO";
import { useAuth } from "../../context/userContext";
import LightParagraph from "../../components/ParagraphText";

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

  // Ensure we don't call setState during render
  useEffect(() => {
    setUser(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextParamRaw = searchParams.get("next");
  const isAuthPath = (p) => [
    "/login",
    "/signup",
    "/reset-password",
    "/confirm-reset-password",
    "/verify-account",
    "/reactivate-account",
  ].some((ap) => (p || "").startsWith(ap));
  const nextParam = nextParamRaw && !isAuthPath(nextParamRaw) ? nextParamRaw : "/";

  const navigateTo =
    user && user?.is_first_time_user
      ? "/profile"
      : nextParam || "/";

  const formValues = {
    username: "",
    email: "",
    password: "",
  };

  const formik = useFormik({
    initialValues: formValues,
    validationSchema: validationSchema,
    onSubmit: async ({ email, password }, { resetForm }) => {
      console.log('📝 Login form submitted:', { email });
      
      const success = await loginUser({ email, password, resetForm });
      console.log('🔐 Login result:', { success });

      if (success) {
        console.log('✅ Login successful, fetching current user...');
        const currentUser = await getCurrentUser();
        console.log('👤 Setting user:', { hasUser: !!currentUser, userId: currentUser?.id });
        setUser(currentUser);
      } else {
        console.log('❌ Login failed');
      }
    },
  });

  // Navigate after render when user becomes available
  useEffect(() => {
    console.log('🚀 Navigation effect triggered:', { hasUser: !!user, userId: user?.id, navigateTo });
    
    if (user) {
      console.log('🚀 Navigating to:', navigateTo);
      navigate(navigateTo, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    formik.setValues(formValues);

    // return async () => setUser((await getCurrentUser()) || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fields = [
    {
      name: "email",
      type: "email",
      label: "Company email",
      placeholder: "Enter a valid email address",
      validate: true,
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      placeholder: "Enter a 8 digit password",
      validate: true,
    },
  ];

  return (
    <section className="space-y-4">
      <SEO
        title="Login to connectize"
        description="Connect, Collaborate and Thrive with Connectize"
      />
      <HeadingText>Login to your account</HeadingText>

      <Form
        formik={formik}
        status={"none"}
        bottomCustomComponents={
          <div className="flex justify-between gap-4 text-sm">
            <span>Forgot Password?</span>
            <Link
              to="/reset-password"
              className="font-bold text-black no-underline"
            >
              Retrieve it
            </Link>
          </div>
        }
        inputArray={fields}
        button={{
          type: "submit",
          text: "Login",
          submitText: "Checking...",
          style: "!md:w-[60%] mt-4",
        }}
      />

      <p className="text-center xs:text-sm">
        {"Don't have an account? "}
        <Link to="/signup" className="text-black font-bold no-underline">
          Sign Up
        </Link>
      </p>
    </section>
  );
}

export default Login;
