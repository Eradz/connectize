import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  X,
  ImagePlus,
  Trash2,
  MessageSquareOff,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { editPost, getPostUploadStatus } from "../../../api-services/posts";
import { isImageFile, isImageSize } from "../../../utils/imageUpload";
import { largeFileText, unSupportedText } from "../listing/newListing";

const MAX_IMAGES = 4;
export default function EditPostModal({ post, isOpen, onClose, onUpdated }) {
  const [message, setMessage] = useState(post?.body ?? "");
  const [allowComments, setAllowComments] = useState(post?.allow_comments ?? false);
  const [existingImages, setExistingImages] = useState(post?.images ?? []);
  const [removedImages, setRemovedImages] = useState([]);
  const [validImages, setValidImages] = useState([]); // newly added File objects
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    visible: false,
    percent: 0,
    stage: "preparing",
    detail: "",
  });

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Reset local state whenever a different post is loaded into the modal
  useEffect(() => {
    if (!post) return;
    setMessage(post.body ?? "");
    setAllowComments(post.allow_comments ?? false);
    setExistingImages(post.images ?? []);
    setRemovedImages([]);
    setValidImages([]);
    setErrorMessage("");
  }, [post?.id]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Same cleanup pattern as the create-post flow
  useEffect(() => {
    return () => validImages.forEach((image) => URL.revokeObjectURL(image));
  }, [validImages]);

  const totalImageCount = existingImages.length + validImages.length;

  const handleFileChange = useCallback(
    (event) => {
      const selectedFiles = Array.from(event.target.files);
      const remainingSlots = Math.max(0, MAX_IMAGES - existingImages.length);
      const validImageFiles = selectedFiles
        .filter(isImageFile)
        .filter(isImageSize)
        .slice(0, remainingSlots);

      setValidImages(validImageFiles);

      if (validImageFiles.length < selectedFiles.length) {
        toast.info(`${unSupportedText} or ${largeFileText}`);
      }
      event.target.value = "";
    },
    [existingImages.length]
  );

  const handleRemoveExistingImage = useCallback((url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setRemovedImages((prev) => [...prev, url]);
  }, []);

  const handleRemoveNewImage = useCallback((file) => {
    setValidImages((prev) => prev.filter((img) => img !== file));
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (message.trim().length < 10) {
      setErrorMessage("Post message must be at least 10 characters long");
      return;
    }

    let shouldPoll = false;
    let pollInterval;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const formData = new FormData();
      formData.append("body", message);
      formData.append("allow_comments", allowComments);
      formData.append("existing_images", JSON.stringify(existingImages));
      formData.append("removed_images", JSON.stringify(removedImages));
      validImages.forEach((image) => formData.append("images", image));

      setUploadProgress({
        visible: true,
        percent: 5,
        stage: "preparing",
        detail: "Preparing your changes",
      });

      // Only worth polling if there are new files actually uploading
      if (validImages.length > 0) {
        shouldPoll = true;
        const pollBackendStatus = async () => {
          if (!shouldPoll) return;
          try {
            const status = await getPostUploadStatus(post.id);
            if (!status) return;
            setUploadProgress((previous) => ({
              visible: true,
              percent: Math.max(previous.percent, status.percent || previous.percent),
              stage: status.stage || previous.stage,
              detail: status.detail || previous.detail,
            }));
          } catch (statusError) {
            console.debug("Post update status check failed", statusError);
          }
        };
        pollInterval = window.setInterval(pollBackendStatus, 700);
      }

      const updatedPost = await editPost(post.id, formData.get("body"), formData);

      shouldPoll = false;
      if (pollInterval) window.clearInterval(pollInterval);
      setUploadProgress({
        visible: true,
        percent: 100,
        stage: "complete",
        detail: "Post updated",
      });

      if (updatedPost?.id) {
        toast.success("Your post has been updated");
        onUpdated?.(updatedPost);
        onClose();
      } else {
        toast.error("Failed to update post. Please try again.");
      }
    } catch (error) {
      shouldPoll = false;
      if (pollInterval) window.clearInterval(pollInterval);
      console.error("Post update error: ", error);
      setUploadProgress((previous) => ({
        ...previous,
        visible: true,
        percent: 100,
        stage: "failed",
        detail: "Something went wrong while updating your post.",
      }));
      toast.error("Something went wrong while updating your post.");
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
  }, [message, allowComments, existingImages, removedImages, validImages, post, onUpdated, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) onClose();
  };

  if (!isOpen || !post) return null;

  const isEmpty = message.trim().length === 0 && totalImageCount === 0;
  const canSave = !isEmpty && !isLoading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onMouseDown={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-post-title"
    >
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
          <h2 id="edit-post-title" className="text-base font-semibold text-gray-900">
            Edit post
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-4 sm:px-5 py-4 flex-1">
          <div className="flex items-center gap-3 mb-4">
            {post.user?.avatar ? (
              <img
                src={post.user.avatar}
                alt={post.user.full_name || "User"}
                className="h-10 w-10 rounded-full object-cover bg-gray-100 shrink-0"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/30 text-sm font-semibold text-dark">
                {(post.user?.display_name || post.user?.full_name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {post.user.display_name || post.user.full_name}
              </p>
              {post.company?.company_name && (
                <p className="text-xs text-gray-500 truncate">
                  Posting as {post.company.company_name}
                </p>
              )}
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            rows={5}
            placeholder="What do you want to share?"
            className={`w-full resize-y min-h-[120px] sm:min-h-[150px] rounded-lg border px-3 py-2.5 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-shadow ${
              errorMessage
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-gold/40 focus:border-gold"
            }`}
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            {errorMessage ? (
              <p className="text-xs text-red-500">{errorMessage}</p>
            ) : (
              <p className="text-xs text-gray-400">
                {message.trim().length < 10
                  ? `${10 - message.trim().length} more character${
                      10 - message.trim().length === 1 ? "" : "s"
                    } needed`
                  : " "}
              </p>
            )}
            <span className="shrink-0 text-xs text-gray-400">
              {message.length}
            </span>
          </div>

          {/* Images */}
          {totalImageCount > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {existingImages.map((url) => (
                <div key={url} className="relative group rounded-lg overflow-hidden border border-gray-100">
                  <img src={url} alt="Post attachment" className="h-32 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(url)}
                    disabled={isLoading}
                    aria-label="Remove image"
                    className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-opacity disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {validImages.map((file) => {
                const previewUrl = URL.createObjectURL(file);
                return (
                  <div
                    key={`${file.name}-${file.lastModified}`}
                    className="relative group rounded-lg overflow-hidden border border-gray-100"
                  >
                    <img src={previewUrl} alt="New attachment" className="h-32 w-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-dark">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(file)}
                      disabled={isLoading}
                      aria-label="Remove image"
                      className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-opacity disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {totalImageCount < MAX_IMAGES && (
            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-gold hover:text-dark hover:bg-gold/10 transition-colors disabled:opacity-50"
              >
                <ImagePlus size={16} />
                Add photo
                <span className="text-xs text-gray-400">({totalImageCount}/{MAX_IMAGES})</span>
              </button>
            </div>
          )}

          {/* Allow comments toggle */}
          <button
            type="button"
            onClick={() => setAllowComments((v) => !v)}
            disabled={isLoading}
            className="mt-4 flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <span className="flex items-center gap-2 text-sm text-gray-700">
              {allowComments ? <MessageSquare size={16} /> : <MessageSquareOff size={16} />}
              Allow comments
            </span>
            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${
                allowComments ? "bg-gold" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  allowComments ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>

          {/* Upload progress */}
          {uploadProgress.visible && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{uploadProgress.detail}</span>
                <span>{uploadProgress.percent}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    uploadProgress.stage === "failed" ? "bg-red-500" : "bg-gold"
                  }`}
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 border-t border-gray-100 px-4 sm:px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveEdit}
            disabled={!canSave}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gold px-5 py-2.5 sm:py-2 text-sm font-semibold text-dark hover:bg-[#E0B533] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            {isLoading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}