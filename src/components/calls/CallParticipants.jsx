import { Avatar } from "@chakra-ui/react";
import {
  CheckCircleRounded,
  CancelRounded,
  ScheduleRounded,
} from "@mui/icons-material";

/**
 * Who is on a call and what each of them said.
 *
 * The card can only afford a count - "1 of 3 confirmed" - which tells you the
 * call is short of people but not *which* people, and that is the actionable
 * half. With per-person consent it is also the only way to see why a call is
 * still waiting: someone declined, or someone simply has not looked yet, and
 * those call for different things from you.
 */

const ANSWER = {
  accepted: {
    label: "Accepted",
    Icon: CheckCircleRounded,
    className: "text-green-600",
  },
  declined: { label: "Declined", Icon: CancelRounded, className: "text-red-500" },
  invited: {
    label: "Not answered yet",
    Icon: ScheduleRounded,
    className: "text-gray-400",
  },
};

const displayName = (person) =>
  [person?.first_name, person?.last_name].filter(Boolean).join(" ") ||
  "Connectize user";

export default function CallParticipants({ call, selfId }) {
  const invites = call?.participants || [];
  if (invites.length === 0) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-xs font-semibold text-gray-500 mb-2">
        {call.accepted_count} of {invites.length} confirmed
      </p>

      <ul className="flex flex-col">
        {invites.map((invite) => {
          const answer = ANSWER[invite.status] || ANSWER.invited;
          const isYou = invite.user?.id === selfId;
          const isOrganizer = invite.user?.id === call.organizer?.id;

          return (
            <li
              key={invite.user?.id}
              className="flex items-center gap-2.5 py-1.5"
            >
              <Avatar
                src={invite.user?.avatar}
                name={displayName(invite.user)}
                width="32px"
                height="32px"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  {isYou ? "You" : displayName(invite.user)}
                  {isOrganizer && (
                    <span className="text-gray-400"> · organiser</span>
                  )}
                </p>
                {invite.status === "declined" && invite.decline_reason && (
                  <p className="text-xs text-gray-500 truncate">
                    “{invite.decline_reason}”
                  </p>
                )}
              </div>
              <answer.Icon
                className={answer.className}
                style={{ fontSize: 16 }}
              />
              <span className={`text-xs ${answer.className}`}>
                {answer.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
