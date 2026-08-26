import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import {
  MicOffRounded,
  MicRounded,
  VideocamOffRounded,
  VideocamRounded,
  CallEndRounded,
} from "@mui/icons-material";
import { getCall } from "../../api-services/calls";
import useCallSignaling from "../../hooks/useCallSignaling";
import { useAuth } from "../../context/userContext";
import CallCard from "../../components/calls/CallCard";

/**
 * The call itself.
 *
 * Media does not start until the user presses Join. Opening a microphone
 * because someone followed a link from a notification would be a surprise,
 * and the browser permission prompt lands better when it follows a
 * deliberate act.
 */

function Video({ stream, muted, className }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.srcObject !== stream) {
      ref.current.srcObject = stream || null;
    }
  }, [stream]);

  return (
    <video ref={ref} autoPlay playsInline muted={muted} className={className} />
  );
}

const STATUS_COPY = {
  joining: "Joining…",
  waiting: "Waiting for them to join…",
  connecting: "Connecting…",
  connected: null,
  ended: "Call ended.",
  window_closed: "The call's time is up.",
  refused: "This call can't be joined right now.",
};

export default function CallRoom() {
  const { callId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [joined, setJoined] = useState(false);

  const { data: call, isLoading, refetch } = useQuery({
    queryKey: ["calls", callId],
    queryFn: () => getCall(callId),
    // The join window opens and closes on its own, so a card left open on
    // screen has to notice without the user reloading.
    refetchInterval: joined ? false : 30_000,
  });

  if (isLoading) {
    return (
      <div className="grid place-items-center h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <p className="text-gray-700">This call is no longer available.</p>
        <Button className="mt-3" size="sm" onClick={() => navigate("/messages")}>
          Back to messages
        </Button>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {call.status === "accepted" ? "Your call" : "Call invitation"}
        </h1>
        <CallCard call={call} />
        {call.can_join ? (
          <Button
            className="!bg-gold !text-black"
            onClick={() => setJoined(true)}
          >
            Join now
          </Button>
        ) : (
          <p className="text-sm text-gray-500">
            {call.status === "accepted"
              ? "You'll be able to join five minutes before it starts, and you'll be reminded ten minutes before."
              : "Both of you need to accept before this call can go ahead."}
          </p>
        )}
      </div>
    );
  }

  return (
    <LiveCall
      call={call}
      selfId={user?.id}
      onLeave={() => {
        setJoined(false);
        refetch();
      }}
    />
  );
}

function LiveCall({ call, selfId, onLeave }) {
  const {
    status,
    error,
    localStream,
    remoteStream,
    peerState,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    hangUp,
  } = useCallSignaling(call.id, { kind: call.kind, selfId });

  const isVideo = call.kind === "video";
  const notice = error || STATUS_COPY[status];

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      <div className="flex-1 relative grid place-items-center">
        {remoteStream && isVideo ? (
          <Video
            stream={remoteStream}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-white/80 px-6">
            <p className="text-lg font-semibold">
              {[call.other_party?.first_name, call.other_party?.last_name]
                .filter(Boolean)
                .join(" ")}
            </p>
            {notice && <p className="text-sm mt-2 text-white/60">{notice}</p>}
            {peerState.muted && (
              <p className="text-xs mt-1 text-white/50">They're muted</p>
            )}
          </div>
        )}

        {/* Audio still has to be attached to an element to play, even with
            nothing to show. */}
        {remoteStream && !isVideo && (
          <Video stream={remoteStream} className="hidden" />
        )}

        {isVideo && localStream && (
          <Video
            stream={localStream}
            muted
            className="absolute bottom-4 right-4 w-32 rounded-lg border border-white/20 object-cover"
          />
        )}

        {remoteStream && isVideo && notice && (
          <p className="absolute top-4 left-4 text-sm text-white/80 bg-black/40 px-3 py-1 rounded">
            {notice}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 py-6 bg-black/40">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
          className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          {isMuted ? <MicOffRounded /> : <MicRounded />}
        </button>

        {isVideo && (
          <button
            type="button"
            onClick={toggleCamera}
            aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            {isCameraOff ? <VideocamOffRounded /> : <VideocamRounded />}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            hangUp();
            onLeave();
          }}
          aria-label="Leave call"
          className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
        >
          <CallEndRounded />
        </button>
      </div>
    </div>
  );
}
