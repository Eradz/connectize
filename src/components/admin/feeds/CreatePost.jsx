import { CloseButton } from "@chakra-ui/react";
import EmojiPicker from "emoji-picker-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { createPost } from "../../../api-services/posts";
import { useCustomQuery } from "../../../context/queryContext";
import { useAuth } from "../../../context/userContext";
import { AlignmentIcon, GalleryIcon, GifIcon, SmileIcon } from "../../../icon";
import CustomErrorMessage from "../../CustomErrorMessage";
import GifPicker from "../../GifPicker";
import ValidImages from "../../ValidImages";
import { largeFileText, unSupportedText } from "../listing/newListing";

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

function CreatePost() {
  const { setRefetchInterval } = useCustomQuery();
  const { user: currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [validImages, setValidImages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState("");

  const textareaRef = useRef(null);

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
      return;
    }

    if (message.trim().length < 10) {
      setErrorMessage("Post message must be at least 10 characters long");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("body", message);
      validImages.forEach((image) => formData.append("images", image));
      if (selectedGif) formData.append("gif", selectedGif);

      const newPost = await createPost(formData);

      if (newPost.id) {
        setMessage("");
        setSelectedGif("");
        toast.success("Your post has been created");
        setRefetchInterval(1000);
        setTimeout(() => setRefetchInterval(false), 2000);
        setValidImages([]);
      }
    } catch (error) {
      console.error("Post error: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, message, validImages, selectedGif, setRefetchInterval]);

  const renderEmojiGifPickers = useMemo(
    () => (
      <section className="fixed top-0 left-0 w-screen h-screen z-[4000] flex items-center justify-center bg-transparent">
        <div
          className="bg-black/30 fixed top-0 left-0 w-screen h-screen"
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
    <section className="bg-white px-4 md:px-6 py-4 rounded border-b-[4px] border-gold relative">
      <div className="size-full">
        <textarea
          type="text"
          ref={textareaRef}
          value={message}
          style={{ lineHeight: "1.2" }}
          onChange={(e) => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            if (message.trim().length >= 10) {
              setErrorMessage(null);
            } else if (message.trim().length < 10) {
              setErrorMessage(
                "Post message must be at least 10 characters long"
              );
            }
            setMessage(e.target.value);

            // Auto-resize logic
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
          }}
          minLength={10}
          placeholder="What's happening?"
          className="w-full border-b border-gray-300 bg-transparent outline-none text-base resize-none transition-all duration-300 scrollbar-hidden placeholder:text-xl bg-red-60"
        />
        <CustomErrorMessage errorMessage={errorMessage} />
      </div>

      <ValidImages setValidImages={setValidImages} validImages={validImages} />

      {selectedGif && (
        <div className="mt-4 relative w-fit">
          <CloseButton
            onClick={() => setSelectedGif("")}
            className="absolute -right-1 -top-1 bg-white !text-[.5rem] !size-6"
          />
          <img
            src={selectedGif}
            alt="Selected GIF"
            className="w-16 h-auto rounded-lg hover:shadow transition-all duration-300"
          />
        </div>
      )}

      <div className="mt-4 flex max-sm:flex-col sm:items-center justify-between max-sm:gap-4 md:gap-4 lg:gap-1">
        <div className="flex items-center gap-2 relative">
          <input
            name="post_images"
            id="post_images"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            multiple
            hidden
          />
          <MaskedIcon
            Icon={GalleryIcon}
            onClick={() => document.getElementById("post_images").click()}
          />
          <MaskedIcon Icon={GifIcon} onClick={() => setShowGifPicker(true)} />
          <MaskedIcon Icon={AlignmentIcon} />
          <MaskedIcon
            Icon={SmileIcon}
            onClick={() => setShowEmojiPicker((prevState) => !prevState)}
          />
        </div>

        <button
          className="text-sm w-full !max-w-xs self-center lg:self-end rounded-full bg-gold hover:bg-gold/60 py-2.5 px-8 transition-all duration-300 md:w-fit disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={handleCreatePost}
          disabled={isLoading}
        >
          {isLoading ? "Creating Post" : "Create Post"}
        </button>
      </div>
      {(showEmojiPicker || showGifPicker) && renderEmojiGifPickers}
    </section>
  );
}

const MaskedIcon = ({ Icon, onClick }) => (
  <button
    className="bg-gray-200/50 py-2 px-4 rounded-sm outline-0 max-sm:w-full grid place-items-center"
    onClick={onClick}
  >
    <Icon />
  </button>
);

export default CreatePost;
