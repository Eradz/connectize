import { createSEO } from "../SEO";

export const meta = () =>
  createSEO({
    title: "Update Bio | Connectize",
    description: "Edit and update your professional bio and summary on Connectize.",
  keywords: "update bio, professional summary, profile, Connectize",
  });

import { useFormik } from "formik";
import { useEffect, useRef } from "react";
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
import { BUSINESS_NAME_WARNING, fetchBusinessNameMarkers, looksLikeBusinessName } from "../../lib/businessNameHeuristic";

const BUSINESS_BIO_WARNING = "This looks like a company name. Please enter your own name here — " +
  "you can create a company profile after completing your profile.";

  
  function Bio() {
  // Populated from GET /api/auth/business-name-markers/ so admin-added
   // markers apply to the live "looks like a company name" check without a
   // deploy. The Yup .test() closures below read this ref at validation
   // time, so updating it doesn't require rebuilding the schema.
   const extraMarkersRef = useRef([]);
 
   useEffect(() => {
     fetchBusinessNameMarkers().then((markers) => {
       extraMarkersRef.current = markers;
     });
   }, []);
 
 const validationSchema = Yup.object().shape({
   bio: Yup.string().trim().optional()
   .test("not-business-bio", BUSINESS_NAME_WARNING, (value) =>
   !looksLikeBusinessName(value, extraMarkersRef.current)
     ),
   website_url: Yup.string()
     .trim()
     .transform((value) => {
       // Transform happens first: auto-add https:// if no protocol is present
       if (!value) return value;
       if (!/^https?:\/\//i.test(value)) {
         return `https://${value}`;
       }
       return value;
     })
     .test('is-valid-url', 'Invalid url - please enter a valid website (e.g., example.com)', function(value) {
       if (!value || value.trim() === '') return true; // Allow empty (optional field)
       
       // At this point, value should have protocol from transform
       try {
         const url = new URL(value);
         // Check that it's at least a valid domain structure
         return url.hostname.includes('.');
       } catch {
         return false;
       }
     }),
   social_media_url: Yup.string().trim().optional(),
 });


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
          placeholder: "example.com or https://example.com",
        },
        {
          name: social_media_urlKey,
          type: "text",
          label: "Social media link",
          placeholder: "linkedin.com/in/yourname",
        },
      ],
    },
    {
      name: bioKey,
      type: "textarea",
      label: "Bio",
      placeholder: "Tell us about yourself...",
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
