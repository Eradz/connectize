import { createSEO } from "../SEO";

export const meta = () =>
  createSEO({
    title: "Profile Overview | Connectize",
    description: "Review and complete your Connectize professional profile to stand out in the oil and gas industry.",
  keywords: "profile overview, professional summary, Connectize",
  });

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { updateCurrentUserInfo } from "../../api-services/users";
import { useAuth } from "../../context/userContext";
import useRedirect from "../../hooks/useRedirect";
import {
  bioKey,
  company_addressKey,
  currentProfileIndexKey,
  first_nameKey,
  last_nameKey,
  nationalityKey,
  postal_codeKey,
  roleKey,
  stateKey,
} from "../../lib/data";
import { overviewFields, overviewFormValues } from "../../lib/data/overview";
import { getLocalData } from "../../lib/helpers/overview";
import { customFormikFieldValidator } from "../../lib/utils";
import Form from "../form";
import { AvatarUpload } from "../form/customInput";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import StepButton from "./StepButton";
import { useOutletContext } from "react-router-dom";
import { webRoutes } from "../../lib/webRoutes";

const FILE_SIZE = 2 * 1024 * 1024; // 2MB
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

function Overview() {
  const { user: currentUser, forceFullySetUser } = useAuth();
  const queryClient = useQueryClient();

  /**
   * @type {{uploadedProfileImage: File | null, setUploadedProfileImage}} ctx
   */
  const ctx = useOutletContext();

  // Redirect if condition fails
  useRedirect(
    !(Number(localStorage.getItem(currentProfileIndexKey)) >= 4),
    webRoutes.profileWizardBio
  );

  useRedirect(!getLocalData(first_nameKey), `/co/${currentUser?.id}`);

  const [loading, setLoading] = useState(false);

  // Initialize full name dynamically from localStorage
  const getFullName = () =>
    `${getLocalData(first_nameKey) || ""} ${
      getLocalData(last_nameKey) || ""
    }`.trim();

  const validationSchema = Yup.object().shape({
    image: Yup.mixed()
      .nullable()
      .optional()
      .test(
        "file-size",
        "File size is too large, only images less than 4mb are allowed",
        (value) => {
          if (!value) return true;
          if (typeof value === "string") return true;

          return value && value.size <= FILE_SIZE;
        }
      )
      .test(
        "file-format",
        "Unsupported file format, only AVIFs, WEBPs, PNGs, JPEGs, and JPGs are allowed",
        (value) => {
          if (!value) return true;
          if (typeof value === "string") return true;
          return value && SUPPORTED_FORMATS.includes(value.type);
        }
      ),
  });

  const getDefaultImage = () =>
    ctx.uploadedProfileImage
      ? ctx.uploadedProfileImage
      : currentUser?.avatar || null;
  const formik = useFormik({
    initialValues: {
      ...overviewFormValues,
      image: getDefaultImage(),
    },

    validationSchema,
    enableReinitialize: true, // Ensures formik reinitializes when initialValues change
  });

  const loadLocalStorageData = () => {
    const updatedValues = {
      ...overviewFormValues,
      image: getDefaultImage(),
    };
    Object.keys(updatedValues).forEach((key) => {
      const storedValue = getLocalData(key);
      if (storedValue) {
        updatedValues[key] = storedValue;
      }
    });
    formik.setValues(updatedValues);
  };

  const doStepChange = async () => {
    const isValidFields = await customFormikFieldValidator(formik);

    if (!isValidFields) return false;

    const toastId = toast.loading("Updating your profile information");
    setLoading(true);

    try {
      const response = await updateCurrentUserInfo(formik.values);

      if (response && response.id) {
        forceFullySetUser(response);

        // Invalidate React Query cache so the profile page fetches fresh data
        queryClient.invalidateQueries({ queryKey: ["users", currentUser?.id] });
        queryClient.invalidateQueries({ queryKey: ["users", String(currentUser?.id)] });

        Object.keys(formik.values).forEach((key) => localStorage.removeItem(key));
        toast.success("User profile has been updated successfully", {
          id: toastId,
        });

        return true;
      }

      // PATCH returned null/undefined — API error (makeApiRequest already shows toast.error)
      toast.error("Failed to update profile. Please try again.", {
        id: toastId,
      });
    } catch (error) {
      console.error("[Overview] Profile update error:", error);
      toast.error("Something went wrong while updating your profile.", {
        id: toastId,
      });
    }

    setLoading(false);
    return false;
  };

  // i wish i did not have to use this method. Using a different method might cause too much code refactoring.
  // this useEffect just updates the uploadedProfileImage in the layout.jsx anytime the form.values.image changes

  useEffect(() => {
    ctx.setUploadedProfileImage(formik.values.image);
    console.log("Setting uploaded image profile");
  }, [formik.values.image]);

  useEffect(() => {
    loadLocalStorageData(); // Load data from local storage when the page is loaded
    document.title =
      "Complete profile - confirm profile information | Connectize";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <div className="mb-6">
        <HeadingText weight="semibold">Overview</HeadingText>
        <LightParagraph>
          Please confirm that your details are correct
        </LightParagraph>
      </div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <AvatarUpload
          formik={formik}
          name="image"
          label={formik.values.image ? "" : "Upload a profile image"}
          className="max-w-40"
        />
        <div className="capitalize">
          <h4>{getFullName() || "No name"}</h4>
          <p className="text-black/50">
            {`${getLocalData(stateKey) || "State"}, ${
              getLocalData(nationalityKey) || "Nationality"
            }`}
          </p>
          <small className="text-black/50">
            {`${getLocalData(company_addressKey) || "Address"}, ${
              getLocalData(postal_codeKey) || "Postal Code"
            }`}
          </small>
          <p>
            <strong>Role: </strong>
            <small className="text-black/50">
              {getLocalData(roleKey) || "N/A"}
            </small>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <LightParagraph>
          <strong className="text-black">Bio: </strong>
          {getLocalData(bioKey) || "No bio available"}
        </LightParagraph>

        <Form
          formik={formik}
          status="none"
          inputArray={overviewFields}
          hasButton={false}
        />
      </div>

      <div className="flex justify-between my-6">
        <StepButton nextStep="bio" stepDirection="back" stepText="Back" />
        <StepButton
          doStepChange={doStepChange}
          nextStep={`co/${currentUser?.id}`}
          disabled={loading}
          stepText={loading ? "Updating..." : "Submit"}
        />
      </div>
    </div>
  );
}

export default Overview;
