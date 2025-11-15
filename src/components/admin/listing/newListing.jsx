import React, { useEffect, useMemo, useState } from "react";
import HeadingText from "../../HeadingText";
import LightParagraph from "../../ParagraphText";
import Form from "../../form";
import * as Yup from "yup";
import { useFormik } from "formik";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Divider, Input } from "@chakra-ui/react";
import {
  createProduct,
  getOrCreateProductImages,
} from "../../../api-services/products";
import { ImageSelect, inputClassNames } from "../../form/customInput";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import axios from "axios";
import { Close } from "@mui/icons-material";
import { ArrowLeft, ImageIcon } from "../../../icon";
import { toast } from "sonner";

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
  // image_1: Yup.mixed()
  //   .required("Please select an image")
  //   .test("file-size", largeFileText, checkFileSize)
  //   .test("file-format", unSupportedText, checkFileFormat),
  // image_2: Yup.mixed()
  //   .optional()
  //   .test("file-size", largeFileText, checkFileSize)
  //   .test("file-format", unSupportedText, checkFileFormat),
  // image_3: Yup.mixed()
  //   .optional()
  //   .test("file-size", largeFileText, checkFileSize)
  //   .test("file-format", unSupportedText, checkFileFormat),
  // image_4: Yup.mixed()
  //   .optional()
  //   .test("file-size", largeFileText, checkFileSize)
  //   .test("file-format", unSupportedText, checkFileFormat),
  // image_caption1: Yup.string().optional(),
  // image_caption2: Yup.string().optional(),
  // image_caption3: Yup.string().optional(),
  // image_caption4: Yup.string().optional(),
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

export default function NewListing({ productToEdit }) {
  const editId = productToEdit?.id;

  const productImagesUpload = productToEdit
    ? productToEdit?.images?.map((image) => ({
        caption: image.caption || "",
        id: image.id,
        link: image.image,
        serverId: image.id,
      }))
    : [];
  const [images, setImages] = useState(productImagesUpload);

  const formValues = {
    // image_1: "",
    // image_2: "",
    // image_3: "",
    // image_4: "",
    // image_caption1: localStorage.getItem("image_caption1") || "",
    // image_caption2: localStorage.getItem("image_caption2") || "",
    // image_caption3: localStorage.getItem("image_caption3") || "",
    // image_caption4: localStorage.getItem("image_caption4") || "",
    product_title:
      productToEdit?.title || localStorage.getItem("product_title") || "",
    product_category:
      productToEdit?.category || localStorage.getItem("product_category") || "",
    description:
      productToEdit?.description || localStorage.getItem("description") || "",
    subtitle:
      productToEdit?.sub_title || localStorage.getItem("subtitle") || "",
  };

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: formValues,
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const newImages = [];
      for (const image of images) {
        if (!image.link) {
          toast.error("Some images failed to upload or are still uploading.");
          return;
        }

        newImages.push({ id: image.serverId, caption: image.caption });
        // image.push({ link: image.link, id:image.serverId, caption: image.caption });
      }

      const product = await createProduct(
        { ...values, images: newImages },
        resetForm,
        editId
      );
      if (product) {
        for (let value in values) {
          localStorage.removeItem(value);
        }

        navigate(editId ? `/products/${editId}` : `/market`, { replace: true });
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

  function addImage(file) {
    if (images.length >= 4 || !(file instanceof File)) return;

    const newId = `${file.name}-${Date.now()}-${file.size}`;
    setImages((p) => [
      ...p,
      { id: newId, link: "", file, caption: "", serverId: "" },
    ]);
  }

  function removeImage(index) {
    let newImages = images.filter((_, i) => i !== index);

    setImages(newImages);
  }

  function changeCaption(id, caption) {
    setImages((p) =>
      p.map((image) => {
        if (image.id !== id) return image;
        return { ...image, caption };
      })
    );
  }

  function saveLink(id, link, serverId) {
    setImages((p) =>
      p.map((image) => {
        if (image.id !== id) return image;
        return { ...image, link, serverId };
      })
    );
  }

  useEffect(() => {
    document.title = editId
      ? "Editing product | " + productToEdit?.title
      : "Create a new listing | Connectize";
    formik.setValues(formValues);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section className="bg-white p-4 mb-8 rounded-md w-full shrink-0">
      <div className="flex items-center mb-4">
        {editId && (
          <Link
            to={`/products/${editId}`}
            className="mr-2 flex items-center justify-center rounded-full size-8 bg-light_grey/50"
          >
            <ArrowLeft className={"size-6"} />
          </Link>
        )}
        <div className="">
          <HeadingText>
            {editId ? "Edit product" : "List new products"}
          </HeadingText>
          <LightParagraph>Upload at least 1 image</LightParagraph>
        </div>
      </div>
      <Divider className="my-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {images.map((image, index) => {
          return (
            <UploadedImage
              removeImage={() => {
                removeImage(index);
              }}
              saveLink={(link, serverId) => {
                saveLink(image.id, link, serverId);
              }}
              key={image.id}
              image={image}
              changeCaption={(c) => changeCaption(image.id, c)}
              index={index}
            />
          );
        })}
        {images.length < 4 && (
          <ImageUpload
            setFile={(f) => {
              addImage(f);
            }}
          />
        )}
      </div>
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
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
      </div> */}
      <Form
        formik={formik}
        status={"none"}
        inputArray={listingFields}
        button={{
          type: "submit",
          text: editId ? "Edit product | " : "List product  | ",
          icon: <ChevronRightIcon />,
          submitText: editId ? "Editing product..." : "Creating product...",
          style: "!w-fit mt-10 text-sm",
        }}
      />
    </section>
  );
}

