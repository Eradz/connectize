import { CloudUploadOutlined } from "@ant-design/icons";
import { Avatar, Button } from "@chakra-ui/react";
import { CameraIcon, ImageIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as yup from "yup";
import {
  uploadCompanyBanner,
  uploadCompanyLogo,
} from "../../api-services/companies";
import { avatarStyle } from "../ResponsiveNav";
import { ButtonWithTooltipIcon } from "../admin/feeds/DiscoverPosts";

const fileSchema = yup
  .mixed()
  .test(
    "fileSize",
    "File size must be less than 4MB",
    (file) => file && file.size <= 4 * 1024 * 1024
  )
  .test(
    "fileType",
    "Only image files are allowed",
    (file) =>
      file &&
      ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
        file.type
      )
  );

const schema = yup.object().shape({
  banner: fileSchema,
  logo: fileSchema,
});

const Header = ({ banner, name, logo }) => {
  const [newBanner, setNewBanner] = useState(banner);
  const [newLogo, setNewLogo] = useState(logo);

  const bannerFormik = useFormik({
    initialValues: { banner },
    validationSchema: yup.object().shape({ banner: fileSchema }),
    onSubmit: async (values) => {
      if (values.banner !== banner) {
        toast.promise(uploadCompanyBanner(name, values.banner), {
          loading: "Uploading banner...",
          success: "Banner uploaded successfully",
          error: "Failed to upload banner",
        });
      }
    },
  });

  const logoFormik = useFormik({
    initialValues: { logo },
    validationSchema: yup.object().shape({ logo: fileSchema }),
    onSubmit: async (values) => {
      if (values.logo !== logo) {
        toast.promise(uploadCompanyLogo(name, values.logo), {
          loading: "Uploading logo...",
          success: "Logo uploaded successfully",
          error: "Failed to upload logo",
        });
      }
    },
  });

  const handleFileChange = (event, field, formik) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue(field, file);

    if (!file) return;

    const fileSizeError = file.size > 4 * 1024 * 1024;
    const fileTypeError = ![
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ].includes(file.type);

    if (fileSizeError || fileTypeError) {
      const errorMessage = fileSizeError
        ? "File size must be less than 4MB"
        : "Only image files are allowed";
      toast.error(errorMessage);
      return;
    }

    if (field === "banner") {
      setNewBanner(URL.createObjectURL(file));
    } else if (field === "logo") {
      setNewLogo(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    setNewBanner(banner);
    setNewLogo(logo);
  }, [banner, logo]);

  return (
    <section className="relative bg-gold/30">
      <section className="w-full relative">
        {newBanner ? (
          <a
            href={newBanner}
            target="_blank"
            rel="noreferrer"
            className="w-full h-64 max-h-[45vh] aspect-auto object-cover block relative"
          >
            <img
              src={newBanner}
              alt={`${name?.trim()}'s banner`}
              className="size-full aspect-auto object-cover "
            />
          </a>
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-gold to-transparent from-70%" />
        )}

        <form onSubmit={bannerFormik.handleSubmit}>
          <input
            type="file"
            id="banner"
            accept="image/*"
            hidden
            onChange={(e) => handleFileChange(e, "banner", bannerFormik)}
          />
          <Button
            type="button"
            position="absolute"
            top="1"
            right="1"
            opacity={newBanner !== banner ? 1 : 0.75}
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
        src={newLogo}
        name={name}
        size="xl"
        className={clsx(
          avatarStyle,
          "!absolute !left-[7%] md:!left-[3%] !size-[90px] lg:!size-[120px]",
          {
            "!bottom-10": newBanner,
            "!-bottom-8": !newBanner,
          }
        )}
      >
        <form onSubmit={logoFormik.handleSubmit} className="relative">
          <input
            type="file"
            id="logo"
            accept="image/*"
            hidden
            onChange={(e) => handleFileChange(e, "logo", logoFormik)}
          />
          <ButtonWithTooltipIcon
            className="absolute !bg-gold !text-dark p-1 rounded-full"
            tip={newLogo ? "Change Image" : "Add Image"}
            onClick={() => document.getElementById("logo").click()}
            IconName={CameraIcon}
          />
          {newLogo !== logo && (
            <ButtonWithTooltipIcon
              type="submit"
              IconName={CloudUploadOutlined}
              className="absolute !bottom-1 !bg-dark !text-white p-1 rounded-full"
            />
          )}
        </form>
      </Avatar>
    </section>
  );
};

export default Header;
