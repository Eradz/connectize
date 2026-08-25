import {
  PaperClipOutlined,
  PauseCircleFilled,
  PlayCircleFilled,
} from "@ant-design/icons";
import {
  Button,
  CloseButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { Mic, MicExternalOn, MusicNote } from "@mui/icons-material";
import {
  ArrowDownIcon,
  CameraIcon,
  FileIcon,
  ImageIcon,
  PaperPlaneIcon,
  PersonIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import EmojiPicker from "emoji-picker-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/userContext";
import { useMessagesStore } from "../../stores/messagesStore";
import { getUserDisplayName } from "../../lib/userDisplay";
import { ButtonWithTooltipIcon } from "../ButtonWithTooltipIcon";
import { largeFileText } from "../admin/listing/newListing";
import CustomErrorMessage from "../CustomErrorMessage";
import ValidImages from "../ValidImages";
import { useSearchParams } from "react-router-dom";

const isImageSize = (files) => {
  const imageSize = 4 * 1024 * 1024; // 4MB
  return Array.isArray(files)
    ? files.every((file) => file.size <= imageSize)
    : files.size <= imageSize;
};

// const emptyMessageValue = "Message field does not have any text";

export default function MessageControl() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();

  const room_name = searchParams.get("room_name") || "";
  const sendMessage = useMessagesStore((state) => state.sendMessage);
  const lastMsgInChat = useMessagesStore((state) =>
    state.messages[room_name]?.at(-1)
  );
  const openedMessage = useMessagesStore((state) => state.openedMessage);
  const replyingTo = useMessagesStore((state) => state.replyingTo);
  const clearReplyingTo = useMessagesStore((state) => state.clearReplyingTo);
  const loading = useMessagesStore((state) => state.loading);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [validImages, setValidImages] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const textareaRef = useRef(null);

  const handleFileChange = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files);
    const validImageFiles = selectedFiles.filter(isImageSize);

    setValidImages(validImageFiles);

    if (validImageFiles.length < selectedFiles.length) {
      toast.info(`${largeFileText}`);
    }
  }, []);

  const onEmojiClick = useCallback((emojiObject) => {
    setMessage((prevText) => prevText + emojiObject.emoji);
  }, []);

  const renderEmojiGifPickers = useMemo(
    () => (
    <section className="fixed inset-0 w-full h-full z-[4000] flex items-center justify-center bg-transparent safe-area-p">
        <div
      className="bg-black/30 fixed inset-0 w-full h-full"
          onClick={() => {
            setShowEmojiPicker(false);
          }}
        />
        <div className="relative size-fit max-w-sm grid place-items-center m-10">
          <CloseButton
            onClick={() => {
              setShowEmojiPicker(false);
            }}
            className="absolute -right-8 -top-8 bg-white !text-xs !size-8"
          />
          {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
        </div>
      </section>
    ),
    [showEmojiPicker, onEmojiClick]
  );

  const handleSendMessage = useCallback(async () => {
    if (message.trim().length < 1 && !audioBlob && validImages.length < 1) {
      // setErrorMessage(emptyMessageValue);
      return;
    }

    try {
      const formData = new FormData();
      const recipientId = openedMessage?.other_user?.id;
      if (!recipientId) {
        console.error("Recipient ID is undefined");
        return;
      }
      formData.append("recipient", recipientId);
      formData.append("sender", currentUser?.id);
      formData.append("content", message);
      if (replyingTo?.id) formData.append("reply_to", String(replyingTo.id));
      if (audioBlob) {
        if (message.trim().length < 1)
          formData.append("content", "Audio conversation");
        formData.append(
          "audio_file",
          audioBlob,
          `voice-note-in-room_${currentUser?.id}_${
            openedMessage?.other_user?.id
          }-${new Date().getTime()}.webm`
        );
      }
      if (validImages && validImages.length > 0) {
        if (message.trim().length < 1)
          formData.append("content", "Sent with attachment");
        validImages.forEach((image) => {
          formData.append("images", image);
        });
      }

      const messageData = {
        recipient: Number(openedMessage?.other_user?.id),
        sender: Number(currentUser?.id),
        // MessageArea decides which side a bubble sits on from
        // `is_current_user` with no fallback, and the optimistic message did
        // not set it - so your own message appeared on the recipient's side
        // and jumped across once the server echoed it back. sender_info comes
        // along too, or the avatar and name are blank for that moment.
        is_current_user: true,
        sender_info: {
          id: currentUser?.id,
          first_name: currentUser?.first_name,
          last_name: currentUser?.last_name,
          avatar: currentUser?.avatar,
        },
        content:
          message.trim().length < 1
            ? audioBlob
              ? "Audio conversation"
              : validImages?.length > 0
                ? "Sent with attachment"
                : ""
            : message,
        images: validImages?.map((image) => URL.createObjectURL(image)) || [],
        audio: audioBlob ? URL.createObjectURL(audioBlob) : null,
        // Mirrors the server's reply_to_preview shape so the optimistic bubble
        // renders the quote identically. Without it the quote disappears for
        // the round-trip and comes back, which reads as a glitch.
        reply_to: replyingTo?.id ?? null,
        reply_to_preview: replyingTo
          ? {
              id: replyingTo.id,
              sender_id: replyingTo?.sender_info?.id ?? null,
              sender_name: getUserDisplayName(replyingTo?.sender_info) || null,
              is_deleted: false,
              content: replyingTo?.content ?? "",
              has_attachment: Boolean(
                replyingTo?.images?.length || replyingTo?.audio_file
              ),
            }
          : null,
      };

      // Cleared at send, not on success: a failed send leaves an error bubble
      // the user retries from, and leaving the bar armed would silently attach
      // this quote to whatever they type next.
      clearReplyingTo();

      setMessage("");
      setValidImages([]);
      setAudioBlob(null);
      setAudioURL(null);
      setErrorMessage(null);

      console.log("About to scroll to bottom", scrollToBottom);

      await sendMessage(room_name, formData, messageData);
    } catch (error) {
      console.error(error);
      toast.info("An error occurred while sending message");
    }
  }, [
    audioBlob,
    currentUser?.id,
    message,
    openedMessage?.other_user?.id,
    validImages,
    sendMessage,
    replyingTo,
    clearReplyingTo,
  ]);

  const handleInputChange = useCallback((e) => {
    const trimmedMessage = e.target.value.trim();
    if (trimmedMessage.length >= 1) {
      setErrorMessage(null);
    }
    // else if (trimmedMessage.length < 1) {
    //   // setErrorMessage(emptyMessageValue);
    //   return;
    // }
    setMessage(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        if (e.shiftKey) {
          setMessage((prevMessage) => prevMessage + "\n");
        } else {
          e.preventDefault();
          handleSendMessage();
        }
      }
    },
    [handleSendMessage]
  );

  const scrollToBottom = () => {
    const chatContainer = document.querySelector(".chat-container");

    if (chatContainer) {
      chatContainer.dataset.forced = "true";
      chatContainer.scrollTop = chatContainer.scrollHeight + 20;
    }
  };

  // Scroll chat to bottom if the messages newly added is sent by the current user
  useEffect(() => {
    if (lastMsgInChat?.optimistic) {
      scrollToBottom();
    }
    console.log("lastMsgInChat", lastMsgInChat);
  }, [lastMsgInChat]);

  useEffect(() => {
    const chatContainer = document.querySelector(".chat-container");

    chatContainer.onscroll = () => {
      setShowScrollDown(
        chatContainer.scrollTop + chatContainer.clientHeight <
          chatContainer.scrollHeight
      );
    };
    // scrollToBottom();
  }, []);

  // Auto-resize textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <section className="bg-white p-1 px-4 rounded-md flex flex-col gap-2 transition-all duration-300 sticky bottom-10 md:bottom-4">
      {/* <button onClick={() => scrollToBottom()}>Bottom</button> */}
      {/* valid images */}
      {validImages && (
        <ValidImages
          setValidImages={setValidImages}
          validImages={validImages}
          header="Attachment"
        />
      )}
      {/* What you are replying to. Sits directly above the composer so the
          context stays visible while typing. */}
      {replyingTo && (
        <div className="flex items-center gap-2 mb-1 px-2 py-1.5 bg-gray-50 border-l-[3px] border-gold rounded">
          <div className="flex-1 min-w-0">
            <p className="text-[.65rem] font-bold text-[#7a6320]">
              Replying to{" "}
              {replyingTo?.sender_info?.id === currentUser?.id
                ? "yourself"
                : getUserDisplayName(replyingTo?.sender_info) || "them"}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {replyingTo?.content?.trim() ||
                (replyingTo?.images?.length || replyingTo?.audio_file
                  ? "Attachment"
                  : "")}
            </p>
          </div>
          <button
            type="button"
            onClick={clearReplyingTo}
            aria-label="Cancel reply"
            className="text-gray-400 hover:text-gray-700 shrink-0 px-1"
          >
            &times;
          </button>
        </div>
      )}

      <section className="flex items-end gap-2">
        {showEmojiPicker && renderEmojiGifPickers}
        <ChooseAttachment handleFileChange={handleFileChange} />
        {audioURL ? (
          <VoiceNotePlayer
            audioURL={audioURL}
            trashOnClick={() => {
              setAudioURL(null);
              setAudioBlob(null);
            }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm border-0 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed scrollbar-hidden resize-none bg-transparent max-h-32 rounded-md transition-all duration-300 py-2"
            placeholder="Type a message here..."
            disabled={loading}
          />
        )}
        <div className="flex items-center">
          {/* <ButtonWithTooltipIcon
            IconName={SmileFilled}
            onClick={() => setShowEmojiPicker(true)}
            tip="Emoji"
            className="hover:!bg-gray-100 !text-black p-2 rounded-full mx-2"
            disabled={loading}
          /> */}
          {/* <VoiceNoteRecorderIcon
            setAudioURL={setAudioURL}
            setAudioBlob={setAudioBlob}
          /> */}
          <ButtonWithTooltipIcon
            IconName={PaperPlaneIcon}
            className="!bg-black !text-gray-300 p-1.5 rounded-full"
            iconClassName="size-3.5 hover:!rotate-[-40deg] transition-all duration-300"
            tip="Send"
            onClick={handleSendMessage}
            disabled={loading}
          />

          {showScrollDown && (
            <ButtonWithTooltipIcon
              IconName={ArrowDownIcon}
              tip="scroll down"
              onClick={scrollToBottom}
              className="!bg-black !text-white ml-2 hover:bg-gray-200 rounded-full p-1.5"
            />
          )}
        </div>
      </section>
      {/* {sendMessageMutation.isPending ? (
        <p className="text-gray-700 text-xs animate-pulse">Sending message</p>
      ) : (
      )} */}
      <CustomErrorMessage errorMessage={errorMessage} />
    </section>
  );
}

