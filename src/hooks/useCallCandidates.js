import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMessagesForUser } from "../api-services/messaging";

/**
 * People you could put on a call: whoever you already have a conversation
 * with.
 *
 * A call here is a conversation that got serious, so this is both the right
 * set to offer and one the app has already paid for. It also means the picker
 * never offers a stranger, which the server would refuse anyway once blocking
 * is taken into account.
 */
export default function useCallCandidates(enabled, exclude = []) {
  const { data } = useQuery({
    queryKey: ["calls", "call-candidates"],
    queryFn: () => getMessagesForUser({ page_size: 50 }),
    enabled: Boolean(enabled),
  });

  return useMemo(() => {
    const excluded = new Set(exclude);
    const rows = Array.isArray(data) ? data : data?.results ?? [];
    const seen = new Map();
    rows.forEach((row) => {
      const person = row?.other_user;
      if (!person?.id || seen.has(person.id) || excluded.has(person.id)) return;
      seen.set(person.id, {
        id: person.id,
        name:
          [person.first_name, person.last_name].filter(Boolean).join(" ") ||
          "Connectize user",
        avatar: person.avatar ?? null,
      });
    });
    return Array.from(seen.values());
    // `exclude` is a fresh array each render; its contents are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, exclude.join(",")]);
}
