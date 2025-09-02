import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import * as Yup from "yup";
import { authenticationService } from "../../api-services/authentication";
import Form from "../../components/form";
import HeadingText from "../../components/HeadingText";
import PageLoading from "../../components/PageLoading";
import LightParagraph from "../../components/ParagraphText";
import SEO, { createSEO } from "../../components/SEO";
import {
  REACTIVATE_ACCOUNT_KEY,
  SUCCESS_TYPE_KEY,
} from "../../lib/data/authentication";

export const meta = () =>
  createSEO({
    title: "Account Reactivation | Connectize",
  });

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid Email Address")
    .required("Fill in a valid email address"),
});

function ReactivateAccount() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const emailInRequest = searchParams.get("email") || "";

  const formValues = { email: emailInRequest };

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

    (async () => {
      if (!uid && !token) return;

      const success = await authenticationService({
        url: `reactivate-account/${uid}/${token}`,
        method: "POST",
      });

      if (success) {
        localStorage.setItem(SUCCESS_TYPE_KEY, REACTIVATE_ACCOUNT_KEY);
        navigate("/success");
      }
    })();
  }, [uid, token]);

  if (loading) <PageLoading />;

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
      {/* <SEO title="Account Reactivation | Connectize" /> */}
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
