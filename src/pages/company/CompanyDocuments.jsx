import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Company Documents | Connectize",
    description: "Upload and manage your company verification documents on Connectize.",
  keywords: "company documents, verification, business documents, Connectize",
  });

import { useQuery } from "@tanstack/react-query";
import { FilePlus, FileText, Loader2, Trash2 } from "lucide-react";
import { useContext, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";
import {
  createCompany,
  getCompanyDocumentTypes,
} from "../../api-services/companies";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
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
  "image/jpeg",
  "image/png",
  "image/webp",
];
const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];
const CUSTOM_DOCUMENT_TYPE = "__custom_document_type__";
const CUSTOM_DOCUMENT_TYPE_LABEL = "Custom document type";
const FALLBACK_DOCUMENT_TYPES = ["TVN", "VAT"];

export const unSupportedText =
  "Unsupported file format. Upload PDF, Word, text, or image files";

export const largeFileText =
  "File size is too large, only documents less than 10mb are allowed";

export function checkFileFormat(value) {
  if (!value) return true;

  const fileType = String(value.type || "").toLowerCase();
  const fileName = String(value.name || "").toLowerCase();

  return (
    SUPPORTED_FORMATS.includes(fileType) ||
    SUPPORTED_EXTENSIONS.some((extension) => fileName.endsWith(extension))
  );
}

export function checkFileSize(value) {
  if (!value) return true;
  return value && value.size <= FILE_SIZE;
}

export const validationSchema = Yup.object().shape({
  verification_document: Yup.mixed()
    .nullable()
    .test("file-size", largeFileText, checkFileSize)
    .test("file-format", unSupportedText, checkFileFormat),
  company_documents: Yup.array().of(
    Yup.object().shape({
      file: Yup.mixed()
        .required("Select a document file")
        .test("file-size", largeFileText, checkFileSize)
        .test("file-format", unSupportedText, checkFileFormat),
      documentType: Yup.string().required("Select a document type"),
      customDocumentType: Yup.string().test(
        "custom-document-type-required",
        "Enter document type",
        function (value) {
          return (
            this.parent.documentType !== CUSTOM_DOCUMENT_TYPE ||
            Boolean(value?.trim())
          );
        }
      ),
    })
  ),
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
    company_documents: [],
    verification_document: null,
  };
}

