import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeftRounded } from "@mui/icons-material";
import { webRoutes } from "../../lib/webRoutes";
import { Button, Spinner } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MicOffRounded,
  MicRounded,
  VideocamOffRounded,
  VideocamRounded,
  CallEndRounded,
} from "@mui/icons-material";
import { getCall, remindParticipants } from "../../api-services/calls";
import useCallSignaling from "../../hooks/useCallSignaling";
import { useAuth } from "../../context/userContext";
import CallCard from "../../components/calls/CallCard";
import CallParticipants from "../../components/calls/CallParticipants";

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


/**
 * Lets the self view be dragged out of the way.
 *
 * It sits over the other person's face, and which corner is "out of the way"
 * depends on where they are standing - so this is a real need rather than a
 * flourish. Position is held as an offset from the resting corner and clamped
 * to the stage, so the tile can never be dragged somewhere it cannot be
 * dragged back from.
 *
 * Pointer events rather than mouse/touch pairs, and pointer capture so a fast
 * drag that leaves the tile keeps tracking instead of stopping dead.
 */
function useDraggable(stageRef) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef(null);

  const clamp = useCallback(
    (next) => {
      const stage = stageRef.current;
      const tile = dragState.current?.tile;
      if (!stage || !tile) return next;

      const bounds = stage.getBoundingClientRect();
      const size = tile.getBoundingClientRect();
      // The tile rests at bottom-right, so travel is negative-only: left and
      // up from where it starts.
      const minX = -(bounds.width - size.width - 16 * 2);
      const minY = -(bounds.height - size.height - 16 * 2);
      return {
        x: Math.min(0, Math.max(minX, next.x)),
        y: Math.min(0, Math.max(minY, next.y)),
      };
    },
    [stageRef],
  );

  const onPointerDown = useCallback(
    (event) => {
      const tile = event.currentTarget;
      tile.setPointerCapture?.(event.pointerId);
      dragState.current = {
        tile,
        startX: event.clientX,
        startY: event.clientY,
        origin: offset,
      };
    },
    [offset],
  );

  const onPointerMove = useCallback(
    (event) => {
      const drag = dragState.current;
      if (!drag) return;
      event.preventDefault();
      setOffset(
        clamp({
          x: drag.origin.x + (event.clientX - drag.startX),
          y: drag.origin.y + (event.clientY - drag.startY),
        }),
      );
    },
    [clamp],
  );

  const onPointerUp = useCallback((event) => {
    dragState.current?.tile?.releasePointerCapture?.(event.pointerId);
    dragState.current = null;
  }, []);

  return {
    offset,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}

/** One other person: their video, or their face when there is no video. */
function PeerTile({ peer, isVideo }) {
  const showVideo = isVideo && peer.stream && !peer.cameraOff;
  const name = [peer.person?.first_name, peer.person?.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-800 grid place-items-center min-h-[8rem]">
      {showVideo ? (
        <Video stream={peer.stream} className="w-full h-full object-cover" />
      ) : (
        <div className="text-center text-white/80 px-4">
          <AvatarTile person={peer.person} className="mb-3" />
          <p className="font-semibold">{name || "Connectize user"}</p>
          {!peer.stream && (
            <p className="text-xs mt-1 text-white/50">
              {peer.invite === "accepted" ? "Not here yet" : "Hasn't replied"}
            </p>
          )}
        </div>
      )}

      {/* Audio plays whether or not there is a picture. */}
      {peer.stream && !showVideo && <Video stream={peer.stream} className="hidden" />}

      <div className="absolute bottom-2 left-2 flex items-center gap-2 text-xs text-white bg-black/40 px-2 py-1 rounded">
        <span>{name || "Connectize user"}</span>
        {peer.muted && <MicOffRounded fontSize="inherit" />}
      </div>
    </div>
  );
}

