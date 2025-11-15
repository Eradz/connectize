import { Link } from "react-router-dom";
import FormikErrorResponse from "../form/formError";

export default function CheckAgreement({ formik }) {
  return (
    <>
      <div className="flex items-center space-x-2 my-1">
        <input
          className="size-3.5 cursor-pointer checked:!bg-gold che "
          name="isChecked"
          type="checkbox"
          onChange={formik.handleChange}
        />
        <label
          className="!text-[0.89rem] text-gray-500 font-[400]"
          htmlFor="terms"
        >
          I agree to the{" "}
          <Link className="!text-black font-bold" to="/privacy-policy">
            Privacy Policy,
          </Link>{" "}
          <Link className="!text-black font-bold" to="/terms-and-conditions">
            Terms and Conditions
          </Link>
        </label>
      </div>
      <FormikErrorResponse formik={formik} name={"isChecked"} />
    </>
  );
}
