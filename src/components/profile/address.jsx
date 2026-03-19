import { createSEO } from "../SEO";

export const meta = () =>
  createSEO({
    title: "Update Address | Connectize",
    description: "Update your location and address details on your Connectize professional profile.",
  keywords: "update address, location, profile settings, Connectize",
  });

import React, { useEffect } from "react";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import {
  cityKey,
  company_addressKey,
  currentProfileIndexKey,
  nationalityKey,
  postal_codeKey,
  stateKey,
} from "../../lib/data";
import Form from "../form";
import { useFormik } from "formik";
import StepButton from "./StepButton";
import { customFormikFieldValidator } from "../../lib/utils";
import * as Yup from "yup";
import { getCountries } from "@loophq/country-state-list";
import useRedirect from "../../hooks/useRedirect";
import { useAuth } from "../../context/userContext";

const validationSchema = Yup.object().shape({
  nationality: Yup.string().trim().required("This field is required"),
  state: Yup.string().trim().required("This field is required"),
  city: Yup.string().optional(),
  postal_code: Yup.string().trim().required("This field is required"),
  company_address: Yup.string().trim().required("This field is required"),
});

function Address() {
  const countries = getCountries();
  const { user: currentUser } = useAuth();

  useRedirect(
    !(Number(localStorage.getItem(currentProfileIndexKey)) >= 2),
    "/contact"
  );

  const initialValues = {
    nationality:
      currentUser?.country || localStorage.getItem(nationalityKey) || "",
    state: currentUser?.region || localStorage.getItem(stateKey) || "",
    city: currentUser?.city || localStorage.getItem(cityKey) || "",
    postal_code: localStorage.getItem(postal_codeKey) || "123456",
    company_address:
      currentUser?.address || localStorage.getItem(company_addressKey) || "",
  };

  const formik = useFormik({
    validationSchema,
    initialValues,
  });

  const doStepChange = async () => {
    const isValidFields = await customFormikFieldValidator(formik);

    if (!isValidFields) return false;

    for (let value in formik.values) {
      const key = value;
      const keyValue = formik.values[value];

      localStorage.setItem(key, keyValue);
    }

    localStorage.setItem(currentProfileIndexKey, "3");

    return true;
  };

  const countriesString = countries.map((country) => country.name);

  const stateForCountry =
    countries.find((country) => country.name === formik.values["nationality"])
      ?.states || [];

  useEffect(() => {
    formik.setValues(initialValues);
    document.title = "Complete your profile - address information | connectize";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fields = [
    {
      type: "grid",
      gridInputs: [
        {
          name: nationalityKey,
          type: "select",
          label: "Nationality",
          placeholder: "Select country",
          options: countriesString,
        },
        {
          name: stateKey,
          type: "select",
          label: "State/City",
          placeholder: "Select state",
          options: stateForCountry,
        },
        // {
        //   name: cityKey,
        //   type: "text",
        //   label: "City/Town",
        //   placeholder: "FCT",
        // },
        {
          name: postal_codeKey,
          type: "text",
          label: "Postal Code",
          placeholder: "12345",
        },
        {
          name: company_addressKey,
          type: "text",
          label: "Company's Address",
          placeholder: "123, Royal Block, Esternbig, Abj",
        },
      ],
    },
  ];
  return (
    <section>
      <div className="my-4">
        <HeadingText>Tell us more about you</HeadingText>
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
          nextStep="contact"
          stepDirection="back"
          stepText="Back"
          doStepChange={doStepChange}
        />
        <StepButton doStepChange={doStepChange} nextStep="bio" />
      </div>
    </section>
  );
}

export default Address;
