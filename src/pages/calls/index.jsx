import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftRounded } from "@mui/icons-material";
import { webRoutes } from "../../lib/webRoutes";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@chakra-ui/react";
import { addParticipants, listCalls } from "../../api-services/calls";
import { getMessagesForUser } from "../../api-services/messaging";
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
  const queryClient = useQueryClient();

  // Candidates are the people already in your conversations - a call is a
  // conversation that got serious, so this is both the right set and one you
  // have already paid for.
  const { data: conversations } = useQuery({
    queryKey: ["calls", "call-candidates"],
    queryFn: () => getMessagesForUser({ page_size: 50 }),
    enabled: Boolean(addingTo),
  });

  const candidates = useMemo(() => {
    const rows = conversations?.results ?? conversations ?? [];
    const already = new Set(
      (addingTo?.participants || []).map((p) => p.user?.id)
    );
    const seen = new Map();
    rows.forEach((row) => {
      const person = row?.other_user;
      if (!person?.id || seen.has(person.id) || already.has(person.id)) return;
      seen.set(
        person.id,
        [person.first_name, person.last_name].filter(Boolean).join(" ") ||
          "Connectize user"
      );
    });
    return Array.from(seen, ([id, label]) => ({ id, label }));
  }, [conversations, addingTo]);

  const addPeople = useMutation({
    mutationFn: (userId) => addParticipants(addingTo.room_token, [userId]),
    onSuccess: (updated) => {
      if (!updated) return;
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      toast.success("They've been invited. They'll need to accept.");
      setAddingTo(null);
    },
  });

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ["calls", scope],
    queryFn: () => listCalls({ scope }),
  });

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <header>
        {/* The page was reachable and not leavable: it is a full route rather
            than a panel inside Messages, so without this the only way out was
            the browser's own back button. */}
        <Link
          to={webRoutes.messages}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-2"
        >
          <ChevronLeftRounded fontSize="small" />
          <span>Messages</span>
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Calls</h1>
        <p className="text-sm text-gray-500">
          Calls are booked and confirmed by both sides — nothing rings
          unannounced.
        </p>
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
        onClose={() => setAddingTo(null)}
        title="Who else should join?"
        footerContent={<></>}
      >
        {candidates.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nobody left to add from your conversations.
          </p>
        ) : (
          <ul className="flex flex-col">
            {candidates.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  disabled={addPeople.isPending}
                  onClick={() => addPeople.mutate(person.id)}
                  className="w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  {person.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-gray-500 mt-3">
          A call holds four people. Everyone answers for themselves, and it
          goes ahead with whoever accepts.
        </p>
      </ReusableModal>

      <RescheduleCallModal
        call={rescheduling}
        isOpen={Boolean(rescheduling)}
        onClose={() => setRescheduling(null)}
      />
    </div>
  );
}
