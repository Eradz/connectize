import { useState } from "react";
import { Button } from "@chakra-ui/react";
import ScheduleCallModal from "../../components/calls/ScheduleCallModal";
import useCallCandidates from "../../hooks/useCallCandidates";
import PeoplePicker from "../../components/calls/PeoplePicker";
import { MAX_CALL_PARTICIPANTS } from "../../api-services/calls";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@chakra-ui/react";
import { addParticipants, listCalls } from "../../api-services/calls";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ReusableModal from "../../components/custom/ResusableModal";
import { toast } from "sonner";
import CallCard from "../../components/calls/CallCard";
import RescheduleCallModal from "../../components/calls/RescheduleCallModal";

/**
 * Every call the user has coming up, and every invitation they owe an answer
 * on.
 *
 * Worth having even though notifications link straight to a booking: a
 * notification that is dismissed, or arrives while the phone is face down, is
 * gone. Without a list, the invitation goes with it.
 */
export default function CallsPage() {
  const [rescheduling, setRescheduling] = useState(null);
  // Two lists, not one. A finished call is a record of a conversation that
  // happened - who, when, and whether it connected - and until now that
  // history was written to the database and shown to nobody.
  const [scope, setScope] = useState("upcoming");
  //: Set when the picker is being used to grow an existing call.
  const [addingTo, setAddingTo] = useState(null);
  const [toAdd, setToAdd] = useState([]);
  const [scheduling, setScheduling] = useState(false);
  const queryClient = useQueryClient();

  const candidates = useCallCandidates(
    Boolean(addingTo),
    (addingTo?.participants || []).map((p) => p.user?.id).filter(Boolean)
  );

  const addRoom =
    MAX_CALL_PARTICIPANTS - (addingTo?.participants?.length || 0) - toAdd.length;

  const toggleToAdd = (person) =>
    setToAdd((current) =>
      current.some((chosen) => chosen.id === person.id)
        ? current.filter((chosen) => chosen.id !== person.id)
        : addRoom <= 0
          ? current
          : [...current, person]
    );

  const addPeople = useMutation({
    mutationFn: (ids) => addParticipants(addingTo.room_token, ids),
    onSuccess: (updated) => {
      if (!updated) return;
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      toast.success("They've been invited. They'll need to accept.");
      setAddingTo(null);
      setToAdd([]);
    },
  });

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ["calls", scope],
    queryFn: () => listCalls({ scope }),
  });

  return (
    <div className="p-4 flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Calls</h1>
          <p className="text-sm text-gray-500">
            Calls are booked and confirmed by both sides — nothing rings
            unannounced.
          </p>
        </div>
        <Button
          size="sm"
          className="!bg-gold !text-black !text-xs shrink-0"
          onClick={() => setScheduling(true)}
        >
          Schedule a call
        </Button>
      </header>

      <div className="flex gap-2">
        {["upcoming", "past"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setScope(option)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              scope === option
                ? "bg-gold border-gold text-black font-semibold"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {option === "upcoming" ? "Upcoming" : "History"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-10">
          <Spinner />
        </div>
      ) : calls.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          {scope === "upcoming"
            ? "Nothing scheduled. Open a conversation to propose a call."
            : "No calls yet."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {calls.map((call) => (
            <CallCard
              key={call.room_token}
              call={call}
              /* A finished call has nothing left to act on. */
              onReschedule={scope === "upcoming" ? setRescheduling : undefined}
              onAddPeople={scope === "upcoming" ? setAddingTo : undefined}
            />
          ))}
        </div>
      )}

      <ReusableModal
        isOpen={Boolean(addingTo)}
        onClose={() => {
          setAddingTo(null);
          setToAdd([]);
        }}
        title="Who else should join?"
        primaryText={
          addPeople.isPending ? "Inviting…" : `Invite${toAdd.length ? ` ${toAdd.length}` : ""}`
        }
        primaryAction={() => addPeople.mutate(toAdd.map((person) => person.id))}
        disabled={addPeople.isPending || toAdd.length === 0}
      >
        <PeoplePicker
          recent={candidates}
          selected={toAdd}
          room={addRoom}
          onToggle={toggleToAdd}
          label="Add"
        />

        <p className="text-xs text-gray-500 mt-3">
          A call holds four people. Everyone answers for themselves, and it
          goes ahead with whoever accepts.
        </p>
      </ReusableModal>

      {/* No `otherUser`: from here you search for whoever you want, rather
          than starting from the person whose chat you happened to be in. */}
      <ScheduleCallModal
        isOpen={scheduling}
        onClose={() => setScheduling(false)}
      />

      <RescheduleCallModal
        call={rescheduling}
        isOpen={Boolean(rescheduling)}
        onClose={() => setRescheduling(null)}
      />
    </div>
  );
}
