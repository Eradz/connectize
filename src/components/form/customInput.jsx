import {
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { useState } from "react";
import ReactQuill from "react-quill";
import { ImageIcon } from "../../icon";
import FormikErrorResponse from "./formError";

import { motion } from "framer-motion";
import "react-quill/dist/quill.snow.css";
import { capitalizeFirst } from "../../lib/utils";
import { MarkdownComponent } from "../MarkDownComponent";

import clsx from "clsx";

export const inputClassNames =
  "relative mt-2 !w-full !bg-background py-2.5 px-3 rounded-md placeholder:text-sm !text-sm transition-all duration-300 !z-0";

export default function CustomInput({
  type,
  placeholder,
  onChange,
  onBlur,
  value,
  name,
  className,
  validate,
  error,
}) {
  const [isPassword, setIsPassword] = useState(true);
  const [passwordType, setPasswordType] = useState("password");

  const handlePasswordVisibility = () => {
    setIsPassword(!isPassword);
    setPasswordType(!isPassword ? "password" : "text");
  };
  return (
    <div className="relative w-full">
      <Input
        autoComplete="true"
        className={clsx(className, inputClassNames, "focus:!outline-none", {
          "!border-green-800 !bg-green-50/50": validate && !error,
          "!border-[#9e3818] !bg-[#9e3818]/5 animate-shake": error,
        })}
        type={type === "password" ? passwordType : type}
        placeholder={placeholder}
        onChange={(e) => {
          // localStorage.setItem(name, e.target.value);
          onChange(e);
        }}
        onBlur={onBlur}
        value={value}
        id={name}
        name={name}
      />
      {type === "password" && isPassword ? (
        <span
          className="absolute top-5 right-3 cursor-pointer text-xs"
          onClick={handlePasswordVisibility}
        >
          Show
        </span>
      ) : type === "password" && !isPassword ? (
        <span
          className="absolute top-5 right-3 cursor-pointer text-xs"
          onClick={handlePasswordVisibility}
        >
          Hide
        </span>
      ) : null}
    </div>
  );
}

export function ImageSelect({
  label,
  name,
  formik,
  hasCaption = true,
  captionName,
  accept = "image/*",
  multiple
}) {
  return (
    <div>
      <label
        className={clsx(
          "border !border-gray-100 h-[150px] rounded-md bg-background flex flex-col items-center gap-3 overflow-hidden p-1 cursor-pointer relative",
          {
            "!border-green-200 bg-green-50": formik.values[name],
          }
        )}
      >
        {label}
        <input
          className="w-full file:border-0 file:rounded-md text-gray-500 text-xs file:!text-xs file:p-2"
          type="file"
          accept={accept}
          name={ multiple ? `${name}[]` : name}
          onChange={(event) => {
            multiple ? formik.setFieldValue(name, Array.from(event.target.files)) : formik.setFieldValue(name, event.currentTarget.files?.[0]);
          }}
          onBlur={(event) => {
            multiple ? formik.setFieldValue(name, Array.from(event.target.files)) : formik.setFieldValue(name, event.currentTarget.files?.[0]);
          }}
          multiple = {multiple ? multiple : false}
        />
        <ImageIcon className="text-custom_grey/20" />
        {hasCaption && (
          <Input
            name={captionName}
            onChange={(event) => {
              localStorage.setItem(name, event.currentTarget.value);
              formik.setFieldValue(captionName, event.currentTarget.value);
            }}
            onBlur={(event) => {
              formik.setFieldValue(captionName, event.currentTarget.value);
            }}
            value={formik.values[`${captionName}`]}
            placeholder="Enter caption for image (optional)"
            className={`${inputClassNames} placeholder:text-xs placeholder:text-gray-400 !border-gray-200`}
          />
        )}
      </label>

      <FormikErrorResponse formik={formik} name={name} />
    </div>
  );
}

const defaultAvatarPath = "/images/passportOne.png";
export function AvatarUpload({ formik, name, label, className }) {
  const imageValue = formik.values[`${name}`];

  const handleFileChange = (e) => {
    formik.setFieldValue(name, e.currentTarget.files[0]);
  };

  function getImageToShow() {
    if (!imageValue) return defaultAvatarPath;

    if (typeof imageValue === "string") return imageValue;

    if (imageValue instanceof File) return URL.createObjectURL(imageValue);

    // if for some weird reason image is neither a string or an instance of file
    return defaultAvatarPath;
  }

  return (
    <div className={className}>
      <label>
        <img
          src={
            getImageToShow()
            // : "/images/passportTwo.png"
          }
          alt="upload"
          className={clsx("size-20 mx-auto transition-all duration-300", {
            "rounded-full p-0.5 bg-gold": imageValue !== "",
          })}
        />
        <input
          name={name}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          onInput={handleFileChange}
          onBlur={handleFileChange}
          className="hidden"
        />
        {label && (
          <small className="font-semibold !leading-none text-xs">{label}</small>
        )}
      </label>
      <FormikErrorResponse formik={formik} name={name} />
    </div>
  );
}

export const CustomTextArea = ({ formik, name, placeholder }) => {
  const selectedStyle = { color: "black", bg: "#F1C644", borderRadius: 6 };

  const getTextLength = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;

    const textLength = div.innerText.replaceAll(" ", "").length;
    return textLength;
  };

  const textLength = getTextLength(formik.values[`${name}`]);

  return (
    <>
      <Tabs>
        <TabList className="mt-1">
          <Tab className="text-xs" _selected={selectedStyle}>
            Editor
          </Tab>
          <Tab className="text-xs" _selected={selectedStyle}>
            Preview
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel className="!px-0">
            <ReactQuill
              value={formik.values[`${name}`]}
              onChange={(value) => {
                const cleanedValue = value === "<p><br></p>" ? "" : value;

                localStorage.setItem(name, cleanedValue);
                formik.setFieldValue(name, cleanedValue);
              }}
              theme="snow"
              placeholder={placeholder}
            />
            <div className="flex justify-end gap-0.5 mt-1 text-xs">
              <motion.small
                key={formik.values[`${name}`].trim()}
                initial={{ y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs"
              >
                {textLength === 0 ? "" : textLength}
              </motion.small>
              {textLength === 0
                ? ""
                : textLength > 1
                  ? "characters"
                  : "character"}
            </div>
          </TabPanel>
          <TabPanel className="mb-4 !px-0">
            <MarkdownComponent markdownContent={formik.values[`${name}`]} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export const CustomSelect = ({
  formik,
  name,
  placeholder,
  loadingText,
  isLoading,
  disabled,
  options = [""],
}) => (
  <Select
    id={name}
    name={name}
    placeholder={isLoading ? loadingText || "Loading..." : placeholder}
    disabled={disabled}
    onChange={(e) => {
      localStorage.setItem(name, e.currentTarget.value);
      formik.handleChange(e);
    }}
    onBlur={(e) => {
      localStorage.setItem(name, e.currentTarget.value);
      formik.handleChange(e);
    }}
    value={isLoading ? loadingText || "Loading..." : formik.values[`${name}`]}
    className="!w-full !bg-background px-3 !text-sm mt-2 border-gray-100"
  >
    {options?.map((option, index) => (
      <option key={index} value={option}>
        {capitalizeFirst(option.toLowerCase())}
      </option>
    ))}
  </Select>
);
