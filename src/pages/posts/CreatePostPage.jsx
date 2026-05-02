import { CloseButton } from "@chakra-ui/react";
import EmojiPicker from "emoji-picker-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { createPost } from "../../api-services/posts";
import { useCustomQuery } from "../../context/queryContext";
import { useAuth } from "../../context/userContext";
import { useGetActionableCompanies } from "../../hooks";
import { AlignmentIcon, GalleryIcon, GifIcon, SmileIcon } from "../../icon";
import CustomErrorMessage from "../../components/CustomErrorMessage";
import GifPicker from "../../components/GifPicker";
import ValidImages from "../../components/ValidImages";
import { largeFileText, unSupportedText } from "../../components/admin/listing/newListing";
import SEO from "../../components/SEO";
import { getSEOConfig } from "../../lib/seoConfig";

const imageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
const imageSize = 4 * 1024 * 1024; // 4MB

const isImageFile = (files) =>
  Array.isArray(files)
    ? files.every((file) => imageTypes.includes(file.type.toLowerCase()))
    : imageTypes.includes(files.type.toLowerCase());

const isImageSize = (files) =>
  Array.isArray(files)
    ? files.every((file) => file.size <= imageSize)
    : files.size <= imageSize;

function CreatePostPage() {
  const navigate = useNavigate();
  const { setRefetchInterval } = useCustomQuery();
  const { user: currentUser } = useAuth();
  const { data: companies = [] } = useGetActionableCompanies('company_post');
  const queryClient = useQueryClient();
  const seoData = getSEOConfig("createPost");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [validImages, setValidImages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // Auto-select first company, or update when companies load
  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  const textareaRef = useRef(null);

  // Check if user has completed profile on mount
  useEffect(() => {
    if (currentUser?.is_first_time_user) {
      toast.info(
        <div className="grid gap-1">
          <strong>Please complete your profile to create a post</strong>
          <Link
            to="/update-profile"
            className="!underline !text-gray-400 hover:!text-black font-semibold"
          >
            Complete your profile
          </Link>
        </div>,
        { closeButton: true, duration: 30000, position: "top-center" }
      );
      navigate("/");
      return;
    }
  }, [currentUser, navigate]);

  const handleFileChange = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files);
    const validImageFiles = selectedFiles
      .filter(isImageFile)
      .filter(isImageSize);

    setValidImages(validImageFiles);

    if (validImageFiles.length < selectedFiles.length) {
      toast.info(`${unSupportedText} or ${largeFileText}`);
    }
  }, []);

  useEffect(() => {
    return () => validImages.forEach((image) => URL.revokeObjectURL(image));
  }, [validImages]);

  const onEmojiClick = useCallback((emojiObject) => {
    setMessage((prevText) => prevText + emojiObject.emoji);
  }, []);

  const onGifSelect = useCallback((gifUrl) => {
    setSelectedGif(gifUrl);
    setShowGifPicker(false);
  }, []);

  const handleCreatePost = useCallback(async () => {
    if (message.trim().length < 10) {
      setErrorMessage("Post message must be at least 10 characters long");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("body", message);
      if (selectedCompanyId) {
        formData.append("company", selectedCompanyId);
      }
      validImages.forEach((image) => formData.append("images", image));
      if (selectedGif) formData.append("gif", selectedGif);

      const newPost = await createPost(formData, selectedCompanyId);

      if (newPost?.id) {
        setMessage("");
        setSelectedGif("");
        setValidImages([]);
        toast.success("Your post has been created");
        // Immediately invalidate posts cache so the new post appears right away
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        // Navigate to the new post
        setTimeout(() => navigate(`/posts/${newPost.id}`), 1000);
      } else {
        toast.error("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Post error: ", error);
      toast.error("Something went wrong while creating your post.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, message, validImages, selectedGif, selectedCompanyId, navigate, queryClient]);

  const renderEmojiGifPickers = useMemo(
    () => (
      <section className="fixed inset-0 w-full h-full z-[4000] flex items-center justify-center bg-transparent safe-area-p">
        <div
          className="bg-black/30 fixed inset-0 w-full h-full"
          onClick={() => {
            setShowEmojiPicker(false);
            setShowGifPicker(false);
          }}
        />
        <div className="relative size-fit max-w-sm grid place-items-center m-10">
          <CloseButton
            onClick={() => {
              setShowEmojiPicker(false);
              setShowGifPicker(false);
            }}
            className="absolute -right-8 -top-8 bg-white !text-xs !size-8"
          />
          {showGifPicker && <GifPicker onGifSelect={onGifSelect} />}
          {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
        </div>
      </section>
    ),
    [showEmojiPicker, showGifPicker, onGifSelect, onEmojiClick]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
      />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={currentUser?.avatar || "/default-avatar.png"}
                alt={`${currentUser?.first_name} ${currentUser?.last_name}`}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {currentUser?.first_name} {currentUser?.last_name}
                </p>
                <p className="text-sm text-gray-500">@{currentUser?.username || "user"}</p>
              </div>
            </div>
          </div>

          {/* Company Selector */}
          {companies.length > 0 && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post as:
              </label>
              <select
                value={selectedCompanyId || ""}
                onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Textarea */}
          <div className="mb-4">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                const textarea = textareaRef.current;
                if (!textarea) return;
                if (message.trim().length >= 10) {
                  setErrorMessage(null);
                }
                setMessage(e.target.value);

                // Auto-resize logic
                textarea.style.height = "auto";
                textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
              }}
              placeholder="What's happening in your world?"
              minLength={10}
              style={{ lineHeight: "1.5" }}
              className="w-full text-xl border-none outline-none resize-none placeholder:text-gray-400 transition-all duration-300"
              rows={6}
            />
            <CustomErrorMessage errorMessage={errorMessage} />
          </div>

          {/* Images Preview */}
          <ValidImages setValidImages={setValidImages} validImages={validImages} />

          {/* GIF Preview */}
          {selectedGif && (
            <div className="mt-4 relative w-fit">
              <CloseButton
                onClick={() => setSelectedGif("")}
                className="absolute -right-1 -top-1 bg-white !text-[.5rem] !size-6"
              />
              <img
                src={selectedGif}
                alt="Selected GIF"
                className="max-w-xs h-auto rounded-lg hover:shadow transition-all duration-300"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  name="post_images"
                  id="post_images"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  hidden
                />
                <ToolbarButton
                  Icon={GalleryIcon}
                  tooltip="Add images"
                  onClick={() => document.getElementById("post_images").click()}
                />
                <ToolbarButton
                  Icon={GifIcon}
                  tooltip="Add GIF"
                  onClick={() => setShowGifPicker(true)}
                />
                <ToolbarButton
                  Icon={SmileIcon}
                  tooltip="Add emoji"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                />
              </div>

              <button
                onClick={handleCreatePost}
                disabled={isLoading || message.trim().length < 10}
                className="px-6 py-2.5 bg-gold hover:bg-custom_yellow disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-all duration-300 text-sm"
              >
                {isLoading ? "Creating..." : "Post"}
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Tips for a great post:</p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Be authentic and genuine</li>
              <li>• Use clear and engaging language</li>
              <li>• Add images or GIFs to make it more engaging</li>
              <li>• Engage with the community</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Emoji/GIF Pickers */}
      {(showEmojiPicker || showGifPicker) && renderEmojiGifPickers}
    </div>
  );
}

const ToolbarButton = ({ Icon, tooltip, onClick }) => (
  <button
    onClick={onClick}
    className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group relative"
    title={tooltip}
  >
    <Icon className="w-5 h-5 text-gray-600 hover:text-gray-900" />
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {tooltip}
    </span>
  </button>
);

export default CreatePostPage;
