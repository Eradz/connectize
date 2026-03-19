import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Verify Account | Connectize",
    description: "Verify your Connectize account to unlock all features and start connecting with energy industry professionals.",
  keywords: "verify account, email verification, Connectize account",
  });

import { useEffect } from "react";
import * as Yup from "yup";
import Form from "../../components/form";
import { useFormik } from "formik";
import { authenticationService } from "../../api-services/authentication";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  SUCCESS_TYPE_KEY,
  VERIFY_ACCOUNT_KEY,
} from "../../lib/data/authentication";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import PageLoading from "../../components/PageLoading";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid Email Address")
    .required("Fill in a valid email address"),
});

function VerifyAccount() {
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
        url: `resend_verification_email`,
        method: "POST",
        resetForm,
      });
    },
  });

  useEffect(() => {
    formik.setValues(formValues);
    document.title = "Account Verification | connectize";

    (async function checkForToken() {
      await verifyAccount();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyAccount = async () => {
    if (uid && token) {
      const success = await authenticationService({
        url: `verify-account/${uid}/${token}`,
        method: "GET",
      });

      if (success) {
        localStorage.setItem(SUCCESS_TYPE_KEY, VERIFY_ACCOUNT_KEY);
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
      placeholder: "Enter the inactive email address",
      validate: true,
    },
  ];

  return (
    <section className="space-y-4">
      <HeadingText>Account Verification</HeadingText>
      <LightParagraph className="text-custom_grey">
        Please enter your email address to receive an account verification
        email.
      </LightParagraph>
      <Form
        formik={formik}
        status={"none"}
        inputArray={fields}
        button={{
          type: "submit",
          text: "Send verification email",
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

export default VerifyAccount;
