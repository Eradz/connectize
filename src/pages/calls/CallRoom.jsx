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

/**
 * Stands in for a camera that is off.
 *
 * A black rectangle is indistinguishable from a broken connection - the whole
 * question a caller is asking at that moment is "is this working?". A face
 * answers it.
 */
function AvatarTile({ person, size = "lg", className = "" }) {
  const name = [person?.first_name, person?.last_name].filter(Boolean).join(" ");
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const dimensions = size === "lg" ? "w-28 h-28 text-4xl" : "w-12 h-12 text-lg";

  return (
    <div className={`grid place-items-center ${className}`}>
      {person?.avatar ? (
        <img
          src={person.avatar}
          alt={name}
          className={`${dimensions} rounded-full object-cover border border-white/20`}
        />
      ) : (
        <div
          className={`${dimensions} rounded-full grid place-items-center bg-white/10 text-white font-semibold border border-white/20`}
        >
          {initial}
        </div>
      )}
    </div>
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
  failed: "The call could not be connected.",
};

const LOBBY_HEADING = {
  proposed: "Call invitation",
  accepted: "Your call",
  declined: "Call declined",
  cancelled: "Call cancelled",
  expired: "Invitation expired",
  completed: "Call finished",
  missed: "Call missed",
};

/**
 * Why Join is unavailable, in words that match the status on the card.
 *
 * This used to say "Both of you need to accept before this call can go ahead"
 * for every status that was not `accepted` - so a finished call was labelled
 * "Finished" and then told you to accept it. Two contradictory claims on one
 * screen is worse than either alone.
 */
function cannotJoinReason(call) {
  switch (call.status) {
    case "accepted":
      return call.join_blocked_reason === "window_closed"
        ? "This call's time has passed. Book another to talk again."
        : "You'll be able to join five minutes before it starts, and you'll be reminded ten minutes before.";
    case "proposed":
      return "Both of you need to accept before this call can go ahead.";
    case "declined":
      return "This call was declined.";
    case "cancelled":
      return "This call was cancelled.";
    case "expired":
      return "This invitation expired unanswered.";
    case "completed":
      return "This call has already taken place. Book another to talk again.";
    case "missed":
      return "Nobody joined this call in time. Book another to talk again.";
    default:
      return "This call cannot be joined.";
  }
}

export default function CallRoom() {
  const { roomToken } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [joined, setJoined] = useState(false);

  const { data: call, isLoading, refetch } = useQuery({
    queryKey: ["calls", roomToken],
    queryFn: () => getCall(roomToken),
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
          {LOBBY_HEADING[call.status] || "Call"}
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
          <p className="text-sm text-gray-500">{cannotJoinReason(call)}</p>
        )}
      </div>
    );
  }

  return (
    <LiveCall
      call={call}
      selfId={user?.id}
      self={user}
      onLeave={() => {
        setJoined(false);
        refetch();
      }}
    />
  );
}

function LiveCall({ call, selfId, onLeave, self }) {
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
  } = useCallSignaling(call.room_token, { kind: call.kind, selfId });

  const isVideo = call.kind === "video";
  const notice = error || STATUS_COPY[status];
  // Their camera being off is not the same as their video not having arrived,
  // and both are different from an audio call - but all three want a face
  // rather than a black rectangle.
  const showRemoteVideo = isVideo && remoteStream && !peerState.cameraOff;
  // States a call cannot come back from. Offering mute and camera under an
  // error reads as though you are connected, and invites fiddling with a call
  // that is not going to happen.
  const isDeadEnd = ["failed", "refused", "window_closed"].includes(status);

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      <div className="flex-1 relative grid place-items-center">
        {showRemoteVideo ? (
          <Video
            stream={remoteStream}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-white/80 px-6">
            <AvatarTile person={call.other_party} className="mb-4" />
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
            nothing to show - including while their camera is off. */}
        {remoteStream && !showRemoteVideo && (
          <Video stream={remoteStream} className="hidden" />
        )}

        {isVideo && localStream && (
          <div className="absolute bottom-4 right-4 w-32 aspect-[3/4] rounded-lg border border-white/20 overflow-hidden bg-gray-800">
            {isCameraOff ? (
              <AvatarTile person={self} size="sm" className="w-full h-full" />
            ) : (
              <Video stream={localStream} muted className="w-full h-full object-cover" />
            )}
          </div>
        )}

        {showRemoteVideo && notice && (
          <p className="absolute top-4 left-4 text-sm text-white/80 bg-black/40 px-3 py-1 rounded">
            {notice}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 py-6 bg-black/40">
        {isDeadEnd ? (
          <button
            type="button"
            onClick={onLeave}
            className="px-7 py-3 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            Close
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
