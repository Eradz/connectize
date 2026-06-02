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
import { Pen, PencilIcon, Trash2 } from "lucide-react";

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
  const isCurrentUserByCompany =
    currentCompany?.[0]?.slug?.toLowerCase() ===
    paramsCompany?.toLowerCase();

  const isCurrentUser = isCurrentUserByCompany || isCurrentUserById;

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

      {/* Banner Preview Modal - LinkedIn Style */}
      {showBannerModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => {
            setShowBannerModal(false);
            setBannerEditMode(false);
            resetZoom(false);
          }}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {bannerEditMode ? "Edit Banner" : "Banner"}
              </h2>
              <button
                onClick={() => {
                  setShowBannerModal(false);
                  setBannerEditMode(false);
                  resetZoom(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 p-4">
              {bannerEditMode ? (
                <div className="relative w-full h-full max-h-[500px] flex items-center justify-center">
                  <div
                    className="relative w-full h-full max-w-full overflow-hidden rounded-lg border-4 border-blue-500 bg-white shadow-inner"
                    onWheel={(e) => handleWheel(e, false)}
                    onMouseDown={(e) => handleMouseDown(e, false)}
                    onMouseMove={(e) => handleMouseMove(e, false)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ userSelect: "none", aspectRatio: "3/1" }}
                  >
                    {/* Grid overlay for visual guidance */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 z-10">
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white"></div>
                    </div>

                    {/* Image */}
                    <img
                      ref={bannerImageRef}
                      src={newBanner}
                      alt="Banner Edit"
                      className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                      style={{
                        transform: `scale(${bannerZoom}) translate(${bannerPosition.x}px, ${bannerPosition.y}px)`,
                        transition: isDragging ? "none" : "transform 0.2s ease-out",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={newBanner}
                  alt="Banner Preview"
                  className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                />
              )}
              <canvas ref={bannerCanvasRef} className="hidden" />
            </div>

            {/* Zoom Controls (Edit Mode) */}
            {bannerEditMode && (
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex flex-col gap-4">
                  {/* Zoom Slider */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setBannerZoom(Math.max(1, bannerZoom - 0.2))}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition font-medium"
                    >
                      − Zoom Out
                    </button>
                    <div className="flex items-center gap-3 flex-1 max-w-sm">
                      <input
                        type="range"
                        min="100"
                        max="500"
                        value={Math.round(bannerZoom * 100)}
                        onChange={(e) => setBannerZoom(Math.max(1, Math.min(5, parseInt(e.target.value) / 100)))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold min-w-[50px] text-center text-sm">
                        {Math.round(bannerZoom * 100)}%
                      </span>
                    </div>
                    <button
                      onClick={() => setBannerZoom(Math.min(5, bannerZoom + 0.2))}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition font-medium"
                    >
                      + Zoom In
                    </button>
                  </div>
                  {/* Instructions and Reset */}
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-gray-600 text-sm">
                      📌 <span className="font-medium">Drag the image</span> to position • <span className="font-medium">Scroll</span> to zoom
                    </p>
                    <button
                      onClick={() => resetZoom(false)}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition font-medium text-sm whitespace-nowrap"
                    >
                      ↺ Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center">
              <div className="flex gap-2">
                {isCurrentUser && !bannerEditMode && (
                  <>
                    <button
                      onClick={() => bannerUploadInputRef.current?.click()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                    >
                      ⬆️ Upload New
                    </button>
                    <button
                      onClick={() => setBannerEditMode(true)}
                      className="px-4 py-2 border border-gold text-white rounded-lg hover:border-custom_yellow transition font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteImage(false)}
                      className="px-4 py-2 border border-red-600 text-white rounded-lg hover:border-red-700 transition font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
                {isCurrentUser && bannerEditMode && (
                  <>
                    <button
                      onClick={() => {
                        setBannerEditMode(false);
                        resetZoom(false);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => cropAndSaveImage(false)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      ✓ Save & Upload
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setShowBannerModal(false);
                  setBannerEditMode(false);
                  resetZoom(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
            {/* Hidden file input for banner upload */}
            <input
              ref={bannerUploadInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleModalImageUpload(e, false)}
            />
          </div>
        </div>
      )}

      {/* Logo Preview Modal - LinkedIn Style */}
      {showLogoModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => {
            setShowLogoModal(false);
            setLogoEditMode(false);
            resetZoom(true);
          }}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {logoEditMode ? "Edit " : ""}{isCompanyHeader ? "Logo" : "Profile Photo"}
              </h2>
              <button
                onClick={() => {
                  setShowLogoModal(false);
                  setLogoEditMode(false);
                  resetZoom(true);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 p-8">
              {logoEditMode ? (
                <div className="relative w-full h-full max-w-md max-h-[400px] flex items-center justify-center">
                  <div
                    className="relative w-full h-full overflow-hidden rounded-lg border-4 border-blue-500 bg-white shadow-inner"
                    onWheel={(e) => handleWheel(e, true)}
                    onMouseDown={(e) => handleMouseDown(e, true)}
                    onMouseMove={(e) => handleMouseMove(e, true)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ userSelect: "none", aspectRatio: "1/1" }}
                  >
                    {/* Grid overlay for visual guidance */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 z-10">
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white"></div>
                    </div>

                    {/* Image */}
                    <img
                      ref={logoImageRef}
                      src={newLogo}
                      alt="Logo Edit"
                      className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                      style={{
                        transform: `scale(${logoZoom}) translate(${logoPosition.x}px, ${logoPosition.y}px)`,
                        transition: isDragging ? "none" : "transform 0.2s ease-out",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={newLogo}
                  alt="Logo Preview"
                  className="max-w-xs max-h-[400px] object-contain rounded-lg"
                />
              )}
              <canvas ref={logoCanvasRef} className="hidden" />
            </div>

            {/* Zoom Controls (Edit Mode) */}
            {logoEditMode && (
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex flex-col gap-4">
                  {/* Zoom Slider */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setLogoZoom(Math.max(1, logoZoom - 0.2))}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition font-medium"
                    >
                      − Zoom Out
                    </button>
                    <div className="flex items-center gap-3 flex-1 max-w-sm">
                      <input
                        type="range"
                        min="100"
                        max="500"
                        value={Math.round(logoZoom * 100)}
                        onChange={(e) => setLogoZoom(Math.max(1, Math.min(5, parseInt(e.target.value) / 100)))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold min-w-[50px] text-center text-sm">
                        {Math.round(logoZoom * 100)}%
                      </span>
                    </div>
                    <button
                      onClick={() => setLogoZoom(Math.min(5, logoZoom + 0.2))}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition font-medium"
                    >
                      + Zoom In
                    </button>
                  </div>
                  {/* Instructions and Reset */}
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-gray-600 text-sm">
                      📌 <span className="font-medium">Drag the image</span> to position • <span className="font-medium">Scroll</span> to zoom
                    </p>
                    <button
                      onClick={() => resetZoom(true)}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition font-medium text-sm whitespace-nowrap"
                    >
                      ↺ Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center">
              <div className="flex gap-2">
                {isCurrentUser && !logoEditMode && (
                  <>
                    <button
                      onClick={() => logoUploadInputRef.current?.click()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                    >
                      ⬆️ Upload New
                    </button>
                    <button
                      onClick={() => setLogoEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-gold text-gold rounded-lg hover:border-custom_yellow transition font-medium"
                    >
                      <PencilIcon className="w-4 h-4 text-gold" />
                       <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteImage(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:border-red-700 transition font-medium"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
                {isCurrentUser && logoEditMode && (
                  <>
                    <button
                      onClick={() => {
                        setLogoEditMode(false);
                        resetZoom(true);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => cropAndSaveImage(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      ✓ Save & Upload
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setShowLogoModal(false);
                  setLogoEditMode(false);
                  resetZoom(true);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
            {/* Hidden file input for logo upload */}
            <input
              ref={logoUploadInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleModalImageUpload(e, true)}
            />
          </div>
        </div>
      )}

</section>
  )}


  export default Header;