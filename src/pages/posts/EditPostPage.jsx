import { CloseButton } from "@chakra-ui/react";
import EmojiPicker from "emoji-picker-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { createPost, editPost, getPostById, getPostUploadStatus } from "../../api-services/posts";
import { useAuth } from "../../context/userContext";
import { useCompanySearch } from "../../hooks/useCompanySearch";
import { useGetActionableCompanies } from "../../hooks";
import { useUserSearch } from "../../hooks/useUserSearch";
import { AlignmentIcon, GalleryIcon, GifIcon, SmileIcon } from "../../icon";
import CustomErrorMessage from "../../components/CustomErrorMessage";
import GifPicker from "../../components/GifPicker";
import ValidImages from "../../components/ValidImages";
import MentionTextarea from "../../components/comments/MentionTextarea";
import { largeFileText, unSupportedText } from "../../components/admin/listing/newListing";
import SEO from "../../components/SEO";
import { getSEOConfig } from "../../lib/seoConfig";
import { appendMentionIdsToFormData, extractMentionIdsFromText } from "../../utils/mentionPayload";
import { webRoutes } from "../../lib/webRoutes";

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

const createUploadId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `post-upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const progressLabel = {
  preparing: "Preparing post",
  uploading: "Uploading to server",
  waiting: "Waiting for upload",
  processing: "Processing post",
  saving_images: "Saving images",
  complete: "Post created",
  failed: "Upload failed",
};

const prependPostToFeedCache = (queryClient, post) => {
  if (!post?.id) return;

  queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData) => {
    if (!oldData?.pages) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page, pageIndex) => {
        const pagePosts = page?.posts || page?.results;
        if (!Array.isArray(pagePosts)) return page;
        if (pagePosts.some((item) => item?.id === post.id)) return page;
        if (pageIndex !== 0) return page;

        return {
          ...page,
          posts: page.posts ? [post, ...page.posts] : page.posts,
          results: page.results ? [post, ...page.results] : page.results,
        };
      }),
    };
  });
};

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: companies = [] } = useGetActionableCompanies('company_post');
  const { users: mentionUsers = [] } = useUserSearch();
  const { companies: mentionCompanies = [] } = useCompanySearch();
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
  const [uploadProgress, setUploadProgress] = useState({
    visible: false,
    percent: 0,
    stage: "preparing",
    detail: "",
  });

  const textareaRef = useRef(null);

  // Reset local state whenever a different post is loaded into the modal
    useEffect(() => {
      loadPostData()
    }, [id]);

    const loadPostData = async () => {
      try{
        setIsLoading(true);
        const response = await getPostById(id);
        const postData = response?.data || response;

        if(!postData){
            toast.error("Failed to load post data. Please try again.");
            navigate(webRoutes.feed);
            return
        }
        setMessage(postData.body ?? "");
        setValidImages(postData.images ?? []);
      }
    catch(error){
        notify.error('Failed to load deal details');
        navigate(webRoutes.dealRooms);
    }   finally{
        setIsLoading(false);
    }
    };

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

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
  }, []);

  const handleMessageChange = useCallback(
    (nextValue) => {
      if (nextValue.trim().length >= 10) {
        setErrorMessage(null);
      }

      setMessage(nextValue);
      window.requestAnimationFrame(resizeTextarea);
    },
    [resizeTextarea]
  );

  const handleCreatePost = useCallback(async () => {
    if (message.trim().length < 10) {
      setErrorMessage("Post message must be at least 10 characters long");
      return;
    }

    let shouldPoll = false;
    let pollInterval;

    try {
      setIsLoading(true);
      const uploadId = createUploadId();
      const formData = new FormData();
      const mentionPayload = extractMentionIdsFromText(message, mentionUsers, mentionCompanies);
      formData.append("body", message);
      formData.append("upload_id", uploadId);
      appendMentionIdsToFormData(formData, mentionPayload);
      if (selectedCompanyId) {
        formData.append("company", selectedCompanyId);
      }
      validImages.forEach((image) => formData.append("images", image));
      if (selectedGif) formData.append("gif", selectedGif);

      setUploadProgress({
        visible: true,
        percent: 5,
        stage: "preparing",
        detail: "Preparing your post",
      });

      shouldPoll = true;
      const pollBackendStatus = async () => {
        if (!shouldPoll) return;
        try {
          const status = await getPostUploadStatus(uploadId);
          if (!status) return;
          setUploadProgress((previous) => ({
            visible: true,
            percent: Math.max(previous.percent, status.percent || previous.percent),
            stage: status.stage || previous.stage,
            detail: status.detail || previous.detail,
          }));
        } catch (statusError) {
          console.debug("Post upload status check failed", statusError);
        }
      };

      pollInterval = window.setInterval(pollBackendStatus, 700);

      const newPost = await editPost(id, formData.get("body"), formData, 
        {
        onUploadProgress: (event) => {
          const total = event.total || 0;
          if (!total) {
            setUploadProgress((previous) => ({
              ...previous,
              visible: true,
              stage: "uploading",
              detail: "Uploading to server",
            }));
            return;
          }

          const uploadPercent = Math.round((event.loaded / total) * 85);
          setUploadProgress((previous) => ({
            visible: true,
            percent: Math.max(previous.percent, Math.min(uploadPercent, 85)),
            stage: event.loaded >= total ? "processing" : "uploading",
            detail: event.loaded >= total
              ? "Upload complete. Finalizing post..."
              : "Uploading to server",
          }));
        },
      });

      shouldPoll = false;
      window.clearInterval(pollInterval);
      setUploadProgress({
        visible: true,
        percent: 100,
        stage: "complete",
        detail: "Post Updated",
      });

      if (newPost?.id) {
        setMessage("");
        setSelectedGif("");
        setValidImages([]);
        toast.success("Your post has been created");
        prependPostToFeedCache(queryClient, newPost);
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        // Navigate to the new post
        setTimeout(() => navigate(`/posts/${newPost.id}`), 1000);
      } else {
        toast.error("Failed to create post. Please try again.");
      }
    } catch (error) {
      shouldPoll = false;
      if (pollInterval) window.clearInterval(pollInterval);
      console.error("Post error: ", error);
      setUploadProgress((previous) => ({
        ...previous,
        visible: true,
        percent: 100,
        stage: "failed",
        detail: "Something went wrong while creating your post.",
      }));
      toast.error("Something went wrong while creating your post.");
    } finally {
      shouldPoll = false;
      if (pollInterval) window.clearInterval(pollInterval);
      setIsLoading(false);
      window.setTimeout(() => {
        setUploadProgress({
          visible: false,
          percent: 0,
          stage: "preparing",
          detail: "",
        });
      }, 1400);
    }
  }, [
    currentUser,
    message,
    mentionCompanies,
    mentionUsers,
    validImages,
    selectedGif,
    selectedCompanyId,
    navigate,
    queryClient,
  ]);

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
            <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
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
          <div className="mb-4 pb-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post as:
            </label>
            <select
              value={selectedCompanyId ?? ""}
              onChange={(e) =>
                setSelectedCompanyId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
            >
              <option value="">
                {[currentUser?.first_name, currentUser?.last_name]
                  .filter(Boolean)
                  .join(" ") || "Personal"}
              </option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* Textarea */}
          <div className="mb-4">
            <MentionTextarea
              ref={textareaRef}
              value={message}
              users={mentionUsers}
              companies={mentionCompanies}
              onValueChange={handleMessageChange}
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

          {uploadProgress.visible && (
            <div
              className="mt-4 rounded-md border border-gold/30 bg-gold/5 px-3 py-3"
              role="status"
              aria-live="polite"
            >
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-gray-800">
                  {progressLabel[uploadProgress.stage] || "Uploading post"}
                </span>
                <span className="tabular-nums font-semibold text-gold">
                  {Math.min(100, Math.max(0, Math.round(uploadProgress.percent)))}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    uploadProgress.stage === "failed" ? "bg-red-500" : "bg-gold"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(4, Math.round(uploadProgress.percent)))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                {uploadProgress.detail || "Keeping this open until your post is ready."}
              </p>
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
                {isLoading ? "Updating..." : "Post"}
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

export default EditPostPage;