export const VoiceNoteRecorderIcon = ({ setAudioBlob, setAudioURL }) => {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const formatTime = (time) => {
    if (!time) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    setAudioURL(null);
    setAudioBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setAudioBlob(audioBlob);
      };

      audioChunks.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      const id = setInterval(() => {
        setRecordingDuration((prevDuration) => prevDuration + 1);
      }, 1000);
      setIntervalId(id);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, [setAudioBlob, setAudioURL]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(intervalId);
    setRecordingDuration(0);
  }, [intervalId]);

  return (
    <ButtonWithTooltipIcon
      IconName={isRecording ? MicExternalOn : Mic}
      text={isRecording ? formatTime(recordingDuration) : ""}
      tip={isRecording ? "Recording" : "Voice note"}
      onClick={isRecording ? stopRecording : startRecording}
      className="hover:!bg-gray-100 !text-black p-2 rounded-full mr-1.5"
      thisKey="recorder"
    />
  );
};

export const VoiceNotePlayer = ({ audioURL, className, trashOnClick }) => {
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const dataArrayRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [waveData, setWaveData] = useState(new Array(30).fill(5));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.crossOrigin = "anonymous"; // Ensure CORS
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current?.duration || 0);
      };
    }
  }, [audioURL]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      cancelAnimationFrame(animationFrameRef?.current);
    } else {
      audioRef.current.play();
      startAudioAnalysis();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const updateProgress = useCallback(() => {
    if (!audioRef.current) return;

    const newProgress =
      (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100;
    setProgress(newProgress);
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  }, []);

  const changeSpeed = useCallback(() => {
    const newSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  }, [speed]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const startAudioAnalysis = () => {
    if (!audioRef.current) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    if (!sourceRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(
        audioRef.current
      );
    }

    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 64;
    const bufferLength = analyserRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    const analyzeAudio = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const newWaveData = Array.from(dataArrayRef.current)
        .slice(0, 30)
        .map((val) => (val / 255) * 25 + 5);

      setWaveData(newWaveData);
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };

    analyzeAudio();
  };

  return (
    <div
      className={`${className} flex-1 flex flex-col gap-1 p-2 overflow-hidden`}
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="text-gold flex items-center gap-1"
        >
          <span className="sr-only text-xs">
            {isPlaying ? "Pause" : "Play"}
          </span>
          {isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
        </button>

        {/* Waveform Visualization */}
        <div className="flex-1 flex items-center gap-x-1 h-5">
          {waveData.map((height, index) => (
            <div
              key={index}
              className={`w-1 rounded transition-all duration-300 ${
                index < Math.floor((progress / 100) * waveData.length)
                  ? "bg-gold"
                  : "bg-gray-200"
              }`}
              style={{ height: `${(height / 30) * 100}%` }}
            />
          ))}
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={audioURL}
          onTimeUpdate={updateProgress}
          onEnded={() => {
            setIsPlaying(false);
            cancelAnimationFrame(animationFrameRef?.current);
          }}
          crossOrigin="anonymous" // Ensures CORS
        />
      </div>

      {/* Timer & Speed Control */}
      <div className="flex items-center justify-between">
        <span className="text-[.6rem] text-gray-600">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex gap-2">
          {/* Speed Control Button */}
          <button
            onClick={changeSpeed}
            className="text-black !text-[.55rem] bg-gold rounded-full size-5 hover:bg-opacity-70 transition-all duration-300"
          >
            {speed}x
          </button>
          {trashOnClick && (
            <ButtonWithTooltipIcon
              onClick={trashOnClick}
              IconName={TrashIcon}
              tip="Delete voice note"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const iconButtons = [
  { Icon: CameraIcon, tip: "camera", label: "Camera" },
  { Icon: ImageIcon, tip: "image", label: "Image" },
  { Icon: FileIcon, tip: "document", label: "Document" },
  { Icon: MusicNote, tip: "audio", label: "Audio" },
  { Icon: PersonIcon, tip: "profile", label: "Contact" },
];

export const ChooseAttachment = ({ handleFileChange }) => {
  const handleClick = (tip) => {
    const input = document.getElementById(tip);
    if (input) input.click();
  };

  return (
    <>
      {iconButtons.map((icons, idx) => {
        return (
          <input
            type="file"
            key={idx}
            name={icons.tip}
            id={icons.tip}
            multiple
            hidden
            onChange={handleFileChange}
          />
        );
      })}
      {/*  onClick={() => document.getElementById("attachment").click()} */}
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <div>
            <ButtonWithTooltipIcon
              IconName={PaperClipOutlined}
              tip="Attachment"
              className="hover:!bg-gray-100 !text-black p-2 rounded-full"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent w="15rem" p="4" bg="white" boxShadow="md">
          <PopoverArrow />
          <PopoverBody className="w-full min-h-40 bg-white rounded-md grid grid-cols-3 gap-4">
            {iconButtons.map(({ Icon, tip, label }, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <Button
                  bg="transparent"
                  className="hover:!bg-gray-100 !text-black p-2 rounded-full"
                  onClick={() => handleClick(tip)}
                  disabled={tip !== "image"}
                >
                  <Icon />
                </Button>
                <span
                  className="text-xs text-gray-700 cursor-pointer"
                  onClick={handleClick}
                >
                  {label}
                </span>
              </div>
            ))}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
};
