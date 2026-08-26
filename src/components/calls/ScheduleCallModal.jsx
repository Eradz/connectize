import { useEffect, useMemo, useState } from "react";
import { Input, Select, Textarea } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { webRoutes } from "../../lib/webRoutes";
import ReusableModal from "../custom/ResusableModal";
import { proposeCall, MAX_CALL_PARTICIPANTS } from "../../api-services/calls";
import useCallCandidates from "../../hooks/useCallCandidates";
import PeoplePicker from "./PeoplePicker";

/**
 * Propose a call to the person you are talking to.
 *
 * The wording throughout is "propose", not "call". Nothing here rings anyone:
 * it sends an invitation that the other party has to accept before either
 * side can connect. Saying "Call" on this button would promise something the
 * product deliberately does not do.
 */

const DURATIONS = [15, 30, 45, 60];

/** `datetime-local` wants local wall-clock with no zone, to the minute. */
function toLocalInputValue(date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function defaultStart() {
  // The next half hour, at least fifteen minutes out - far enough that the
  // invitation has a chance of being seen before the time it proposes.
  const start = new Date(Date.now() + 15 * 60_000);
  start.setMinutes(start.getMinutes() > 30 ? 60 : 30, 0, 0);
  return start;
}

export default function ScheduleCallModal({ isOpen, onClose, otherUser }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [start, setStart] = useState(() => toLocalInputValue(defaultStart()));
  const [duration, setDuration] = useState(30);
  const [kind, setKind] = useState("video");
  const [topic, setTopic] = useState("");
  // The person whose chat this was opened from starts selected; the rest of
  // the list is there so a two-person call can become a three-person one
  // without leaving the conversation.
  // People, not just ids, so a searched name survives being chosen even
  // though it is not in the recent list.
  const [selected, setSelected] = useState([]);
  const candidates = useCallCandidates(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(
      otherUser?.id
        ? [
            {
              id: otherUser.id,
              name:
                [otherUser.first_name, otherUser.last_name]
                  .filter(Boolean)
                  .join(" ") || "Connectize user",
              avatar: otherUser.avatar ?? null,
            },
          ]
        : []
    );
  }, [isOpen, otherUser?.id]);

  const room = MAX_CALL_PARTICIPANTS - 1 - selected.length;
  const toggle = (person) =>
    setSelected((current) =>
      current.some((chosen) => chosen.id === person.id)
        ? current.filter((chosen) => chosen.id !== person.id)
        : room <= 0
          ? current
          : [...current, person]
    );

  const earliest = useMemo(() => toLocalInputValue(new Date()), []);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      proposeCall({
        invitees: selected.map((person) => person.id),
        // The input is local wall-clock; the API is UTC throughout.
        scheduledStart: new Date(start).toISOString(),
        durationMinutes: Number(duration),
        kind,
        topic: topic.trim(),
      }),
    onSuccess: (call) => {
      // A null means the server refused and has already said why.
      if (!call) return;
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      toast.success("Invitation sent. They'll need to accept it.");
      onClose();
      // Land on the diary. Sending an invitation and being returned to the
      // conversation gives no sign the booking exists anywhere.
      navigate(webRoutes.calls);
    },
  });

  const name =
    selected.length === 1
      ? selected[0].name
      : [otherUser?.first_name, otherUser?.last_name].filter(Boolean).join(" ");
  const heading =
    selected.length > 1
      ? `Propose a call with ${selected.length} people`
      : name
        ? `Propose a call with ${name}`
        : "Propose a call";

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={heading}
      primaryText={isPending ? "Sending…" : "Send invitation"}
      primaryAction={() => mutate()}
      disabled={isPending || !start || selected.length === 0}
    >
      <div className="flex flex-col gap-4">
        <PeoplePicker
          recent={candidates}
          selected={selected}
          room={room}
          onToggle={toggle}
        />

        <label className="text-sm">
          <span className="font-semibold text-gray-800">When</span>
          <Input
            type="datetime-local"
            value={start}
            min={earliest}
            onChange={(event) => setStart(event.target.value)}
            className="mt-1"
            size="sm"
          />
        </label>

        <div className="flex gap-3">
          <label className="text-sm flex-1">
            <span className="font-semibold text-gray-800">For</span>
            <Select
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="mt-1"
              size="sm"
            >
              {DURATIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </Select>
          </label>

          <label className="text-sm flex-1">
            <span className="font-semibold text-gray-800">Type</span>
            <Select
              value={kind}
              onChange={(event) => setKind(event.target.value)}
              className="mt-1"
              size="sm"
            >
              <option value="video">Video</option>
              <option value="audio">Audio only</option>
            </Select>
          </label>
        </div>

        <label className="text-sm">
          <span className="font-semibold text-gray-800">
            What it's about <span className="font-normal text-gray-500">(optional)</span>
          </span>
          <Textarea
            value={topic}
            maxLength={200}
            rows={2}
            placeholder="Pricing for the Q3 tender"
            onChange={(event) => setTopic(event.target.value)}
            className="mt-1"
            size="sm"
          />
        </label>

        <p className="text-xs text-gray-500">
          {selected.length > 1
            ? `All ${selected.length} get an invitation. Everyone answers for themselves, and the call goes ahead with whoever accepts.`
            : "They'll get an invitation to accept. Neither of you can join until you've both agreed on the time — and you'll both be reminded ten minutes before."}
        </p>
      </div>
    </ReusableModal>
  );
}
