import { Avatar, Button, Spinner } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  acceptCall,
  cancelCall,
  declineCall,
} from "../../api-services/calls";

/**
 * One booking, with whatever the viewer can do about it right now.
 *
 * Every button here is driven by fields the server computed - `is_my_turn`,
 * `can_join`, `join_blocked_reason` - rather than by re-deriving the rules
 * from status and timestamps. Three clients re-implementing the consent gate
 * is three chances to offer a Join button the socket will refuse, and the
 * refusal would arrive after the user had already committed to the call.
 */

const STATUS_LABELS = {
  proposed: "Awaiting a reply",
  accepted: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
  expired: "Expired unanswered",
  completed: "Finished",
  missed: "Missed",
};

const STATUS_TONE = {
  accepted: "text-green-700 bg-green-50",
  proposed: "text-amber-700 bg-amber-50",
  completed: "text-gray-600 bg-gray-100",
};

/** Why Join is unavailable, in words the user can act on. */
const BLOCKED_COPY = {
  too_early: (call) => `Opens ${formatTime(call.join_opens_at)}`,
  not_accepted: () => "Not confirmed yet",
  window_closed: () => "This time has passed",
  not_a_participant: () => "",
};

function formatTime(value) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatWhen(value) {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? `Today, ${formatTime(date)}`
    : date.toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
}

/**
 * The people on a call, as faces.
 *
 * Up to three overlapping avatars. A group call used to show a single letter
 * taken from the concatenated names - a circle with an "L" in it, which
 * identified nobody. Real photographs are the fastest way to know whose call
 * this is, and they are already loaded.
 */
function FaceStack({ people }) {
  const shown = people.slice(0, 3);
  const extra = people.length - shown.length;
  const size = shown.length > 1 ? "28px" : "40px";

  if (shown.length === 0) {
    return <Avatar width="40px" height="40px" />;
  }

  return (
    <div className="flex items-center shrink-0">
      {shown.map((person, index) => (
        <Avatar
          key={person.id}
          src={person.avatar}
          name={[person.first_name, person.last_name].filter(Boolean).join(" ")}
          width={size}
          height={size}
          className={index > 0 ? "-ml-2.5 ring-2 ring-white" : ""}
        />
      ))}
      {extra > 0 && <span className="ml-1 text-[11px] text-gray-500">+{extra}</span>}
    </div>
  );
}

export default function CallCard({
  call,
  selfId,
  /** Opens the call's own page. The card can only show a count; the detail
   *  says which people are still to answer, which is the actionable half. */
  onOpen,
  onReschedule,
  onAddPeople,
  compact = false,
  /** Whether to offer the Join button.
   *
   *  Off inside the call room's own lobby, which is the page this button
   *  links to: there it rendered a second, identical-looking Join directly
   *  above the real one, and clicking it navigated to the URL already open -
   *  so it did nothing at all. The list is the place this button belongs,
   *  because there it is the only way in. */
  showJoin = true,
}) {
  const queryClient = useQueryClient();
  const other = call?.other_party;
  const participants = call?.participants || [];
  const isGroup = participants.length > 2;
  // Two people reads as a name; more reads as a list, because "Prosper +2"
  // tells you nothing about who the other two are.
  // Everyone but you. A group call has no single "other party", so the card
  // shows the faces of the people you would be talking to.
  const others = participants
    .map((p) => p.user)
    .filter((person) => person && person.id !== selfId);
  const groupNames = others
    .map((person) => person.first_name)
    .filter(Boolean)
    .join(", ");

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["calls"] });

  const accept = useMutation({ mutationFn: () => acceptCall(call.room_token), onSuccess: invalidate });
  const decline = useMutation({ mutationFn: () => declineCall(call.room_token), onSuccess: invalidate });
  const cancel = useMutation({ mutationFn: () => cancelCall(call.room_token), onSuccess: invalidate });

  const busy = accept.isPending || decline.isPending || cancel.isPending;
  const isOpen = !["declined", "cancelled", "expired", "completed", "missed"].includes(
    call.status
  );
  const blockedCopy = BLOCKED_COPY[call.join_blocked_reason]?.(call) ?? "";

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-3 flex gap-3 items-start">
      <FaceStack people={other ? [other] : others} />

      <div
        className={`flex-1 min-w-0 ${onOpen ? "cursor-pointer" : ""}`}
        onClick={onOpen ? () => onOpen(call) : undefined}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm text-gray-900 truncate">
            {[other?.first_name, other?.last_name].filter(Boolean).join(" ") ||
              groupNames ||
              "Connectize user"}
          </p>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              STATUS_TONE[call.status] || "text-gray-600 bg-gray-100"
            }`}
          >
            {STATUS_LABELS[call.status] || call.status}
          </span>
        </div>

        <p className="text-sm text-gray-700">
          {formatWhen(call.scheduled_start)} · {call.duration_minutes} min ·{" "}
          {call.kind === "audio" ? "Audio" : "Video"}
        </p>
        {isGroup && (
          <p className="text-xs text-gray-500">
            {call.accepted_count} of {participants.length} confirmed
          </p>
        )}
        {call.topic && (
          <p className="text-xs text-gray-500 truncate">{call.topic}</p>
        )}
        {call.status === "declined" && call.decline_reason && (
          <p className="text-xs text-gray-500 mt-1">“{call.decline_reason}”</p>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {busy && <Spinner size="sm" />}

          {call.can_join && showJoin && (
            <Button
              as={Link}
              to={`/messages/calls/${call.room_token}`}
              size="sm"
              className="!bg-gold !text-black !text-xs"
            >
              Join call
            </Button>
          )}

          {/* Whose turn it is comes from the server: the party who proposed
              the current time cannot accept it themselves. */}
          {call.is_my_turn && (
            <>
              <Button
                size="sm"
                colorScheme="green"
                className="!text-xs"
                isDisabled={busy}
                onClick={() => accept.mutate()}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="!text-xs"
                isDisabled={busy}
                onClick={() => decline.mutate()}
              >
                Decline
              </Button>
            </>
          )}

          {isOpen && !compact && (
            <>
              {onAddPeople && call.can_add_people && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="!text-xs"
                  isDisabled={busy}
                  onClick={() => onAddPeople(call)}
                >
                  Add people
                </Button>
              )}
              {onReschedule && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="!text-xs"
                  isDisabled={busy}
                  onClick={() => onReschedule(call)}
                >
                  Propose another time
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                className="!text-xs"
                isDisabled={busy}
                onClick={() => cancel.mutate()}
              >
                Cancel
              </Button>
            </>
          )}

          {!call.can_join && blockedCopy && call.status === "accepted" && (
            <span className="text-xs text-gray-500">{blockedCopy}</span>
          )}
        </div>
      </div>
    </article>
  );
}
