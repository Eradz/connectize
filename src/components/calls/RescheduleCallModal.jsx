import { useEffect, useState } from "react";
import { Input, Select } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ReusableModal from "../custom/ResusableModal";
import { rescheduleCall } from "../../api-services/calls";

/**
 * Propose a different time for a call that already exists.
 *
 * The copy is explicit that this withdraws the agreement, because that is
 * what the server does: a rescheduled call goes back to awaiting the other
 * party. Letting someone believe they had merely nudged a confirmed call is
 * how one side ends up alone in a room.
 */

const DURATIONS = [15, 30, 45, 60];

function toLocalInputValue(date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default function RescheduleCallModal({ call, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    if (!call) return;
    setStart(toLocalInputValue(new Date(call.scheduled_start)));
    setDuration(call.duration_minutes);
  }, [call]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      rescheduleCall(call.room_token, {
        scheduledStart: new Date(start).toISOString(),
        durationMinutes: Number(duration),
      }),
    onSuccess: (updated) => {
      if (!updated) return;
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      toast.success("New time proposed. They'll need to accept it.");
      onClose();
    },
  });

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Propose another time"
      primaryText={isPending ? "Sending…" : "Propose"}
      primaryAction={() => mutate()}
      disabled={isPending || !start}
    >
      <div className="flex flex-col gap-4">
        <label className="text-sm">
          <span className="font-semibold text-gray-800">New time</span>
          <Input
            type="datetime-local"
            value={start}
            min={toLocalInputValue(new Date())}
            onChange={(event) => setStart(event.target.value)}
            className="mt-1"
            size="sm"
          />
        </label>

        <label className="text-sm">
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

        <p className="text-xs text-gray-500">
          Moving a call withdraws the agreement — the other side will have to
          accept the new time before either of you can join.
        </p>
      </div>
    </ReusableModal>
  );
}
