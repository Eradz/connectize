import { createSEO } from "../SEO";

export const meta = () =>
  createSEO({
    title: "Update Contact Info | Connectize",
    description: "Manage your contact information on your Connectize professional profile.",
  keywords: "update contact, phone, email, profile settings, Connectize",
  });

import React, { useEffect } from "react";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import {
  currentProfileIndexKey,
  personal_emailKey,
  phone_numberKey,
} from "../../lib/data";
import Form from "../form";
import * as Yup from "yup";
import { useFormik } from "formik";
import StepButton from "./StepButton";
import { customFormikFieldValidator } from "../../lib/utils";
import useRedirect from "../../hooks/useRedirect";
import { useAuth } from "../../context/userContext";

const validationSchema = Yup.object().shape({
  phone_number: Yup.string()
    .required("This field is required")
    .test('is-valid-phone', 'Please enter a valid phone number', function(value) {
      if (!value) return false;
      // Remove all non-digit characters except +
      const cleaned = value.replace(/[^\d+]/g, '');
      // Must have at least 10 digits (US/Canada format) or start with + and have 10+ digits
      return cleaned.length >= 10;
    }),
  personal_email: Yup.string()
    .email("Invalid Email")
    .required("This field is required"),
});

function Contact() {
  const { user: currentUser } = useAuth();
  useRedirect(
    !(Number(localStorage.getItem(currentProfileIndexKey)) >= 1),
    "/update-profile"
  );
  const initialValues = {
    personal_email:
      currentUser?.email || localStorage.getItem(personal_emailKey) || "",
    phone_number:
      currentUser?.phone_number || localStorage.getItem(phone_numberKey) || "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const doStepChange = async () => {
    const isValidFields = await customFormikFieldValidator(formik);

    if (!isValidFields) return false;

    for (let value in formik.values) {
      const key = value;
      const keyValue = formik.values[value];

      localStorage.setItem(key, keyValue);
    }

    localStorage.setItem(currentProfileIndexKey, "2");
    return true;
  };

  useEffect(() => {
    formik.setValues(initialValues);
    document.title = "Complete your profile - Contact information | connectize";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fields = [
    {
      type: "grid",
      gridInputs: [
        {
          name: phone_numberKey,
          type: "tel",
          label: "Phone Number",
          placeholder: "+1 5551234567 or 5551234567",
        },
        {
          name: personal_emailKey,
          type: "email",
          label: "Alternative Email",
          placeholder: "example@company_name.com",
        },
      ],
    },
  ];
  return (
    <section>
      <div className="my-4">
        <HeadingText>Let us and other companies reach out to you</HeadingText>
        <LightParagraph className="text-black-50">
          Please fill in the details below
        </LightParagraph>
      </div>

      <Form
        formik={formik}
        status={"none"}
        inputArray={fields}
        hasButton={false}
      />

      <div className="flex justify-between my-6">
        <StepButton
          nextStep="/"
          // nextStep="home"
          stepDirection="back"
          stepText="Back"
          doStepChange={doStepChange}
        />
        <StepButton doStepChange={doStepChange} nextStep="address" />
      </div>
    </section>
  );
}

export default Contact;
