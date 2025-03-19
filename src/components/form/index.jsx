import { Textarea } from "@chakra-ui/react";
import CustomInput, {
  CustomSelect,
  CustomTextArea,
  inputClassNames,
} from "./customInput";
import FormikErrorResponse from "./formError";
import clsx from "clsx";
import { ButtonWithTooltipIcon } from "../admin/feeds/DiscoverPosts";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

export default function Form({
  formik,
  inputArray,
  children,
  button,
  className,
  topCustomComponents,
  bottomCustomComponents,
  hasButton = true,
}) {
  const renderInput = ({
    name,
    type,
    label,
    placeholder,
    options,
    disabled,
    validate,
    helpText,
  }) => {
    return (
      <div className="w-full my-2.5" key={name}>
        <label htmlFor={name} className="font-medium flex gap-1 items-center">
          <span>{label}</span>
          {helpText && (
            <ButtonWithTooltipIcon
              // hasArrow
              tip={helpText}
              iconClassName="size-4 !text-gray-400 hover:!text-black"
              tooltipClassName="!p-3 !text-[.925rem]"
              IconName={QuestionMarkCircledIcon}
            />
          )}
        </label>
        {type === "textarea" ? (
          <Textarea
            autoComplete="true"
            name={name}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => {
              localStorage.setItem(name, e.currentTarget.value);
              formik.handleChange(e);
            }}
            onBlur={formik.handleBlur}
            value={formik.values[name]}
            className={clsx("!min-h-[150px] w-full", inputClassNames)}
          />
        ) : type === "textarea-md" ? (
          <CustomTextArea
            formik={formik}
            name={name}
            placeholder={placeholder}
          />
        ) : type === "select" ? (
          <CustomSelect
            formik={formik}
            name={name}
            placeholder={placeholder}
            options={options}
          />
        ) : (
          <CustomInput
            type={type}
            name={name}
            placeholder={placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values[`${name}`]}
            className={clsx({ "opacity-80 pointer-events-none": disabled })}
            validate={formik.touched[name] && validate}
            error={formik.touched[name] && formik.errors[name]}
          />
        )}
        <FormikErrorResponse
          formik={formik}
          name={name}
          validate={validate || false}
        />
      </div>
    );
  };

  const renderGridInputs = (gridInputs, disabled) =>
    gridInputs.map((input) => renderInput({ ...input, disabled }));

  const renderField = (field, index) => {
    const { type, gridInputs, disabled } = field;

    return (
      <div key={index} className="w-full">
        {type === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-3">
            {renderGridInputs(gridInputs, disabled)}
          </div>
        ) : (
          renderInput(field)
        )}
      </div>
    );
  };

  return (
    <form className={`${className} w-full`} onSubmit={formik.handleSubmit}>
      {topCustomComponents}

      {inputArray.map(renderField)}

      {bottomCustomComponents}

      {hasButton && button && (
        <div className="flex items-center mt-4">
          <button
            type={button.type || "submit"}
            className={clsx(
              "w-full max-w-[300px] mx-auto bg-black text-white rounded-full px-3 py-2.5 flex items-center justify-center transition-all duration-300",
              "hover:opacity-60 active:scale-90 disabled:cursor-not-allowed disabled:opacity-60",
              button.style
            )}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              button.submitText
            ) : (
              <>
                <span>{button.text}</span>
                {button.icon && <span className="ml-2">{button.icon}</span>}
              </>
            )}
          </button>
        </div>
      )}

      {children}
    </form>
  );
}
