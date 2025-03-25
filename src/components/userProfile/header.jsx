import { CloudUploadOutlined } from "@ant-design/icons";
import { Avatar, Button } from "@chakra-ui/react";
import { ImageIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import * as yup from "yup";
import { uploadCompanyBanner } from "../../api-services/companies";
import { avatarStyle } from "../ResponsiveNav";

const schema = yup.object().shape({
  banner: yup
    .mixed()
    .test("fileSize", "File size must be less than 4MB", (file) => {
      return file && file.size <= 4 * 1024 * 1024;
    })
    .test("fileType", "Only image files are allowed", (file) => {
      return (
        file &&
        ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
          file.type
        )
      );
    }),
});

const Header = ({ banner, name, logo }) => {
  const [newBanner, setNewBanner] = useState(banner);
  const formik = useFormik({
    initialValues: { banner },
    validationSchema: schema,
    onSubmit: async (values) => {
      toast.promise(uploadCompanyBanner(name, values.banner), {
        loading: "Uploading banner...",
        success: "Banner uploaded successfully",
        error: "Failed to upload banner",
      });
    },
  });

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue("banner", file);

    if (!file) return;

    const fileSizeError = file.size > 4 * 1024 * 1024;
    const fileTypeError = !["image/jpeg", "image/png", "image/gif"].includes(
      file.type
    );

    if (fileSizeError || fileTypeError) {
      const errorMessage = fileSizeError
        ? "File size must be less than 4MB"
        : "Only image files are allowed";
      toast.error(errorMessage);
      return;
    }

    setNewBanner(URL.createObjectURL(file));
  };

  useState(() => {
    setNewBanner(banner);
  }, [banner]);
  return (
    <section className="relative bg-red-200">
      <section className="w-full relative">
        {newBanner ? (
          <a href={newBanner} target="_blank" rel="noreferrer">
            <img
              src={newBanner}
              alt={`${name?.trim()}'s banner`}
              className="w-full h-64 max-h-[45vh] aspect-auto object-cover"
            />
          </a>
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-gold to-transparent from-70%" />
        )}

        <form onSubmit={formik.handleSubmit}>
          <input
            type="file"
            id="banner"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
          <Button
            type="button"
            position="absolute"
            top="1"
            right="1"
            opacity={newBanner !== banner ? 1 : 0.5}
            height="8"
            _hover={{ opacity: 1 }}
            fontSize="xs"
            onClick={() => document.getElementById("banner").click()}
            leftIcon={<ImageIcon />}
          >
            {newBanner ? "Change banner" : "Add banner"}
          </Button>
          {newBanner !== banner && (
            <Button
              type="submit"
              position="absolute"
              top="10"
              right="1"
              height="8"
              _hover={{ opacity: 1 }}
              fontSize="xs"
              leftIcon={<CloudUploadOutlined />}
              className="!bg-gold"
            >
              Upload banner
            </Button>
          )}
        </form>
      </section>

      <Avatar
        src={logo}
        name={name}
        size="xl"
        className={clsx(
          avatarStyle,
          "!absolute !left-[7%] md:!left-[3%]  !size-[90px] lg:!size-[120px]",
          {
            "!bottom-10": newBanner,
            "!-bottom-8": !newBanner,
          }
        )}
      />
    </section>
  );
};

export default Header;
