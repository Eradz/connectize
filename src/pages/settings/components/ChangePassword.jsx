import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import Form from "../../../components/form";
import { authenticationService } from "../../../api-services/authentication";
import clsx from "clsx";
import { goToLogin } from "../../../lib/helpers";

const validationSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "New Passwords must match")
    .required("Confirm password is required"),
});

function ChangePasswordPage() {
  const formValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const [showForm, setShowForm] = useState(false);

  const formik = useFormik({
    initialValues: formValues,
    validationSchema: validationSchema,
    onSubmit: async ({ currentPassword, newPassword }, { resetForm }) => {
      const success = await authenticationService({
        values: { old_password: currentPassword, new_password: newPassword },
        url: "change-password",
        resetForm,
      });
      if (success) {
        setTimeout(() => goToLogin(), 3000);
      }
    },
  });

  useEffect(() => {
    formik.setValues(formValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fields = [
    {
      type: "grid",
      gridInputs: [
        {
          name: "currentPassword",
          type: "password",
          label: "Current Password",
          placeholder: "Enter your current password",
          validate: true,
        },
        {
          name: "newPassword",
          type: "password",
          label: "New Password",
          placeholder: "Enter a new password",
          validate: true,
        },
        {
          name: "confirmPassword",
          type: "password",
          label: "Confirm New Password",
          placeholder: "Confirm your new password",
          validate: true,
        },
      ],
    },
  ];

  return (
    <section className="mb-6">
      <h2
        className="text-lg font-medium cursor-pointer w-fit"
        onClick={() => setShowForm(!showForm)}
      >
        Change Password
      </h2>

      <section
        className={clsx("transition-all duration-300 overflow-hidden", {
          "h-full mt-4": showForm,
          "opacity-0 h-0": !showForm,
        })}
      >
        <Form
          formik={formik}
          status={"none"}
          inputArray={fields}
          button={{
            type: "submit",
            text: "Change password",
            submitText: "Changing password...",
            style: "!md:w-[60%] mt-4",
          }}
        />
      </section>
    </section>
  );
}

export default ChangePasswordPage;
