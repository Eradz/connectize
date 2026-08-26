import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftRounded } from "@mui/icons-material";
import { webRoutes } from "../../lib/webRoutes";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@chakra-ui/react";
import { listCalls } from "../../api-services/calls";
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
            />
          ))}
        </div>
      )}

      <RescheduleCallModal
        call={rescheduling}
        isOpen={Boolean(rescheduling)}
        onClose={() => setRescheduling(null)}
      />
    </div>
  );
}
