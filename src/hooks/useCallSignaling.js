import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSession } from "../lib/session";
import { joinCall } from "../api-services/calls";

/**
 * Drives one leg of a scheduled call: the signalling socket and the peer
 * connection behind it.
 *
 * Two decisions in here are worth knowing before changing anything.
 *
 * **Who offers.** The participant with the lower user id creates the offer,
 * once it knows the other side is present. A fixed rule rather than
 * "whoever arrives second" because both parties can arrive in the same
 * instant, each seeing an empty room, and then both wait forever. It also
 * avoids glare - two offers crossing - without needing rollback.
 *
 * **Credentials are not cached.** `joinCall` is called every time this hook
 * mounts, because the server will refuse it outside the booked window and
 * because TURN credentials expire. A cached room token would let a client
 * try to reconnect to a call that was cancelled while it was away.
 */

// Application close codes from calls/signaling.py. Each says something
// different to the user, so they are not collapsed into "disconnected".
export const CLOSE_CODES = {
  4001: {
    key: "superseded",
    message: "You joined this call on another device.",
  },
  4401: { key: "unauthenticated", message: "Please sign in again." },
  4403: { key: "not_a_participant", message: "This call is not yours to join." },
  4404: { key: "unknown_room", message: "This call no longer exists." },
  4409: {
    key: "not_accepted",
    message: "This call is not confirmed by both sides.",
  },
  4410: { key: "window_closed", message: "The call's time has passed." },
  4425: { key: "too_early", message: "This call hasn't started yet." },
};

const MEDIA_FOR = {
  audio: { audio: true, video: false },
  video: { audio: true, video: true },
};

export default function useCallSignaling(roomToken, { kind = "video", selfId } = {}) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerState, setPeerState] = useState({ muted: false, cameraOff: false });
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  // Candidates can arrive before the remote description is set, and adding
  // one then throws. They are held here and flushed once the description
  // lands - without this the connection works on a fast network and fails
  // intermittently on a slow one, which is the worst way for it to fail.
  const pendingCandidatesRef = useRef([]);
  const teardownRef = useRef(() => {});

  const send = useCallback((event, payload = {}) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, payload }));
    }
  }, []);

  const stopLocalMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const hangUp = useCallback(
    (reason = "ended") => {
      send("hangup");
      teardownRef.current();
      setStatus(reason);
    },
    [send]
  );

  useEffect(() => {
    if (!roomToken) return undefined;

    let cancelled = false;

    const teardown = () => {
      socketRef.current?.close();
      socketRef.current = null;
      peerRef.current?.close();
      peerRef.current = null;
      pendingCandidatesRef.current = [];
      stopLocalMedia();
      setRemoteStream(null);
    };
    teardownRef.current = teardown;

    async function start() {
      setStatus("joining");
      setError(null);

      const details = await joinCall(roomToken);
      if (cancelled) return;
      if (!details) {
        // The server refused and has already explained why in a toast; the
        // page re-reads the call to show the reason in place.
        setStatus("refused");
        return;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(
          MEDIA_FOR[kind] || MEDIA_FOR.video
        );
      } catch (mediaError) {
        setError(
          mediaError?.name === "NotAllowedError"
            ? "Connectize needs access to your microphone" +
              (kind === "video" ? " and camera" : "") +
              " for this call."
            : "No microphone was available."
        );
        setStatus("failed");
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      localStreamRef.current = stream;
      setLocalStream(stream);

      const peer = new RTCPeerConnection({ iceServers: details.iceServers });
      peerRef.current = peer;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => setRemoteStream(event.streams[0]);
      peer.onicecandidate = (event) => {
        if (event.candidate) send("ice_candidate", { candidate: event.candidate });
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "connected") setStatus("connected");
        if (peer.connectionState === "failed") {
          // Reached when even the relay could not carry the media. Nothing
          // the user can do about it, so say so rather than spinning.
          setError("Could not connect. Your network may be blocking calls.");
          setStatus("failed");
        }
      };

      const token = getSession()?.tokens?.access;
      const socket = new WebSocket(details.signaling_url, [
        `access_token.${token}`,
      ]);
      socketRef.current = socket;

      const makeOffer = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        send("offer", { sdp: peer.localDescription });
      };

      const flushCandidates = async () => {
        const queued = pendingCandidatesRef.current;
        pendingCandidatesRef.current = [];
        for (const candidate of queued) {
          try {
            await peer.addIceCandidate(candidate);
          } catch {
            // A candidate that no longer applies is not fatal; ICE will use
            // the others.
          }
        }
      };

      // Lower id offers. See the note at the top of this file.
      const shouldOffer = (peerId) => Number(selfId) < Number(peerId);

      socket.onmessage = async (raw) => {
        const message = JSON.parse(raw.data);

        switch (message.event) {
          case "joined": {
            setStatus(message.peerPresent ? "connecting" : "waiting");
            if (message.peerPresent) {
              const other = details.call?.other_party?.id;
              if (shouldOffer(other)) await makeOffer();
            }
            break;
          }
          case "peer_joined": {
            setStatus("connecting");
            if (shouldOffer(message.fromUserId)) await makeOffer();
            break;
          }
          case "offer": {
            await peer.setRemoteDescription(message.payload.sdp);
            await flushCandidates();
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            send("answer", { sdp: peer.localDescription });
            break;
          }
          case "answer": {
            await peer.setRemoteDescription(message.payload.sdp);
            await flushCandidates();
            break;
          }
          case "ice_candidate": {
            const candidate = message.payload.candidate;
            if (!peer.remoteDescription) {
              pendingCandidatesRef.current.push(candidate);
            } else {
              try {
                await peer.addIceCandidate(candidate);
              } catch {
                /* stale candidate */
              }
            }
            break;
          }
          case "media_state": {
            setPeerState({
              muted: Boolean(message.payload.muted),
              cameraOff: Boolean(message.payload.cameraOff),
            });
            break;
          }
          case "hangup":
          case "peer_left": {
            setRemoteStream(null);
            setStatus(message.event === "hangup" ? "ended" : "waiting");
            break;
          }
          case "window_closed": {
            setStatus("window_closed");
            break;
          }
          default:
            break;
        }
      };

      socket.onclose = (event) => {
        const known = CLOSE_CODES[event.code];
        if (known) {
          setError(known.message);
          setStatus(known.key);
        } else if (peerRef.current) {
          setStatus((current) =>
            current === "connected" || current === "connecting" ? "ended" : current
          );
        }
        teardown();
      };
    }

    start();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [roomToken, kind, selfId, send, stopLocalMedia]);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
    setIsMuted(next);
    send("media_state", { muted: next, cameraOff: isCameraOff });
  }, [isMuted, isCameraOff, send]);

  const toggleCamera = useCallback(() => {
    const next = !isCameraOff;
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !next));
    setIsCameraOff(next);
    send("media_state", { muted: isMuted, cameraOff: next });
  }, [isMuted, isCameraOff, send]);

  return useMemo(
    () => ({
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
    }),
    [
      status, error, localStream, remoteStream, peerState,
      isMuted, isCameraOff, toggleMute, toggleCamera, hangUp,
    ]
  );
}
