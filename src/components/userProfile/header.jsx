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
import { ButtonWithTooltipIcon } from "../ButtonWithTooltipIcon";
import { Pen, PencilIcon, Trash2 } from "lucide-react";


import {
  CoverPhotoPreviewModal,
  ProfilePhotoPreviewModal,
} from "./ImagePreviewModal";

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
  const [bannerEditMode, setBannerEditMode] = useState(false);
  const [logoEditMode, setLogoEditMode] = useState(false);
  const [bannerTempImage, setBannerTempImage] = useState(null);
  const [logoTempImage, setLogoTempImage] = useState(null);
  const [bannerTempFile, setBannerTempFile] = useState(null);
  const [logoTempFile, setLogoTempFile] = useState(null);
  const bannerImageRef = useRef(null);
  const logoImageRef = useRef(null);
  const bannerCanvasRef = useRef(null);
  const logoCanvasRef = useRef(null);
  const bannerUploadInputRef = useRef(null);
  const logoUploadInputRef = useRef(null);

  const { user: currentUser } = useAuth();
  const { data: currentCompany } = useGetCurrentCompany();
  const params = useParams();
  const paramsId = params.userId || 0;
  const paramsCompany = params.company;

  const isCompanyHeader = type.toLowerCase() === "company";

  const isCurrentUserById = Number(currentUser?.id) === Number(paramsId);
  const isCurrentUserByCompany =  paramsCompany ? currentCompany?.[0]?.slug?.toLowerCase() === paramsCompany?.toLowerCase() : false;
  const isCurrentUser = (isCurrentUserByCompany ) || isCurrentUserById;
  const bannerFormik = useFormik({
    initialValues: { banner },
    validationSchema: yup.object().shape({ banner: fileSchema }),
    onSubmit: async (values) => {
      if (values.banner && (values.banner !== banner || typeof values.banner === 'object')) {
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
      if (values.logo && (values.logo !== logo || typeof values.logo === 'object')) {
        toast.promise(
          isCompanyHeader
            ? uploadCompanyLogo(values.logo)
            : uploadDisplayPicture(values.logo),
          {
            loading: `Uploading ${isCompanyHeader ? "logo" : "display image"
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

  // Zoom and pan handlers - Enhanced for better UX
  const handleWheel = (e, isLogo = false) => {
    e.preventDefault();
    const zoomLevel = isLogo ? logoZoom : bannerZoom;
    // Smoother zoom with smaller increments
    const delta = e.deltaY > 0 ? 0.05 : -0.05;
    const newZoom = Math.max(1, Math.min(5, zoomLevel - delta));
    if (isLogo) {
      setLogoZoom(Math.round(newZoom * 100) / 100); // Round to 2 decimals
    } else {
      setBannerZoom(Math.round(newZoom * 100) / 100);
    }
  };

  const handleMouseDown = (e, isLogo = false) => {
    if (e.button !== 0) return; // Only left click
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

  // Crop and save edited image with zoom/position applied
  const cropAndSaveImage = (isLogo = false) => {
    const imageRef = isLogo ? logoImageRef : bannerImageRef;
    const canvasRef = isLogo ? logoCanvasRef : bannerCanvasRef;
    const zoom = isLogo ? logoZoom : bannerZoom;
    const position = isLogo ? logoPosition : bannerPosition;
    const formik = isLogo ? logoFormik : bannerFormik;
    const currentImage = isLogo ? newLogo : newBanner;

    if (!imageRef.current || !currentImage) {
      toast.error("Image reference not found");
      return;
    }

    try {
      const img = imageRef.current;
      const canvas = canvasRef.current;

      // Calculate crop dimensions
      const cropWidth = isLogo ? 300 : 900; // Logo is 1:1, banner is 3:1
      const cropHeight = isLogo ? 300 : 300;

      // Set canvas size to crop area
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast.error("Could not get canvas context");
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate image dimensions with zoom applied
      const scaledWidth = img.width * zoom;
      const scaledHeight = img.height * zoom;

      // Draw the zoomed and positioned image
      ctx.drawImage(
        img,
        position.x, // sourceX
        position.y, // sourceY
        cropWidth,
        cropHeight,
        0, // destX
        0, // destY
        cropWidth,
        cropHeight
      );

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error("Failed to create image blob");
            return;
          }

          const file = new File(
            [blob],
            `${isLogo ? "logo" : "banner"}-${Date.now()}.png`,
            { type: "image/png" }
          );

          formik.setFieldValue(isLogo ? "logo" : "banner", file);

          // Wait a tick for state update then submit
          setTimeout(() => {
            formik.submitForm();

            if (isLogo) {
              setLogoEditMode(false);
              setShowLogoModal(false);
              setLogoZoom(1);
              setLogoPosition({ x: 0, y: 0 });
              setLogoTempFile(null);
            } else {
              setBannerEditMode(false);
              setShowBannerModal(false);
              setBannerZoom(1);
              setBannerPosition({ x: 0, y: 0 });
              setBannerTempFile(null);
            }
          }, 100);

          toast.success("Image prepared successfully. Uploading...");
        },
        "image/png",
        0.95
      );
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image: " + error.message);
    }
  };

  // Delete image
  const deleteImage = async (isLogo = false) => {
    if (!window.confirm(`Delete ${isLogo ? "logo" : "banner"}?`)) return;

    if (isLogo) {
      setNewLogo(null);
      setLogoEditMode(false);
      setShowLogoModal(false);
      toast.success("Logo deleted");
    } else {
      setNewBanner(null);
      setBannerEditMode(false);
      setShowBannerModal(false);
      toast.success("Banner deleted");
    }
  };

  // Handle new image upload from modal
  const handleModalImageUpload = (event, isLogo = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
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

    // Create preview and store the file
    const previewUrl = URL.createObjectURL(file);
    if (isLogo) {
      setNewLogo(previewUrl);
      setLogoTempFile(file);
      setLogoEditMode(true);
      setLogoZoom(1);
      setLogoPosition({ x: 0, y: 0 });
    } else {
      setNewBanner(previewUrl);
      setBannerTempFile(file);
      setBannerEditMode(true);
      setBannerZoom(1);
      setBannerPosition({ x: 0, y: 0 });
    }

    toast.success("Image loaded. Adjust and save when ready.");
  };

  return (
    <section className="relative bg-gradient-to-r from-gold to-transparent from-70%">
      <section className="w-full relative">
        {/* Banner Display */}
        <div className="w-full h-64 max-h-[45vh] relative overflow-hidden group">
          {newBanner ? (
            <>
              {/* ONLY image area zooms */}
              <div
                onClick={() => setShowBannerModal(true)}
                className="absolute inset-0 cursor-zoom-in"
              >
                <div
                  className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${newBanner})`,
                  }}
                />

                <div className="absolute inset-0 bg-dark opacity-60 group-hover:opacity-40 transition-all duration-500" />

                {/* Zoom Indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-3">
                    <ImageIcon className="text-white w-6 h-6" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-gold to-transparent from-70%" />
          )}

          {/* Upload Button ALWAYS visible */}
          {isCurrentUser && isCompanyHeader && (
            <form
              onSubmit={bannerFormik.handleSubmit}
              className="absolute top-2 right-2 z-50"
            >
              <input
                type="file"
                id="banner"
                accept="image/*"
                hidden
                onChange={(e) => handleFileChange(e, "banner", bannerFormik)}
              />

              <Button
                type="button"
                opacity={0.9}
                height="8"
                fontSize="xs"
                disabled={bannerFormik.isSubmitting}
                leftIcon={<CameraIcon />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  document.getElementById("banner")?.click();
                }}
              >
                {newBanner ? "Change banner" : "Add banner"}
              </Button>
            </form>
          )}
        </div>
      </section>

      <div
        className={clsx(
          "absolute left-[7%] md:left-[3%] group",
          {
            "bottom-10": newBanner,
            "-bottom-8": !newBanner,
          }
        )}
      >
        {/* Clickable Avatar */}
          <div
            onClick={(e) => {
              // prevent upload button click from bubbling
              if (e.target.closest("button")) return;

              newLogo && setShowLogoModal(true);
            }}
            className="cursor-zoom-in"
          >
          <Avatar
            src={newLogo}
            name={name}
            size="xl"
            className={clsx(
              avatarStyle,
              "!size-[90px] lg:!size-[120px]"
            )}
          />
        </div>

        {/* Upload Button */}
        {isCurrentUser && (
          <form
            onSubmit={logoFormik.handleSubmit}
            className="absolute bottom-1 right-1 z-20"
          >
            <input
              type="file"
              id="logo"
              accept="image/*"
              hidden
              onChange={(e) => handleFileChange(e, "logo", logoFormik)}
            />

            <ButtonWithTooltipIcon
              type="button"
              className="!bg-white !text-dark p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
              tip={
                newLogo
                  ? isCompanyHeader
                    ? "Change logo"
                    : "Change display picture"
                  : isCompanyHeader
                    ? "Add logo"
                    : "Add display picture"
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                document.getElementById("logo").click();
              }}
              iconClassName={"size-5"}
              IconName={CameraIcon}
              disabled={logoFormik.isSubmitting}
            />
          </form>
        )}
      </div>

      <CoverPhotoPreviewModal
        open={showBannerModal}
        onClose={() => setShowBannerModal(false)}
        image={newBanner}
      />
      <ProfilePhotoPreviewModal
        open={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        image={newLogo}
      />

    </section>
  )
}


export default Header;