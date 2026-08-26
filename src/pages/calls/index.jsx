import { useState } from "react";
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

  const { data: upcoming = [], isLoading } = useQuery({
    queryKey: ["calls", "upcoming"],
    queryFn: () => listCalls({ scope: "upcoming" }),
  });

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <header>
        <h1 className="text-lg font-semibold text-gray-900">Calls</h1>
        <p className="text-sm text-gray-500">
          Calls are booked and confirmed by both sides — nothing rings
          unannounced.
        </p>
      </header>

      {isLoading ? (
        <div className="grid place-items-center py-10">
          <Spinner />
        </div>
      ) : upcoming.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          Nothing scheduled. Open a conversation to propose a call.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.map((call) => (
            <CallCard
              key={call.id}
              call={call}
              onReschedule={setRescheduling}
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