/** Elapsed time, so people know how far into a booked hour they are. */
function CallTimer({ since }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const seconds = Math.max(0, Math.floor((now - since) / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const pad = (value) => String(value).padStart(2, "0");

  return (
    <span className="tabular-nums">
      {hours > 0 ? `${hours}:${pad(minutes % 60)}` : minutes}:{pad(seconds % 60)}
    </span>
  );
}

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
  const outstanding = call.awaiting_response_from?.length ?? 0;

  switch (call.status) {
    case "accepted":
      if (call.join_blocked_reason === "window_closed") {
        return "This call's time has passed. Book another to talk again.";
      }
      // Your own answer first: a confirmed call you have not accepted is
      // waiting on *you*, and telling you when it opens instead is unhelpful.
      if (call.my_response === "invited") {
        return "Accept the invitation and you can join when it starts.";
      }
      if (call.my_response === "declined") {
        return "You declined this call.";
      }
      return "You'll be able to join five minutes before it starts, and you'll be reminded ten minutes before.";
    case "proposed":
      if (call.my_response === "invited") {
        return "Accept the invitation and you can join when it starts.";
      }
      // Said "both of you" on a call of four, which was simply untrue.
      return outstanding === 1
        ? "Waiting for the other person to accept."
        : `Waiting for ${outstanding} people to accept.`;
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
  const queryClient = useQueryClient();

  const { data: call, isLoading, refetch } = useQuery({
    queryKey: ["calls", roomToken],
    queryFn: () => getCall(roomToken),
    // The join window opens and closes on its own, so a card left open on
    // screen has to notice without the user reloading.
    refetchInterval: joined ? false : 30_000,
  });

  const remind = useMutation({
    mutationFn: (userIds) => remindParticipants(roomToken, userIds),
    onSettled: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["calls"] });
    },
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
      <div className="p-6 text-center">
        <p className="text-gray-700">This call is no longer available.</p>
        <Button
          className="mt-3"
          size="sm"
          onClick={() => navigate(webRoutes.calls)}
        >
          Back to calls
        </Button>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="p-4 flex flex-col gap-4">
        {/* The detail is reached from the diary and from notifications, and
            had no way out of either. */}
        <Link
          to={webRoutes.calls}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 w-fit"
        >
          <ChevronLeftRounded fontSize="small" />
          <span>Calls</span>
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">
          {LOBBY_HEADING[call.status] || "Call"}
        </h1>
        {/* The card runs its own accept/decline/cancel mutations, so it is
            actionable here without being handed anything.

            Without its Join button, though: it links to this very page, so
            here it was a second gold button directly above "Join now" that
            navigated to the URL already open and appeared to do nothing.
            Entering the call is what "Join now" below is for. */}
        <CallCard call={call} selfId={user?.id} showJoin={false} />
        <CallParticipants
          call={call}
          selfId={user?.id}
          busy={remind.isPending}
          onRemind={(ids) => remind.mutate(ids)}
        />

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
    remoteStreams,
    peerStates,
    connectedAt,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    hangUp,
  } = useCallSignaling(call.room_token, { kind: call.kind, selfId });

  const isVideo = call.kind === "video";
  const notice = error || STATUS_COPY[status];
  const isDeadEnd = ["failed", "refused", "window_closed"].includes(status);
  const stageRef = useRef(null);
  const selfView = useDraggable(stageRef);

  // Everyone on the call except us, whether or not their media has arrived.
  // Driving the grid from the *booking* rather than from the streams means a
  // person who has not connected yet still has a tile with their name on it,
  // instead of appearing from nowhere when their video lands.
  const others = (call.participants || [])
    .filter((p) => p.user?.id !== selfId && p.status !== "declined")
    .map((p) => {
      const media = remoteStreams.find((r) => Number(r.userId) === p.user.id);
      const state = peerStates[p.user.id] || {};
      return {
        person: p.user,
        invite: p.status,
        stream: media?.stream || null,
        muted: Boolean(state.muted),
        cameraOff: Boolean(state.cameraOff),
      };
    });

  // Two people is a face filling the screen; more is a grid. Same components
  // either way, only the layout differs.
  const columns = others.length > 1 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      <div ref={stageRef} className="flex-1 relative p-2">
        <div className={`grid ${columns} gap-2 w-full h-full`}>
          {others.map((peer) => (
            <PeerTile key={peer.person.id} peer={peer} isVideo={isVideo} />
          ))}
          {others.length === 0 && (
            <div className="grid place-items-center text-white/70">
              <p>No one else is on this call.</p>
            </div>
          )}
        </div>

        <div className="absolute top-4 left-4 flex items-center gap-1.5">
          {connectedAt !== null && (
            <span className="text-sm text-white/75 bg-black/40 px-3 py-1 rounded">
              <CallTimer since={connectedAt} />
            </span>
          )}
          {notice && (
            <span className="text-sm text-white/80 bg-black/40 px-3 py-1 rounded">
              {notice}
            </span>
          )}
        </div>

        {isVideo && localStream && (
          <div
            {...selfView.handlers}
            style={{
              transform: `translate(${selfView.offset.x}px, ${selfView.offset.y}px)`,
            }}
            className="absolute bottom-4 right-4 w-32 aspect-[3/4] rounded-lg border border-white/20 overflow-hidden bg-gray-800 cursor-grab active:cursor-grabbing touch-none select-none"
          >
            {isCameraOff ? (
              <AvatarTile person={self} size="sm" className="w-full h-full" />
            ) : (
              <Video stream={localStream} muted className="w-full h-full object-cover" />
            )}
          </div>
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
