import { useFormik } from "formik";
import { useEffect } from "react";
import * as Yup from "yup";
import { useAuth } from "../../context/userContext";
import useRedirect from "../../hooks/useRedirect";
import {
  bioKey,
  currentProfileIndexKey,
  social_media_urlKey,
  website_urlKey,
} from "../../lib/data";
import { customFormikFieldValidator } from "../../lib/utils";
import Form from "../form";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import StepButton from "./StepButton";

const validationSchema = Yup.object().shape({
  bio: Yup.string().trim().required("This field is required"),
  website_url: Yup.string()
    .trim()
    .url("Invalid url")
    .required("This field is required"),
  social_media_url: Yup.string().trim().optional(),
});

function Bio() {
  const { user: currentUser } = useAuth();
  useRedirect(
    !(Number(localStorage.getItem(currentProfileIndexKey)) >= 3),
    "/address"
  );
  const formValues = {
    bio: currentUser?.bio || localStorage.getItem(bioKey) || "",
    website_url: localStorage.getItem(website_urlKey) || "",
    social_media_url: localStorage.getItem(social_media_urlKey) || "",
  };

  const formik = useFormik({
    initialValues: formValues,
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

    localStorage.setItem(currentProfileIndexKey, "4");

    return true;
  };

  useEffect(() => {
    formik.setValues(formValues);
    document.title = "Complete your profile - Bio data | connectize";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fields = [
    {
      type: "grid",
      gridInputs: [
        {
          name: website_urlKey,
          type: "text",
          label: "Website link",
          placeholder: "westlandoil.com",
        },
        {
          name: social_media_urlKey,
          type: "text",
          label: "Social media link",
          placeholder: "e.g linkedin",
        },
      ],
    },
    {
      name: bioKey,
      type: "textarea",
      label: "Bio",
      placeholder: "say something",
    },
  ];
  return (
    <section>
      <div className="my-4">
        <HeadingText>Create your bio and add other information</HeadingText>
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
          nextStep="address"
          stepDirection="back"
          stepText="Back"
          doStepChange={doStepChange}
        />
        <StepButton
          doStepChange={doStepChange}
          nextStep="overview"
          stepText="Overview"
        />
      </div>
    </section>
  );
}

export default Bio;
