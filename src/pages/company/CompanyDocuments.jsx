import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Company Documents | Connectize",
    description: "Upload and manage your company verification documents on Connectize.",
  keywords: "company documents, verification, business documents, Connectize",
  });

import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";
import { createCompany } from "../../api-services/companies";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import Form from "../../components/form";
import { ImageSelect } from "../../components/form/customInput";
import StepButton from "../../components/profile/StepButton";
import SaveDraftButton from "../../components/profile/SaveDraftButton";
import { customFormikFieldValidator } from "../../lib/utils";
import { FormikCtx } from "./context";
import { webRoutes } from "../../lib/webRoutes";

const FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FORMATS = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".docx",
];

export const unSupportedText =
  "Unsupported file format, only .pdfs, msword, .docx and plain text are allowed";

export const largeFileText =
  "File size is too large, only images less than 10mb is allowed";

export function checkFileFormat(value) {
  if (!value) return true;

  return value && SUPPORTED_FORMATS.includes(value.type.toLowerCase());
}

export function checkFileSize(value) {
  if (!value) return true;
  return value && value.size <= FILE_SIZE;
}

export const validationSchema = Yup.object().shape({
  document_type: Yup.string().optional(),
  company_document: Yup.mixed()
    .optional()
    .test("file-size", largeFileText, checkFileSize)
    .test("file-format", unSupportedText, checkFileFormat),
});

export function getInitialValues() {
  return {
    // create company
    // company_name: localStorage.getItem("company_name") || "",
    // company_address: localStorage.getItem("company_address") || "",
    // country: localStorage.getItem("country") || "",
    // city: localStorage.getItem("city") || "",
    // company_category: localStorage.getItem("company_category") || "",
    // company_size: localStorage.getItem("company_size") || "",
    // company_description: localStorage.getItem("company_description") || "",
    // company_tagline: localStorage.getItem("company_tagline") || "",

    // company information
    // company_registration_no:
    //   localStorage.getItem("company_registration_no") || "",
    // company_registration_date:
    //   localStorage.getItem("company_registration_date") || "",
    // company_annual_revenue:
    // localStorage.getItem("company_annual_revenue") || "",

    // company documents
    document_type: localStorage.getItem("document_type") || "",
    company_document: "",
  };
}
const CompanyDocuments = () => {
  const [newCompanyName, setNewCompanyName] = useState("");
  const navigate = useNavigate();

  const formiks = useContext(FormikCtx);

  const formik = formiks?.companyDocFormik;

  const doStepChange = async () => {
    const isValidFields = await customFormikFieldValidator(formik);

    if (!isValidFields) return false;

    const toastId = toast.info(
      `Onboarding ${formiks.indexFormik.values.company_name} to the connectize platform`
    );

    const newCompany = await createCompany({
      ...formiks.indexFormik.values,
      ...formiks.companyInfoFormik.values,
      ...formik.values,
    });

    if (newCompany) {
      for (let key in formiks.indexFormik.values) localStorage.removeItem(key);
      for (let key in formiks.companyInfoFormik.values) localStorage.removeItem(key);
      for (let key in formik.values) localStorage.removeItem(key);
      toast.dismiss(toastId);
      navigate(`/${newCompany.slug || newCompany.company_name}`);
      return false; // Return false to prevent StepButton from overriding navigation
    }
    toast.dismiss(toastId);
    return false;
  };

  useEffect(() => {
    document.title = "Upload Documents | Connectize";
    // formik.setValues(initialValues);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const listingFields = [
    {
      name: "document_type",
      type: "select",
      label: "Document type",
      placeholder: "E.g VAT, TVN",
      options: ["TVN", "VAT"],
    },
  ];
  return (
    <section className="space-y-8 w-full">
      <div className="w-full">
        <HeadingText>Upload a VALID document of your company</HeadingText>
        <LightParagraph>Please fill in the details below</LightParagraph>
      </div>

      <Form
        formik={formik}
        status={"none"}
        inputArray={listingFields}
        hasButton={false}
      />

      <ImageSelect
        hasCaption={false}
        formik={formik}
        name="company_document"
        accept=".pdf, .doc, .docx, .txt, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <div className="flex justify-between my-6">
        <StepButton
          doStepChange={doStepChange}
          stepDirection="back"
          nextStep={webRoutes.companyInformation}
          stepText="Back"
        />
        <div className="flex items-center gap-3">
          <SaveDraftButton formik={formik} />
          <StepButton
            doStepChange={doStepChange}
            nextStep={newCompanyName || "/"}
            stepText="Submit"
          />
        </div>
      </div>
    </section>
  );
};

export default CompanyDocuments;
