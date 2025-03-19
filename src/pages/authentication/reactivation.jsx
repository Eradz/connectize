import { useEffect } from "react";
import * as Yup from "yup";
import Form from "../../components/form";
import { useFormik } from "formik";
import { authenticationService } from "../../api-services/authentication";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  SUCCESS_TYPE_KEY,
  REACTIVATE_ACCOUNT_KEY,
} from "../../lib/data/authentication";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import PageLoading from "../../components/PageLoading";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid Email Address")
    .required("Fill in a valid email address"),
});

function ReactivateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formValues = { email: "" };

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const formik = useFormik({
    initialValues: formValues,
    validationSchema: validationSchema,
    onSubmit: async ({ email }, { resetForm }) => {
      await authenticationService({
        values: { email },
        url: "request-account-reactivation",
        method: "POST",
        resetForm,
      });
    },
  });

  useEffect(() => {
    formik.setValues(formValues);
    document.title = "Account Reactivation | Connectize";

    (async function checkForToken() {
      await reactivateAccount();
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reactivateAccount = async () => {
    if (uid && token) {
      const success = await authenticationService({
        url: `reactivate-account/${uid}/${token}`,
        method: "POST",
      });

      if (success) {
        localStorage.setItem(SUCCESS_TYPE_KEY, REACTIVATE_ACCOUNT_KEY);
        navigate("/success");
      }

      return <PageLoading />;
    }
  };

  const fields = [
    {
      name: "email",
      type: "email",
      label: "Email Address",
      placeholder: "Enter the deactivated account email address",
      validate: true,
    },
  ];

  return (
    <section className="space-y-4">
      <HeadingText>Account Reactivation</HeadingText>
      <LightParagraph>
        Please enter your email address to receive an account reactivation
        email.
      </LightParagraph>
      <Form
        formik={formik}
        status={"none"}
        inputArray={fields}
        button={{
          type: "submit",
          text: "Send reactivation email",
          submitText: "Checking email...",
          style: "!md:w-[60%] mt-4",
        }}
      />

      <p className="text-center xs:text-sm">
        Don't have an account?{" "}
        <Link to="/signup" className="font-bold text-black">
          Sign Up
        </Link>
      </p>
    </section>
  );
}

export default ReactivateAccount;
