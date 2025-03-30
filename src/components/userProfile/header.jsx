import { CloudUploadOutlined } from "@ant-design/icons";
import { Avatar, Button } from "@chakra-ui/react";
import { CameraIcon, ImageIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import * as yup from "yup";
import {
  uploadCompanyBanner,
  uploadCompanyLogo,
} from "../../api-services/companies";
import { uploadDisplayPicture } from "../../api-services/users";
import { useAuth } from "../../context/userContext";
import { useGetCurrentCompany } from "../../hooks";
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

const Header = ({ banner, name, logo, type = "company" }) => {
  const [newBanner, setNewBanner] = useState(banner);
  const [newLogo, setNewLogo] = useState(logo);
  const { user: currentUser } = useAuth();
  const { data: currentCompany } = useGetCurrentCompany();
  const params = useParams();
  const paramsId = params.userId || 0;
  const paramsCompany = params.company;

  const isCompanyHeader = type.toLowerCase() === "company";

  const isCurrentUserById = Number(currentUser?.id) === Number(paramsId);
  const isCurrentUserByCompany =
    currentCompany?.[0]?.company_name?.toLowerCase() ===
    paramsCompany?.toLowerCase();

  const isCurrentUser = isCurrentUserByCompany || isCurrentUserById;

  const bannerFormik = useFormik({
    initialValues: { banner },
    validationSchema: yup.object().shape({ banner: fileSchema }),
    onSubmit: async (values) => {
      if (values.banner !== banner) {
        toast.promise(uploadCompanyBanner(values.banner), {
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
        toast.promise(
          isCompanyHeader
            ? uploadCompanyLogo(values.logo)
            : uploadDisplayPicture(values.logo),
          {
            loading: `Uploading ${
              isCompanyHeader ? "logo" : "display image"
            }...`,
            success:
              (isCompanyHeader ? "Logo" : "Display image") +
              " uploaded successfully",
            error: "Failed to upload logo",
          }
        );
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
    <section className="relative bg-gradient-to-r from-gold to-transparent from-70%">
      <section className="w-full relative">
        {newBanner ? (
          <a
            href={newBanner}
            target="_blank"
            rel="noreferrer"
            className="w-full h-64 max-h-[45vh] block relative"
          >
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{
                backgroundImage: `url(${newBanner})`,
              }}
            />
            <div className="absolute inset-0 bg-dark opacity-60 hover:opacity-0 transition-all duration-500" />
          </a>
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-gold to-transparent from-70%" />
        )}

        {isCurrentUser && (
          <form onSubmit={bannerFormik.handleSubmit}>
            <input
              type="file"
              id="banner"
              accept="image/*"
              hidden
              onChange={(e) => handleFileChange(e, "banner", bannerFormik)}
            />
            {isCompanyHeader && (
              <Button
                type="button"
                position="absolute"
                top="1"
                right="1"
                opacity={newBanner !== banner ? 1 : 0.75}
                height="8"
                _hover={{ opacity: 1 }}
                disabled={bannerFormik.isSubmitting}
                fontSize="xs"
                onClick={() => document.getElementById("banner").click()}
                leftIcon={<ImageIcon />}
              >
                {newBanner ? "Change banner" : "Add banner"}
              </Button>
            )}
            {newBanner !== banner && (
              <Button
                type="submit"
                position="absolute"
                top="10"
                right="1"
                height="8"
                disabled={bannerFormik.isSubmitting}
                _hover={{ opacity: 1 }}
                fontSize="xs"
                leftIcon={<CloudUploadOutlined />}
                className="!bg-gold"
              >
                Upload banner
              </Button>
            )}
          </form>
        )}
      </section>

      <Avatar
        src={newLogo}
        name={name}
        size="xl"
        className={clsx(
          avatarStyle,
          "!absolute !left-[7%] md:!left-[3%] !size-[90px] lg:!size-[120px] group",
          {
            "!bottom-10": newBanner,
            "!-bottom-8": !newBanner,
          }
        )}
      >
        {isCurrentUser && (
          <form onSubmit={logoFormik.handleSubmit} className="relative ">
            <input
              type="file"
              id="logo"
              accept="image/*"
              hidden
              onChange={(e) => handleFileChange(e, "logo", logoFormik)}
            />
            <ButtonWithTooltipIcon
              className="absolute !bg-white !text-dark p-1 -translate-x-6 translate-y-4 rounded-full opacity-0 group-hover:opacity-100"
              tip={
                newLogo
                  ? isCompanyHeader
                    ? "Change logo"
                    : "Change display picture"
                  : isCompanyHeader
                  ? "Add logo"
                  : "Add display picture"
              }
              onClick={() => document.getElementById("logo").click()}
              IconName={CameraIcon}
              disabled={logoFormik.isSubmitting}
            />
            {newLogo !== logo && (
              <ButtonWithTooltipIcon
                type="submit"
                tip="Upload image"
                IconName={CloudUploadOutlined}
                className="absolute !bottom-1 !bg-dark !text-white p-1 -translate-x-2 translate-y-4 rounded-full"
                disabled={logoFormik.isSubmitting}
              />
            )}
          </form>
        )}
      </Avatar>
    </section>
  );
};

export default Header;
