import { Button } from "@chakra-ui/react";
import { getCountries } from "@loophq/country-state-list";
import { UpdateIcon } from "@radix-ui/react-icons";
import { useFormik } from "formik";
import { FilePlus, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";
import {
  editCompanyInformation,
  getCompanyCategories,
  normalizeWebsite,
  uploadCompanyVerificationDocument,
} from "../../../api-services/companies";
import Form from "../../form";
import ProfileSection from "../../userProfile/profile-section";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const VERIFICATION_STATUS_LABELS = {
  verified: { label: "Verified", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  pending: { label: "Pending Review", className: "bg-gray-100 text-gray-800" },
};

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

export default function EditCompanyForm({ company }) {
  const countries = getCountries();

  const navigate = useNavigate();

  const initialValues = {
    company_name: company?.company_name || "",
    email: company?.email || "",
    about: company?.about || "",
    website: company?.website || "",
    office_address: company?.office_address || "",
    country: company?.country || "",
    state: company?.state || "",
    city: company?.city || "",
    tag_line: company?.tag_line || "",
    organization_type: company?.organization_type || "",
  };

  const validationSchema = Yup.object({
    company_name: Yup.string().optional(),
    email: Yup.string().email("Invalid email address").optional(),
    about: Yup.string().optional(),
    website: Yup.string()
      .transform((value) => {
        const trimmed = String(value || "").trim();
        if (!trimmed) return trimmed;
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      })
      .url("Invalid website URL")
      .optional(),
    office_address: Yup.string().optional(),
    country: Yup.string().optional(),
    state: Yup.string().optional(),
    city: Yup.string().optional(),
    tag_line: Yup.string().optional(),
    organization_type: Yup.string().optional(),
  });

  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const verificationFileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const verificationStatus = company?.verification_status || "pending";
  const statusInfo =
    VERIFICATION_STATUS_LABELS[verificationStatus] || VERIFICATION_STATUS_LABELS.pending;

  const handleUploadVerificationDocument = async (event) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || !company?.company_name) return;

    setUploadingDoc(true);
    const toastId = toast.loading("Uploading verification document");

    try {
      await uploadCompanyVerificationDocument(company.company_name, file);
      await queryClient.invalidateQueries({ queryKey: ["myCompanies"] });
      toast.success("Verification document uploaded — it's now pending review", {
        id: toastId,
      });
    } catch (err) {
      toast.error("Failed to upload verification document", { id: toastId });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const toastId = toast.loading("Updating company information");

    try {
      await editCompanyInformation({
        ...formik.values,
        website: normalizeWebsite(formik.values.website),
      });

      toast.success("Updated profile information Successfully", {
        id: toastId,
      });

      // if (update.id) {
      //   navigate(`/${update.company_name}`);
      // }
    } catch (err) {
      toast.error("Failed to update profile information", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

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

  const stateForCountry =
    countries.find((country) => country.name === formik.values["country"])
      ?.states || [];

  const companyFields = [
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
          name: "tag_line",
          type: "text",
          label: "Company's tagline",
          placeholder: "E.g best in production...",
        },
        {
          name: "email",
          type: "email",
          label: "Company's email",
          placeholder: "E.g me@yourcompany.com",
        },
        {
          name: "website",
          type: "url",
          label: "Company's website",
          placeholder: "E.g https://www.yourcompany.com",
        },
        {
          name: "office_address",
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
          name: "state",
          type: "select",
          label: "State",
          placeholder: "Select state",
          options: stateForCountry,
        },
        {
          name: "city",
          type: "text",
          label: "Region/City",
          placeholder: "E.g Houston",
        },
        {
          name: "organization_type",
          type: "select",
          label: "Company type",
          placeholder: "Select company type",
          options: companyTypeOptions,
        },

        {
          name: "about",
          type: "textarea",
          label: "Short description",
          placeholder: "write a short description of your company here...",
        },
      ],
    },
  ];

  useEffect(() => {
    formik.setValues(initialValues);
  }, [!!company]);

  return (
    <ProfileSection title="">
      <div className="mb-6 rounded-md border border-gray-100 bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-gray-900">Business Verification</p>
            <p className="text-sm text-gray-500">
              {verificationStatus === "verified"
                ? "Your company is verified."
                : "Upload your CAC certificate or equivalent registration proof for review."}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>

        {verificationStatus === "rejected" && company?.rejection_reason && (
          <p className="mt-3 text-sm text-red-600">
            <strong>Reason:</strong> {company.rejection_reason}
          </p>
        )}

        {verificationStatus !== "verified" && (
          <>
            <input
              ref={verificationFileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
              onChange={handleUploadVerificationDocument}
            />
            <button
              type="button"
              disabled={uploadingDoc}
              onClick={() => verificationFileInputRef.current?.click()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gold bg-gold/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-all duration-300 hover:bg-gold/20 disabled:opacity-60"
            >
              {company?.verification_document ? (
                <FileText className="size-5" />
              ) : (
                <FilePlus className="size-5" />
              )}
              <span>
                {uploadingDoc
                  ? "Uploading..."
                  : company?.verification_document
                    ? "Re-upload Verification Document"
                    : "Upload Verification Document"}
              </span>
            </button>
          </>
        )}
      </div>

      <Form
        formik={formik}
        status={"none"}
        inputArray={companyFields}
        hasButton={false}
      />

      <div className="flex justify-between mb-6 mt-20">
        <div></div>
        <Button
          className="!bg-gold hover:!bg-opacity-60"
          disabled={loading}
          onClick={handleSubmit}
          leftIcon={<UpdateIcon className={loading ? "animate-spin" : ""} />}
        >
          Update Information
        </Button>
      </div>
    </ProfileSection>
  );
}
