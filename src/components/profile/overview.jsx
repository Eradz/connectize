import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
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

const FILE_SIZE = 2 * 1024 * 1024; // 2MB
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

function Overview() {
  const { user: currentUser } = useAuth();
  // Redirect if condition fails
  useRedirect(
    !(Number(localStorage.getItem(currentProfileIndexKey)) >= 4),
    "/bio"
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
      .optional()
      .test(
        "file-size",
        "File size is too large, only images less than 4mb are allowed",
        (value) => {
          if (!value) return true;

          return value && value.size <= FILE_SIZE;
        }
      )
      .test(
        "file-format",
        "Unsupported file format, only AVIFs, WEBPs, PNGs, JPEGs, and JPGs are allowed",
        (value) => {
          if (!value) return true;
          return value && SUPPORTED_FORMATS.includes(value.type);
        }
      ),
  });

  const formik = useFormik({
    initialValues: { ...overviewFormValues },
    validationSchema,
    enableReinitialize: true, // Ensures formik reinitializes when initialValues change
  });

  const loadLocalStorageData = () => {
    const updatedValues = { ...overviewFormValues };
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

    const response = await updateCurrentUserInfo(formik.values);

    if (response && response.id) {
      // setNewUserId(response?.id);
      Object.keys(formik.values).forEach((key) => localStorage.removeItem(key));
      toast.success("User profile has been updated successfully", {
        id: toastId,
      });
      return true;
    }

    toast.dismiss(toastId);
    setLoading(false);
    return false;
  };

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
