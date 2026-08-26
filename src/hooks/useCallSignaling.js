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

/** How long to wait for the room to answer before calling it a failure. */
const JOIN_TIMEOUT_MS = 15000;

const MEDIA_FOR = {
  audio: { audio: true, video: false },
  video: { audio: true, video: true },
};

export default function useCallSignaling(roomToken, { kind = "video", selfId } = {}) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  //: peerId -> MediaStream, as an array for rendering.
  const [remoteStreams, setRemoteStreams] = useState([]);
  //: peerId -> { muted, cameraOff }
  const [peerStates, setPeerStates] = useState({});
  // Set once, on the first connection. Not reset when a peer drops and
  // rejoins - the meeting has been running since it started, and a timer that
  // restarts mid-call is worse than none.
  const [connectedAt, setConnectedAt] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Mirrors `status` so callbacks can read it synchronously. The close
  // handler has to know how far the call got before deciding what a closure
  // means.
  const statusRef = useRef("idle");
  const applyStatus = useCallback((next) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const socketRef = useRef(null);
  //: peerId -> { pc, pending } . Media is a mesh: three people means three
  //: connections, four means six. Everything below is keyed by who it is with.
  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);
  // Candidates can arrive before the remote description is set, and adding
  // one then throws. They are held here and flushed once the description
  // lands - without this the connection works on a fast network and fails
  // intermittently on a slow one, which is the worst way for it to fail.
  const teardownRef = useRef(() => {});

  const send = useCallback((event, payload = {}, toUserId = null) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      // `toUserId` is what keeps a room of four from three people answering
      // one offer. Null means everyone, which is right for hangup and
      // media_state.
      socket.send(JSON.stringify({ event, payload, toUserId }));
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
    let joinTimer;

    const teardown = () => {
      if (joinTimer) clearTimeout(joinTimer);
      socketRef.current?.close();
      socketRef.current = null;
      peersRef.current.forEach(({ pc }) => pc.close());
      peersRef.current.clear();
      stopLocalMedia();
      setRemoteStreams([]);
      setPeerStates({});
    };
    teardownRef.current = teardown;

    async function start() {
      applyStatus("joining");
      setError(null);

      const details = await joinCall(roomToken);
      if (cancelled) return;
      if (!details) {
        // The server refused and has already explained why in a toast; the
        // page re-reads the call to show the reason in place.
        applyStatus("refused");
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
        applyStatus("failed");
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      localStreamRef.current = stream;
      setLocalStream(stream);

      /**
       * One connection per peer, made on demand.
       *
       * Everything that used to be a single object is now keyed by who it is
       * with: the connection, the queued candidates, the remote stream. That
       * is the whole of what makes a mesh different from a pair.
       */
      const peerFor = (peerId) => {
        const existing = peersRef.current.get(peerId);
        if (existing) return existing;

        const pc = new RTCPeerConnection({ iceServers: details.iceServers });
        const entry = { pc, pending: [] };
        peersRef.current.set(peerId, entry);

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          const incoming = event.streams[0];
          setRemoteStreams((current) => [
            ...current.filter((r) => r.userId !== peerId),
            { userId: peerId, stream: incoming },
          ]);
        };
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            send("ice_candidate", { candidate: event.candidate }, peerId);
          }
        };
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            applyStatus("connected");
            setConnectedAt((current) => current ?? Date.now());
          }
          if (pc.connectionState === "failed") {
            // One peer failing is not the call failing when there are three
            // of you, so drop that connection and leave the rest alone.
            dropPeer(peerId);
            if (peersRef.current.size === 0) {
              setError("Could not connect. Your network may be blocking calls.");
              applyStatus("failed");
            }
          }
        };
        return entry;
      };

      const dropPeer = (peerId) => {
        const entry = peersRef.current.get(peerId);
        if (!entry) return;
        entry.pc.close();
        peersRef.current.delete(peerId);
        setRemoteStreams((current) => current.filter((r) => r.userId !== peerId));
        setPeerStates((current) => {
          const next = { ...current };
          delete next[peerId];
          return next;
        });
      };

      const token = getSession()?.tokens?.access;
      const socket = new WebSocket(details.signaling_url, [
        `access_token.${token}`,
      ]);
      socketRef.current = socket;

      // A socket that neither opens nor closes leaves no event to react to,
      // and the screen would sit on "Joining…" indefinitely.
      const joinTimer = setTimeout(() => {
        if (statusRef.current === "joining") {
          setError("Could not reach the call. Check your connection and try again.");
          applyStatus("failed");
          teardown();
        }
      }, JOIN_TIMEOUT_MS);

      const makeOffer = async (peerId) => {
        const { pc } = peerFor(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        send("offer", { sdp: pc.localDescription }, peerId);
      };

      const flushCandidates = async (peerId) => {
        const entry = peersRef.current.get(peerId);
        if (!entry) return;
        const queued = entry.pending;
        entry.pending = [];
        for (const candidate of queued) {
          try {
            await entry.pc.addIceCandidate(candidate);
          } catch {
            // A candidate that no longer applies is not fatal; ICE will use
            // the others.
          }
        }
      };

      // Lower id offers. Applied per pair rather than once: in a room of
      // three, each pair settles who calls whom on its own, which is what
      // stops two people offering to each other simultaneously.
      const shouldOffer = (peerId) => Number(selfId) < Number(peerId);

      socket.onmessage = async (raw) => {
        const message = JSON.parse(raw.data);
        const from = message.fromUserId;

        switch (message.event) {
          case "joined": {
            clearTimeout(joinTimer);
            const present = message.peers || [];
            applyStatus(present.length ? "connecting" : "waiting");
            // Offer to everyone already here that we out-rank.
            for (const peerId of present) {
              if (shouldOffer(peerId)) await makeOffer(peerId);
            }
            break;
          }
          case "peer_joined": {
            applyStatus("connecting");
            if (shouldOffer(from)) await makeOffer(from);
            break;
          }
          case "offer": {
            const { pc } = peerFor(from);
            await pc.setRemoteDescription(message.payload.sdp);
            await flushCandidates(from);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            send("answer", { sdp: pc.localDescription }, from);
            break;
          }
          case "answer": {
            const entry = peersRef.current.get(from);
            if (!entry) break;
            await entry.pc.setRemoteDescription(message.payload.sdp);
            await flushCandidates(from);
            break;
          }
          case "ice_candidate": {
            const entry = peerFor(from);
            const candidate = message.payload.candidate;
            if (!entry.pc.remoteDescription) {
              entry.pending.push(candidate);
            } else {
              try {
                await entry.pc.addIceCandidate(candidate);
              } catch {
                /* stale candidate */
              }
            }
            break;
          }
          case "media_state": {
            setPeerStates((current) => ({
              ...current,
              [from]: {
                muted: Boolean(message.payload.muted),
                cameraOff: Boolean(message.payload.cameraOff),
              },
            }));
            break;
          }
          case "hangup":
          case "peer_left": {
            dropPeer(from);
            // Only the last person leaving ends the call. With three of you,
            // one hanging up is someone leaving the room, not the end.
            if (peersRef.current.size === 0) {
              applyStatus(message.event === "hangup" ? "ended" : "waiting");
            }
            break;
          }
          case "window_closed": {
            applyStatus("window_closed");
            break;
          }
          default:
            break;
        }
      };

      socket.onclose = (event) => {
        clearTimeout(joinTimer);
        const known = CLOSE_CODES[event.code];
        if (known) {
          setError(known.message);
          applyStatus(known.key);
        } else if (
          statusRef.current === "connected" ||
          statusRef.current === "connecting"
        ) {
          applyStatus("ended");
        } else {
          // Closed before the call ever got going. This branch used to leave
          // the status untouched, so an unrecognised close - a plain 1006,
          // say - left the screen on "Joining…" for ever, with the socket
          // already torn down and no way back.
          setError("Lost the connection before the call could start.");
          applyStatus("failed");
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
      remoteStreams,
      peerStates,
      connectedAt,
      isMuted,
      isCameraOff,
      toggleMute,
      toggleCamera,
      hangUp,
    }),
    [
      status, error, localStream, remoteStreams, peerStates, connectedAt,
      isMuted, isCameraOff, toggleMute, toggleCamera, hangUp,
    ]
  );
}