function UploadedImage({ image, index, removeImage, saveLink, changeCaption }) {
  const [imageUrl, setImageUrl] = useState();

  const [progress, setProgress] = useState(0);
  // const [isUploaded, setIsUploaded] = useState(0)

  const [isUploading, setIsUploading] = useState(false);

  async function handleUploadToServer() {
    if (!image.file || !(image.file instanceof File)) return;

    setIsUploading(true);

    try {
      const res = await getOrCreateProductImages(image.file, {
        onUploadProgress: (e) => {
          setProgress(Math.floor(e.progress * 100));
        },
      });

      const link = res.image;
      const serverId = res.id;

      if (!link || !serverId) {
        toast.error("Could not complete product upload");
        return;
      }

      saveLink(link, serverId);
    } catch (error) {
      toast.error("An error occured while trying to upload product image");
      console.log(
        "An error occured while trying to upload product image ",
        error
      );
      removeImage(image.id);
    } finally {
      setIsUploading(false);
    }
  }

  useEffect(() => {
    if (isUploading) return;
    if (!image.file) {
      setImageUrl(image.link);

      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      setImageUrl(e.target.result);
      handleUploadToServer();
    };

    reader.readAsDataURL(image.file);
  }, [image.file]);

  return (
    <div className="aspect-video">
      <div className="size-full bg-background relative">
        <div
          className={clsx(
            "absolute right-4 bottom-4 bg-black bg-opacity-50 text-white rounded-full flex items-center h-8",
            {
              "px-2": isUploading,
              "w-8": !isUploading,
            }
          )}
        >
          {isUploading && (
            <span className="leading-none font-medium text-sm">
              {progress}%
            </span>
          )}
          <button
            className="size-8 flex items-center justify-center"
            onClick={removeImage}
          >
            <Close className="text-lg" fontSize="" />
          </button>
        </div>
        {imageUrl && (
          <img
            src={imageUrl}
            className="size-full object-cover bg-black"
            alt=""
          />
        )}
      </div>

      <Input
        value={image.caption}
        onChange={(e) => changeCaption(e.target.value)}
        placeholder="Enter caption for image (optional)"
        className={`${inputClassNames} placeholder:text-xs placeholder:text-gray-400 !border-gray-200`}
      />
    </div>
  );
}

function ImageUpload({ setFile }) {
  return (
    <div className="aspect-square">
      <label
        className={clsx(
          "border !border-gray-100 h-[150px] rounded-md bg-background flex flex-col items-center gap-3 overflow-hidden p-1 cursor-pointer relative justify-center"
        )}
      >
        <input
          className="w-full file:border-0 file:rounded-md text-gray-500 text-xs file:!text-xs file:p-2"
          type="file"
          hidden
          // accept={accept}
          onChange={(e) => {
            let file = e.target.files?.[0];

            if (!file) return;
            setFile(file);
            e.target.value = "";
          }}
        />
        <ImageIcon className="w-9 text-custom_grey/20" />
        <span>Add an image</span>
      </label>
    </div>
  );
}
