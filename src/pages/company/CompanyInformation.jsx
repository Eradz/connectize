import React, { useContext, useEffect } from "react";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import Form from "../../components/form";
import { useFormik } from "formik";
import * as Yup from "yup";
import StepButton from "../../components/profile/StepButton";
import { FormikCtx } from "./context";

export const validationSchema = Yup.object().shape({
  company_registration_no: Yup.string().required("Field cannot be empty"),
  company_registration_date: Yup.string().required("Field cannot be empty"),
  company_annual_revenue: Yup.string().required("Field cannot be empty"),
});

export function getInitialValues() {
  return {
    company_registration_no:
      localStorage.getItem("company_registration_no") || "",
    company_registration_date:
      localStorage.getItem("company_registration_date") || "",
    company_annual_revenue:
      localStorage.getItem("company_annual_revenue") || "",
  };
}

const CompanyInformation = () => {
  const formiks = useContext(FormikCtx);

  const formik = formiks?.companyInfoFormik;

  const doStepChange = async () => {
    const errors = await formik.validateForm(formik.values);

    if (Object.keys(errors).length > 0) {
      Object.keys(formik.values).forEach((field) => {
        formik.setFieldTouched(field, true);
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    document.title = "Create Company | Connectize";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const listingFields = [
    {
      name: "company_registration_no",
      type: "text",
      label: "Company's registration No.",
      placeholder: "E.g VAT, TVN",
    },
    {
      name: "company_registration_date",
      type: "date",
      label: "Company's registration date",
      placeholder: "01/02/2003",
    },
    {
      name: "company_annual_revenue",
      type: "number",
      label: "Company's average annual revenue",
      placeholder: "Select range of average annual revenue",
    },
  ];
  return (
    <section className="space-y-8">
      <div className="w-full">
        <HeadingText>
          Provide legal information to show your company's credibility to do
          business
        </HeadingText>
        <LightParagraph>Please fill in the details below</LightParagraph>
      </div>

      <Form
        formik={formik}
        status={"none"}
        inputArray={listingFields}
        hasButton={false}
      />
      <div className="flex justify-between my-6">
        <StepButton
          doStepChange={doStepChange}
          stepDirection="back"
          nextStep="create-company"
          stepText="Back"
        />
        <StepButton
          doStepChange={doStepChange}
          nextStep="company-documents"
          stepText="Next"
        />
      </div>
    </section>
  );
};

export default CompanyInformation;
