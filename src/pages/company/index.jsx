import { getCountries } from "@loophq/country-state-list";
import { useFormik } from "formik";
import { useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Yup from "yup";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import SEO, { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Create Company | Connectize",
    description: "Set up your company profile on Connectize to connect with oil and gas professionals, post jobs, and showcase your services.",
  keywords: "create company, company profile, oil and gas company, register business, Connectize",
  });

import Form from "../../components/form";
import StepButton from "../../components/profile/StepButton";
import { FormikCtx } from "./context";
import { webRoutes } from "../../lib/webRoutes";
import { getCompanyCategories, getCompanySizes } from "../../api-services/companies";

// Fallback used only if the backend categories can't be loaded.
const FALLBACK_COMPANY_CATEGORIES = [
  "Drilling Contractor Company",
  "Integrated Oil & Gas Company",
  "Independent Oil & Gas Company",
  "Oil Service Company",
  "Oil Equipment Manufacturer",
  "Media Company",
  "Security",
  "Renewable Energy Company",
  "Oil Refining",
];

// Fallback used only if the backend sizes can't be loaded.
const FALLBACK_COMPANY_SIZES = [
  "0-10 employees",
  "11-50 employees",
  "50 and above employees",
];

export const validationSchema = Yup.object().shape({
  company_name: Yup.string().required("Company name cannot be empty"),
  company_tagline: Yup.string().required("Company tagline cannot be empty"),
  company_email: Yup.string().required("Company email cannot be empty"),
  company_address: Yup.string().required("Company address cannot be empty"),
  country: Yup.string().required("Country cannot be empty"),
  city: Yup.string().required("City cannot be empty"),
  company_website: Yup.string().optional(),
  company_category: Yup.string().required("Company category cannot be empty"),
  company_size: Yup.string().required("Company size cannot be empty"),
  company_description: Yup.string().optional(),
});

export function getIndexInitialValues() {
  return {
    company_name: localStorage.getItem("company_name") || "",
    company_tagline: localStorage.getItem("company_tagline") || "",
    company_email: localStorage.getItem("company_email") || "",
    company_website: localStorage.getItem("company_website") || "",
    company_address: localStorage.getItem("company_address") || "",
    country: localStorage.getItem("country") || "",
    city: localStorage.getItem("city") || "",
    company_category: localStorage.getItem("company_category") || "",
    company_size: localStorage.getItem("company_size") || "",
    company_description: localStorage.getItem("company_description") || "",
  };
}

const CreateCompany = () => {
  const countries = getCountries();

  const formiks = useContext(FormikCtx);

  const formik = formiks?.indexFormik;

  const countriesString = countries.map((country) => country.name);

  const { data: companyCategories } = useQuery({
    queryKey: ["company-categories"],
    queryFn: getCompanyCategories,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const companyTypeOptions =
    companyCategories && companyCategories.length > 0
      ? companyCategories
      : FALLBACK_COMPANY_CATEGORIES;

  const { data: companySizes } = useQuery({
    queryKey: ["company-sizes"],
    queryFn: getCompanySizes,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const companySizeOptions =
    companySizes && companySizes.length > 0
      ? companySizes
      : FALLBACK_COMPANY_SIZES;

  const stateForCountry =
    countries.find((country) => country.name === formik.values["country"])
      ?.states || [];

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
    // formik.setValues(getIndexInitialValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const listingFields = [
    {
      type: "grid",
      gridInputs: [
        {
          name: "company_name",
          type: "text",
          label: "Company's Name",
          placeholder: "E.g The Large Company",
        },
        {
          name: "company_tagline",
          type: "text",
          label: "Company's tagline",
          placeholder: "E.g best in production...",
        },
        {
          name: "company_email",
          type: "email",
          label: "Company's email",
          placeholder: "E.g me@yourcompany.com",
        },
        {
          name: "company_website",
          type: "url",
          label: "Company's website",
          placeholder: "E.g https://www.yourcompany.com",
        },
        {
          name: "company_address",
          type: "text",
          label: "Office Address",
          placeholder: "E.g 24 Larkin Smith, Eket Akwa Ibom State",
        },
        {
          name: "country",
          type: "select",
          label: "Country",
          placeholder: "Select country",
          options: countriesString,
        },
        {
          name: "city",
          type: "select",
          label: "Region/City",
          placeholder: "Select city",
          options: stateForCountry,
        },
        {
          name: "company_category",
          type: "select",
          label: "Company type",
          placeholder: "Select company type",
          options: companyTypeOptions,
        },
        {
          name: "company_size",
          type: "select",
          label: "Company's size",
          placeholder: "Select range",
          options: companySizeOptions,
        },
      ],
    },
    {
      name: "company_description",
      type: "textarea",
      label: "Short description",
      placeholder: "write a short description of your company here...",
    },
  ];
  return (
    <section className="space-y-8 w-full">
      <SEO
        title="Create a Company | Connectize"
        description="Create a company profile on Connectize, the leading social platform for the oil and gas industry. Showcase your business, connect with professionals, attract investors, and collaborate on industry projects. Build your network and grow your brand today!"
        relativeImagePath="company-profile.png"
      />
      <div>
        <HeadingText>Provide information about your company</HeadingText>
        <LightParagraph>Please fill in the details below</LightParagraph>
      </div>

      <Form
        formik={formik}
        status={"none"}
        inputArray={listingFields}
        hasButton={false}
      />
      <div className="flex justify-between my-6">
        <div></div>
        <StepButton
          doStepChange={doStepChange}
          nextStep={webRoutes.companyInformation}
          stepText="Next"
        />
      </div>
    </section>
  );
};

export default CreateCompany;
