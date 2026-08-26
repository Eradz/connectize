import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@chakra-ui/react";
import { CloseRounded, SearchRounded, CheckCircleRounded } from "@mui/icons-material";
import { searchUsers } from "../../api-services/users";

/**
 * Search for people and choose several of them.
 *
 * Replaces a row of chips. Chips were fine while the only candidates were your
 * three most recent conversations, and useless the moment the list is everyone
 * you might call - you cannot scan a wrapped row of forty names, and the
 * person you want is usually not in it at all.
 *
 * The empty state still shows recent conversations, because most calls are to
 * someone you were just talking to and typing a name already on screen is a
 * waste. Searching widens it to everyone.
 */

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY = 2;

function Avatar({ person, size = 32 }) {
  const initial = (person?.name || "?").trim().charAt(0).toUpperCase();
  const style = { width: size, height: size };

  return person?.avatar ? (
    <img
      src={person.avatar}
      alt={person.name}
      style={style}
      className="rounded-full object-cover shrink-0"
    />
  ) : (
    <div
      style={style}
      className="rounded-full bg-gray-200 text-gray-600 grid place-items-center text-sm font-semibold shrink-0"
    >
      {initial}
    </div>
  );
}

export default function PeoplePicker({
  recent = [],
  selected = [],
  room,
  onToggle,
  label = "Who",
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    // Debounced, and guarded against a slow early response landing after a
    // faster later one and putting stale names back on screen.
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchUsers(trimmed);
        if (cancelled) return;
        setResults(
          (found || []).map((person) => ({
            id: person.id,
            name:
              [person.first_name, person.last_name].filter(Boolean).join(" ") ||
              person.email ||
              "Connectize user",
            avatar: person.avatar ?? null,
          }))
        );
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const selectedIds = useMemo(
    () => new Set(selected.map((person) => person.id)),
    [selected]
  );
  const showing = query.trim().length >= MIN_QUERY ? results : recent;
  const full = room <= 0;

  return (
    <div className="text-sm">
      <span className="font-semibold text-gray-800">
        {label}
        {full ? " — that's a full call" : ""}
      </span>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => onToggle(person)}
              aria-label={`Remove ${person.name}`}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gold border border-gold text-black font-semibold"
            >
              {person.name}
              <CloseRounded style={{ fontSize: 14 }} />
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2 border border-gray-200 rounded-md px-2 py-1.5">
        <SearchRounded className="text-gray-400" style={{ fontSize: 18 }} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search people"
          className="flex-1 text-sm outline-none bg-transparent"
        />
        {searching && <Spinner size="xs" />}
        {!searching && query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear">
            <CloseRounded className="text-gray-400" style={{ fontSize: 16 }} />
          </button>
        )}
      </div>

      {/* Bounded so the modal cannot grow past the viewport: the list scrolls,
          the date and duration above it stay put. */}
      <div className="max-h-44 overflow-y-auto mt-1">
        {showing.length === 0 ? (
          <p className="text-xs text-gray-500 py-3">
            {query.trim().length >= MIN_QUERY
              ? searching
                ? "Searching…"
                : "Nobody by that name."
              : "Search for someone to invite."}
          </p>
        ) : (
          showing.map((person) => {
            const isOn = selectedIds.has(person.id);
            const blocked = !isOn && full;
            return (
              <button
                key={person.id}
                type="button"
                disabled={blocked}
                onClick={() => onToggle(person)}
                className="w-full flex items-center gap-2.5 px-1 py-2 rounded hover:bg-gray-50 disabled:opacity-40 text-left"
              >
                <Avatar person={person} />
                <span className="flex-1 truncate">{person.name}</span>
                {isOn && (
                  <CheckCircleRounded
                    className="text-green-600"
                    style={{ fontSize: 18 }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
