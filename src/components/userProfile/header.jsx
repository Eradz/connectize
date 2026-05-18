import { CloudUploadOutlined } from "@ant-design/icons";
import { Avatar, Button } from "@chakra-ui/react";
import { CameraIcon, ImageIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
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
import { ButtonWithTooltipIcon } from "../ButtonWithTooltipIcon";

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
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [bannerZoom, setBannerZoom] = useState(1);
  const [logoZoom, setLogoZoom] = useState(1);
  const [bannerPosition, setBannerPosition] = useState({ x: 0, y: 0 });
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const bannerImageRef = useRef(null);
  const logoImageRef = useRef(null);
  const { user: currentUser } = useAuth();
  const { data: currentCompany } = useGetCurrentCompany();
  const params = useParams();
  const paramsId = params.userId || 0;
  const paramsCompany = params.company;

  const isCompanyHeader = type.toLowerCase() === "company";

  const isCurrentUserById = Number(currentUser?.id) === Number(paramsId);
  const isCurrentUserByCompany =
    currentCompany?.[0]?.slug?.toLowerCase() ===
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
      // Auto-submit banner upload
      bannerFormik.setFieldValue(field, file);
      setTimeout(() => bannerFormik.submitForm(), 0);
    } else if (field === "logo") {
      setNewLogo(URL.createObjectURL(file));
      // Auto-submit logo upload
      logoFormik.setFieldValue(field, file);
      setTimeout(() => logoFormik.submitForm(), 0);
    }
  };

  useEffect(() => {
    setNewBanner(banner);
    setNewLogo(logo);
  }, [banner, logo]);

  // Zoom and pan handlers
  const handleWheel = (e, isLogo = false) => {
    e.preventDefault();
    const zoomLevel = isLogo ? logoZoom : bannerZoom;
    const delta = e.deltaY > 0 ? 0.1 : -0.1;
    const newZoom = Math.max(1, Math.min(5, zoomLevel - delta));
    if (isLogo) {
      setLogoZoom(newZoom);
    } else {
      setBannerZoom(newZoom);
    }
  };

  const handleMouseDown = (e, isLogo = false) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e, isLogo = false) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (isLogo) {
      setLogoPosition({
        x: logoPosition.x + deltaX,
        y: logoPosition.y + deltaY,
      });
    } else {
      setBannerPosition({
        x: bannerPosition.x + deltaX,
        y: bannerPosition.y + deltaY,
      });
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = (isLogo = false) => {
    if (isLogo) {
      setLogoZoom(1);
      setLogoPosition({ x: 0, y: 0 });
    } else {
      setBannerZoom(1);
      setBannerPosition({ x: 0, y: 0 });
    }
  };

  return (
    <section className="relative bg-gradient-to-r from-gold to-transparent from-70%">
      <section className="w-full relative">
        {newBanner ? (
          <button
            onClick={() => setShowBannerModal(true)}
            className="w-full h-64 max-h-[45vh] block relative cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{
                backgroundImage: `url(${newBanner})`,
              }}
            />
            <div className="absolute inset-0 bg-dark opacity-60 hover:opacity-40 transition-all duration-500" />
          </button>
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
                opacity={0.75}
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
            {/* {newBanner !== banner && (
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
            )} */}
          </form>
        )}
      </section>

      <Avatar
        src={newLogo}
        name={name}
        size="xl"
        className={clsx(
          avatarStyle,
          "!absolute !left-[7%] md:!left-[3%] !size-[90px] lg:!size-[120px] group cursor-pointer",
          {
            "!bottom-10": newBanner,
            "!-bottom-8": !newBanner,
          }
        )}
        onClick={() => newLogo && setShowLogoModal(true)}
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
              className="absolute !bg-white !text-dark p-2 -translate-x-8 translate-y-2 rounded-full opacity-0 group-hover:opacity-100"
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
              iconClassName={"size-5"}
              IconName={CameraIcon}
              disabled={logoFormik.isSubmitting}
            />
            {/* {newLogo !== logo && (
              <ButtonWithTooltipIcon
                type="submit"
                tip="Upload image"
                IconName={CloudUploadOutlined}
                className="absolute !bottom-1 !bg-dark !text-white p-1 -translate-x-2 translate-y-4 rounded-full"
                disabled={logoFormik.isSubmitting}
              />
            )} */}
          </form>
        )}
      </Avatar>

      {/* Banner Preview Modal */}
      {showBannerModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setShowBannerModal(false)}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowBannerModal(false)}
              className="absolute top-4 right-4 z-10 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition"
            >
              ✕
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button
                onClick={() => setBannerZoom(Math.max(1, bannerZoom - 0.2))}
                className="bg-white text-black px-3 py-2 rounded hover:bg-gray-200 transition"
              >
                −
              </button>
              <div className="bg-white text-black px-4 py-2 rounded min-w-[60px] text-center">
                {Math.round(bannerZoom * 100)}%
              </div>
              <button
                onClick={() => setBannerZoom(Math.min(5, bannerZoom + 0.2))}
                className="bg-white text-black px-3 py-2 rounded hover:bg-gray-200 transition"
              >
                +
              </button>
              <button
                onClick={() => resetZoom(false)}
                className="bg-white text-black px-3 py-2 rounded hover:bg-gray-200 transition"
              >
                Reset
              </button>
            </div>

            {/* Image Container */}
            <div
              className="overflow-hidden rounded-lg max-w-[90vw] max-h-[90vh] cursor-grab active:cursor-grabbing"
              onWheel={(e) => handleWheel(e, false)}
              onMouseDown={(e) => handleMouseDown(e, false)}
              onMouseMove={(e) => handleMouseMove(e, false)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ userSelect: "none" }}
            >
              <img
                ref={bannerImageRef}
                src={newBanner}
                alt="Banner Preview"
                className="w-full h-full object-contain"
                style={{
                  transform: `scale(${bannerZoom}) translate(${bannerPosition.x}px, ${bannerPosition.y}px)`,
                  transition: isDragging ? "none" : "transform 0.2s ease-out",
                }}
              />
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm text-center">
              <p>Scroll to zoom • Drag to pan</p>
            </div>
          </div>
        </div>
      )}

      {/* Logo Preview Modal */}
      {showLogoModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setShowLogoModal(false)}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLogoModal(false)}
              className="absolute top-4 right-4 z-10 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition"
            >
              ✕
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button
                onClick={() => setLogoZoom(Math.max(1, logoZoom - 0.2))}
                className="bg-white text-black px-3 py-2 rounded hover:bg-gray-200 transition"
              >
                −
              </button>
              <div className="bg-white text-black px-4 py-2 rounded min-w-[60px] text-center">
                {Math.round(logoZoom * 100)}%
              </div>
              <button
                onClick={() => setLogoZoom(Math.min(5, logoZoom + 0.2))}
                className="bg-white text-black px-3 py-2 rounded hover:bg-gray-200 transition"
              >
                +
              </button>
              <button
                onClick={() => resetZoom(true)}
                className="bg-white text-black px-3 py-2 rounded hover:bg-gray-200 transition"
              >
                Reset
              </button>
            </div>

            {/* Image Container */}
            <div
              className="overflow-hidden rounded-lg max-w-[90vw] max-h-[90vh] cursor-grab active:cursor-grabbing"
              onWheel={(e) => handleWheel(e, true)}
              onMouseDown={(e) => handleMouseDown(e, true)}
              onMouseMove={(e) => handleMouseMove(e, true)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ userSelect: "none" }}
            >
              <img
                ref={logoImageRef}
                src={newLogo}
                alt="Logo Preview"
                className="w-full h-full object-contain"
                style={{
                  transform: `scale(${logoZoom}) translate(${logoPosition.x}px, ${logoPosition.y}px)`,
                  transition: isDragging ? "none" : "transform 0.2s ease-out",
                }}
              />
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm text-center">
              <p>Scroll to zoom • Drag to pan</p>
            </div>
          </div>
        </div>
      )}

</section>
  )}


  export default Header;