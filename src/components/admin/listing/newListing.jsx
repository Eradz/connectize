import React, { useEffect } from "react";
import HeadingText from "../../HeadingText";
import LightParagraph from "../../ParagraphText";
import Form from "../../form";
import * as Yup from "yup";
import { useFormik } from "formik";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Divider } from "@chakra-ui/react";
import { createProduct } from "../../../api-services/products";
import { ImageSelect } from "../../form/customInput";
import { useNavigate } from "react-router-dom";

const FILE_SIZE = 4 * 1024 * 1024; // 4MB
export const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/avif",
  "image/webp",
];

export const unSupportedText =
  "Unsupported file format, only avif, webP, PNGs, JPEGs and JPGs are allowed";

export const largeFileText =
  "File size is too large, only images less than 4mb is allowed";

export function checkFileFormat(value) {
  if (!value) return true;
  return value && SUPPORTED_FORMATS.includes(value.type.toLowerCase());
}

export function checkFileSize(value) {
  if (!value) return true;
  return value && value.size <= FILE_SIZE;
}

const validationSchema = Yup.object().shape({
  image_1: Yup.mixed()
    .required("Please select an image")
    .test("file-size", largeFileText, checkFileSize)
    .test("file-format", unSupportedText, checkFileFormat),
  image_2: Yup.mixed()
    .optional()
    .test("file-size", largeFileText, checkFileSize)
    .test("file-format", unSupportedText, checkFileFormat),
  image_3: Yup.mixed()
    .optional()
    .test("file-size", largeFileText, checkFileSize)
    .test("file-format", unSupportedText, checkFileFormat),
  image_4: Yup.mixed()
    .optional()
    .test("file-size", largeFileText, checkFileSize)
    .test("file-format", unSupportedText, checkFileFormat),
  image_caption1: Yup.string().optional(),
  image_caption2: Yup.string().optional(),
  image_caption3: Yup.string().optional(),
  image_caption4: Yup.string().optional(),
  product_title: Yup.string()
    .max(250, "Should not be more that 250 characters")
    .required("Field cannot be empty"),
  product_category: Yup.string().required("Field cannot be empty"),
  description: Yup.string()
    .max(1450, "Should not be more that 1450 characters")
    .required("Field cannot be empty"),
  subtitle: Yup.string()
    .max(450, "Should not be more that 450 characters")
    .required("Field cannot be empty"),
});

export default function NewListing() {
  const formValues = {
    image_1: "",
    image_2: "",
    image_3: "",
    image_4: "",
    image_caption1: localStorage.getItem("image_caption1") || "",
    image_caption2: localStorage.getItem("image_caption2") || "",
    image_caption3: localStorage.getItem("image_caption3") || "",
    image_caption4: localStorage.getItem("image_caption4") || "",
    product_title: localStorage.getItem("product_title") || "",
    product_category: localStorage.getItem("product_category") || "",
    description: localStorage.getItem("description") || "",
    subtitle: localStorage.getItem("subtitle") || "",
  };

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: formValues,
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const product = await createProduct(values, resetForm);
      if (product) {
        for (let value in values) {
          localStorage.removeItem(value);
        }

        navigate("/market", { replace: true });
      }
    },
  });

  const listingFields = [
    {
      type: "grid",
      gridInputs: [
        {
          name: "product_title",
          type: "text",
          label: "Product Title",
          placeholder: "Should not be more than 250 characters",
        },
        {
          name: "subtitle",
          type: "text",
          label: "Subtitle",
          placeholder: "Should not be more than 450 characters",
        },
        {
          name: "product_category",
          type: "select",
          label: "Choose Category",
          placeholder: "Product type",
          options: [
            "Drilling equipment",
            "Auxiliary equipment",
            "Mud cleaners",
            "Refinery",
            "Valves",
            "Gas analytics equipment",
            "Heat exchangers",
            "Centrifugal pump",
            "Separators",
            "Flow meters",
            "Fuel gas conditioning",
            "Pipe racks",
            "Pipelines",
            "Premix tanks",
            "Pressure Control equipment",
            "Oil and gas production equipment",
            "Rotating equipment",
            "Safety products",
            "Sand Pump",
            "Storage Equipment",
            "Towers",
            "Transportation Equipment",
            "Piping Equipment",
          ],
        },
        {
          name: "description",
          type: "textarea-md",
          label: "Description",
          placeholder: "Should not be more than 1450 characters",
        },
        // {
        //   name: "company",
        //   type: "select",
        //   label: "Select company",
        //   placeholder: "Select company to attach product to",
        //   options: companies?.map((company) => company?.company_name),
        // },
      ],
    },
  ];

  useEffect(() => {
    document.title = "Create a new listing | Connectize";
    formik.setValues(formValues);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section className="bg-white p-4 mb-8 rounded-md w-full shrink-0">
      <div className="mb-4">
        <HeadingText>List new products</HeadingText>
        <LightParagraph>Upload at least 1 image</LightParagraph>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <ImageSelect
          name="image_1"
          captionName="image_caption1"
          formik={formik}
        />
        <ImageSelect
          name="image_2"
          captionName="image_caption2"
          formik={formik}
        />
        <ImageSelect
          name="image_3"
          captionName="image_caption3"
          formik={formik}
        />
        <ImageSelect
          name="image_4"
          captionName="image_caption4"
          formik={formik}
        />
      </div>
      <Divider className="my-4" />
      <Form
        formik={formik}
        status={"none"}
        inputArray={listingFields}
        button={{
          type: "submit",
          text: "List product  | ",
          icon: <ChevronRightIcon />,
          submitText: "Creating product...",
          style: "!w-fit mt-10 text-sm",
        }}
      />
    </section>
  );
}
