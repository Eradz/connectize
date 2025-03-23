import { useFormik } from "formik";
import { useEffect } from "react";
import * as Yup from "yup";
import Form from "../../components/form";

import { useAuth } from "../../context/userContext";
import {
  ageKey,
  currentProfileIndexKey,
  first_nameKey,
  genderKey,
  last_nameKey,
  roleKey,
} from "../../lib/data";
import { customFormikFieldValidator } from "../../lib/utils";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import StepButton from "./StepButton";

const validationSchema = Yup.object().shape({
  first_name: Yup.string().trim().required("first name is required"),
  last_name: Yup.string().trim().required("last name is required"),
  role: Yup.string().trim().required("This field is required"),
  gender: Yup.string().trim().required("This field is required"),
  age: Yup.string()
    .required("Age is required, not less than 16 years")
    .test("compare-age", "You have to be at least 16 years", function (value) {
      const inputDate = new Date(value);

      const today = new Date();
      const seventeenYearsAgo = new Date();

      seventeenYearsAgo.setFullYear(today.getFullYear() - 16);

      today.setHours(0, 0, 0, 0);
      seventeenYearsAgo.setHours(0, 0, 0, 0);
      inputDate.setHours(0, 0, 0, 0);

      // Check that the date is not today, not 17 years ago, and not in the future
      return (
        inputDate.getTime() !== today.getTime() &&
        inputDate.getTime() !== seventeenYearsAgo.getTime() &&
        inputDate <= today &&
        inputDate < seventeenYearsAgo
      );
    }),
});

function Home() {
  const { user: currentUser } = useAuth();

  const initialValues = {
    first_name:
      currentUser?.first_name || localStorage.getItem(first_nameKey) || "",
    last_name:
      currentUser?.last_name || localStorage.getItem(last_nameKey) || "",
    gender: currentUser?.gender || localStorage.getItem(genderKey) || "",
    role: currentUser?.role || localStorage.getItem(roleKey) || "",
    age: currentUser?.date_of_birth || localStorage.getItem(ageKey) || "",
  };

  const formik = useFormik({
    initialValues,
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
    localStorage.setItem(currentProfileIndexKey, "1");
    return true;
  };

  useEffect(() => {
    formik.setValues(initialValues);
    document.title =
      "Complete your profile - personal information | Connectize";

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fields = [
    {
      type: "grid",
      gridInputs: [
        {
          name: first_nameKey,
          type: "text",
          label: "First Name",
          placeholder: "Enter your first name",
        },
        {
          name: last_nameKey,
          type: "text",
          label: "Last Name",
          placeholder: "Enter your last name",
        },

        {
          name: genderKey,
          type: "select",
          label: "Gender",
          placeholder: "Male/Female",
          options: ["Male", "Female"],
        },
        {
          name: roleKey,
          type: "text",
          label: "Role",
          placeholder: "What is your role as a representative",
        },
        {
          name: ageKey,
          type: "date",
          label: "Age",
          placeholder: "What is your role as a representative",
        },
      ],
    },
  ];

  return (
    <section className="">
      <div className="my-4">
        <HeadingText>Help us know more about you</HeadingText>
        <LightParagraph>Please fill in the details below</LightParagraph>
      </div>

      <Form
        formik={formik}
        status={"none"}
        inputArray={fields}
        hasButton={false}
      />
      <div className="flex justify-end my-6">
        <StepButton doStepChange={doStepChange} />
      </div>
    </section>
  );
}

export default Home;
