import clsx from "clsx";
import { Crown, Lock, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createPing, getPingEligibility } from "../api-services/ping";
import { searchUsers } from "../api-services/users";
import { getUserDisplayName, getUserHandle } from "../lib/userDisplay";
import ReusableModal from "./custom/ResusableModal";

const AUDIENCES = [
  {
    key: "followers",
    label: "Followers",
    desc: "People who follow this company",
  },
  {
    key: "following",
    label: "Following",
    desc: "People this company follows",
  },
  {
    key: "everyone",
    label: "Everyone",
    desc: "Everyone on Connectize",
    premium: true,
  },
  {
    key: "user",
    label: "A specific person",
    desc: "Ping one person directly",
  },
];

/**
 * Compose and send (or schedule) a Ping for a company object.
 */
export default function PingModal({ isOpen, onClose, objectType, objectId }) {
  const [audience, setAudience] = useState("followers");
  const [message, setMessage] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

  // Specific-person picker
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Whether the premium-only "everyone" audience is available to this user.
  const [canPingEveryone, setCanPingEveryone] = useState(false);

  const reset = () => {
    setAudience("followers");
    setMessage("");
    setSchedule(false);
    setScheduledAt("");
    setQuery("");
    setResults([]);
    setSelectedUser(null);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose?.();
  };

  // Ask the backend whether the premium "everyone" audience is available so we
  // can gate it up front instead of surfacing a rejection after sending.
  useEffect(() => {
    if (!isOpen || !objectId) return;
    let active = true;
    getPingEligibility({ objectType, objectId })
      .then((res) => {
        if (active) setCanPingEveryone(!!res?.can_ping_everyone);
      })
      .catch(() => {
        if (active) setCanPingEveryone(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, objectType, objectId]);

  // If the user had picked "everyone" but isn't eligible, fall back.
  useEffect(() => {
    if (!canPingEveryone && audience === "everyone") {
      setAudience("followers");
    }
  }, [canPingEveryone, audience]);

  // Debounced user search when the "specific person" audience is active.
  useEffect(() => {
    if (audience !== "user" || selectedUser || !query.trim()) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const users = await searchUsers(query);
        if (active) setResults(users.slice(0, 6));
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [query, audience, selectedUser]);

  const disabled = useMemo(() => {
    if (loading) return true;
    if (schedule && !scheduledAt) return true;
    if (audience === "user" && !selectedUser) return true;
    return false;
  }, [loading, schedule, scheduledAt, audience, selectedUser]);

  const submit = async () => {
    setLoading(true);
    try {
      await createPing({
        objectType,
        objectId,
        audience,
        message: message.trim(),
        targetUserId: audience === "user" ? selectedUser?.id : undefined,
        scheduledAt:
          schedule && scheduledAt
            ? new Date(scheduledAt).toISOString()
            : undefined,
      });
      toast.success(schedule ? "Ping scheduled" : "Ping sent");
      reset();
      onClose?.();
    } catch (err) {
      const statusCode = err?.status || err?.response?.status;
      const detail = err?.data?.error || err?.response?.data?.error;
      if (statusCode === 403 && audience === "everyone") {
        toast.error("Pinging everyone requires a premium plan.");
      } else if (statusCode === 429) {
        toast.error("This has already been pinged in the last 24 hours.");
      } else {
        toast.error(detail || "Could not send ping.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ping"
      primaryAction={submit}
      primaryText={schedule ? "Schedule ping" : "Send ping"}
      loading={loading}
      disabled={disabled}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Draw attention to this post. You can ping it once per day.
        </p>

        <div className="space-y-2">
          {AUDIENCES.map((a) => {
            const lockedEveryone = a.premium && !canPingEveryone;
            return (
            <button
              key={a.key}
              type="button"
              disabled={lockedEveryone}
              onClick={() => !lockedEveryone && setAudience(a.key)}
              className={clsx(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition",
                lockedEveryone && "cursor-not-allowed opacity-60",
                audience === a.key
                  ? "border-gold bg-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  {a.label}
                  {a.premium &&
                    (lockedEveryone ? (
                      <Lock
                        size={13}
                        className="text-gray-400"
                        aria-label="Premium only"
                      />
                    ) : (
                      <Crown
                        size={14}
                        className="text-gold"
                        fill="currentColor"
                        aria-label="Premium"
                      />
                    ))}
                </p>
                <p className="text-xs text-gray-500">
                  {lockedEveryone ? "Premium plan required" : a.desc}
                </p>
              </div>
            </button>
            );
          })}
        </div>

        {audience === "user" && (
          <div className="space-y-2">
            {selectedUser ? (
              <div className="flex items-center justify-between rounded-lg border border-gold bg-gold/5 px-3 py-2">
                <span className="text-sm font-medium text-gray-900">
                  {getUserDisplayName(selectedUser)}{" "}
                  <span className="text-gray-500">
                    @{getUserHandle(selectedUser)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setQuery("");
                  }}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                  <Search size={16} className="text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a person"
                    className="w-full text-sm focus:outline-none"
                  />
                </div>
                {searching && (
                  <p className="text-xs text-gray-400">Searching…</p>
                )}
                {results.length > 0 && (
                  <ul className="max-h-44 overflow-y-auto rounded-lg border border-gray-200">
                    {results.map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-gray-50"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {getUserDisplayName(u)}
                          </span>
                          <span className="text-xs text-gray-500">
                            @{getUserHandle(u)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder="Add a short message (optional)"
          className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-gold focus:outline-none"
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={schedule}
            onChange={(e) => setSchedule(e.target.checked)}
          />
          Schedule for later
        </label>

        {schedule && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-gold focus:outline-none"
          />
        )}
      </div>
    </ReusableModal>
  );
}