const formatFileSize = (size) => {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.max(size / 1024, 1).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getDocumentTypeLabel = (document) => {
  if (document.documentType === CUSTOM_DOCUMENT_TYPE) {
    return document.customDocumentType?.trim() || CUSTOM_DOCUMENT_TYPE_LABEL;
  }

  return document.documentType || "Select document type";
};

const getDocumentTypeForUpload = (document) => {
  if (document.documentType === CUSTOM_DOCUMENT_TYPE) {
    return document.customDocumentType.trim();
  }

  return document.documentType.trim();
};

const getCompanyRouteSegment = (company, fallbackName) => {
  return String(
    company?.route_slug ||
      company?.slug ||
      company?.company_name ||
      fallbackName ||
      ""
  ).trim();
};

const CompanyDocuments = () => {
  const fileInputRef = useRef(null);
  const verificationFileInputRef = useRef(null);
  const navigate = useNavigate();

  const formiks = useContext(FormikCtx);

  const formik = formiks?.companyDocFormik;

  const { data: documentTypes = [], isLoading: isLoadingDocumentTypes } =
    useQuery({
      queryKey: ["company-document-types"],
      queryFn: getCompanyDocumentTypes,
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

  const documentTypeOptions = useMemo(() => {
    const baseOptions = documentTypes.length > 0
      ? documentTypes
      : FALLBACK_DOCUMENT_TYPES;

    return [...new Set([...baseOptions, CUSTOM_DOCUMENT_TYPE])];
  }, [documentTypes]);

  const defaultDocumentType = documentTypeOptions.find(
    (option) => option !== CUSTOM_DOCUMENT_TYPE
  ) || CUSTOM_DOCUMENT_TYPE;

  const companyDocuments = formik?.values?.company_documents || [];
  const verificationDocument = formik?.values?.verification_document || null;
  const verificationDocumentError = formik?.touched?.verification_document
    ? formik?.errors?.verification_document
    : "";

  const handleSelectVerificationDocument = (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    formik.setFieldValue("verification_document", file);
    formik.setFieldTouched("verification_document", true, false);
    event.currentTarget.value = "";
  };

  const removeVerificationDocument = () => {
    formik.setFieldValue("verification_document", null);
    formik.setFieldTouched("verification_document", true, false);
  };

  const handleSelectDocuments = (event) => {
    const selectedFiles = Array.from(event.currentTarget.files || []);
    if (!selectedFiles.length) return;

    const newDocuments = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file,
      documentType: defaultDocumentType,
      customDocumentType: "",
    }));

    formik.setFieldValue("company_documents", [
      ...companyDocuments,
      ...newDocuments,
    ]);
    formik.setFieldTouched("company_documents", true, false);
    event.currentTarget.value = "";
  };

  const updateCompanyDocument = (documentId, updates) => {
    formik.setFieldValue(
      "company_documents",
      companyDocuments.map((document) =>
        document.id === documentId ? { ...document, ...updates } : document
      )
    );
    formik.setFieldTouched("company_documents", true, false);
  };

  const removeCompanyDocument = (documentId) => {
    formik.setFieldValue(
      "company_documents",
      companyDocuments.filter((document) => document.id !== documentId)
    );
    formik.setFieldTouched("company_documents", true, false);
  };

  const getDocumentError = (index, field) => {
    const errors = formik?.errors?.company_documents;
    const touched = formik?.touched?.company_documents;

    if (!touched || !Array.isArray(errors)) return "";
    return errors[index]?.[field] || "";
  };

  const doStepChange = async () => {
    const isValidFields = await customFormikFieldValidator(formik);

    if (!isValidFields) return false;

    const toastId = toast.info(
      `Onboarding ${formiks.indexFormik.values.company_name} to the connectize platform`
    );
    const submittedCompanyName = formiks.indexFormik.values.company_name;

    const companyDocumentsForUpload = companyDocuments.map((document) => ({
      type: getDocumentTypeForUpload(document),
      document: document.file,
    }));

    const newCompany = await createCompany({
      ...formiks.indexFormik.values,
      ...formiks.companyInfoFormik.values,
      ...formik.values,
      company_documents: companyDocumentsForUpload,
      verification_document: formik.values.verification_document,
    });

    if (newCompany) {
      const companyRouteSegment = getCompanyRouteSegment(
        newCompany,
        submittedCompanyName
      );
      for (let key in formiks.indexFormik.values) localStorage.removeItem(key);
      for (let key in formiks.companyInfoFormik.values) localStorage.removeItem(key);
      for (let key in formik.values) localStorage.removeItem(key);
      toast.dismiss(toastId);
      navigate(companyRouteSegment ? `/${encodeURIComponent(companyRouteSegment)}` : "/");
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

  return (
    <section className="space-y-8 w-full">
      <div className="w-full">
        <HeadingText>Upload a VALID document of your company</HeadingText>
        <LightParagraph>Please fill in the details below</LightParagraph>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border border-gray-100 bg-background p-4">
          <p className="text-base font-semibold text-gray-900">Business Verification Document</p>
          <p className="text-sm text-gray-500">
            Upload your CAC certificate or equivalent business registration proof. This isn't required
            to create your company, but it's reviewed by our team to grant your verified badge — you can
            also upload it later from your company settings.
          </p>

          <input
            ref={verificationFileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
            onChange={handleSelectVerificationDocument}
          />

          {verificationDocument ? (
            <div className="mt-4 flex items-start gap-3 rounded-md border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-gold/15 text-gold">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {verificationDocument.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(verificationDocument.size)}</p>
              </div>
              <button
                type="button"
                onClick={removeVerificationDocument}
                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-red-100 text-red-500 transition-all duration-300 hover:bg-red-50"
                aria-label="Remove verification document"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => verificationFileInputRef.current?.click()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gold bg-gold/10 px-4 py-4 text-sm font-semibold text-gray-900 transition-all duration-300 hover:bg-gold/20"
            >
              <FilePlus className="size-5" />
              <span>Upload Verification Document</span>
            </button>
          )}

          {verificationDocumentError && (
            <p className="mt-2 text-xs text-red-500">{verificationDocumentError}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-gray-100 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-gray-900">Company Documents</p>
            <p className="text-sm text-gray-500">Registration, tax, licenses, certifications</p>
          </div>

          {isLoadingDocumentTypes && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="size-4 animate-spin" />
              <span>Loading types</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/jpeg,image/png,image/webp"
          onChange={handleSelectDocuments}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gold bg-gold/10 px-4 py-4 text-sm font-semibold text-gray-900 transition-all duration-300 hover:bg-gold/20"
        >
          <FilePlus className="size-5" />
          <span>Add Documents</span>
        </button>

        {companyDocuments.length > 0 && (
          <div className="space-y-3">
            {companyDocuments.map((document, index) => {
              const fileError = getDocumentError(index, "file");
              const typeError = getDocumentError(index, "documentType");
              const customTypeError = getDocumentError(index, "customDocumentType");

              return (
                <div
                  key={document.id}
                  className="rounded-md border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-gold/15 text-gold">
                      <FileText className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {document.file?.name || "Selected document"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(document.file?.size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCompanyDocument(document.id)}
                      className="flex size-9 shrink-0 items-center justify-center rounded-md border border-red-100 text-red-500 transition-all duration-300 hover:bg-red-50"
                      aria-label="Remove document"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <select
                      value={document.documentType}
                      onChange={(event) =>
                        updateCompanyDocument(document.id, {
                          documentType: event.currentTarget.value,
                        })
                      }
                      className="w-full rounded-md border border-gray-100 bg-background px-3 py-3 text-sm text-gray-900 outline-none transition-all duration-300 focus:border-gold"
                    >
                      {documentTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option === CUSTOM_DOCUMENT_TYPE
                            ? CUSTOM_DOCUMENT_TYPE_LABEL
                            : option}
                        </option>
                      ))}
                    </select>
                    {typeError && <p className="text-xs text-red-500">{typeError}</p>}

                    {document.documentType === CUSTOM_DOCUMENT_TYPE && (
                      <div>
                        <input
                          type="text"
                          value={document.customDocumentType}
                          onChange={(event) =>
                            updateCompanyDocument(document.id, {
                              customDocumentType: event.currentTarget.value,
                            })
                          }
                          placeholder="Enter document type"
                          className="w-full rounded-md border border-gray-100 bg-background px-3 py-3 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-gold"
                        />
                        {customTypeError && (
                          <p className="mt-2 text-xs text-red-500">{customTypeError}</p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      {getDocumentTypeLabel(document)}
                    </p>

                    {fileError && <p className="text-xs text-red-500">{fileError}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
            nextStep="/"
            stepText="Submit"
          />
        </div>
      </div>
    </section>
  );
};

export default CompanyDocuments;
