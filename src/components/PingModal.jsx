import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";
import { createPing } from "../api-services/ping";
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
    desc: "All of Connectize · premium only",
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

  const reset = () => {
    setAudience("followers");
    setMessage("");
    setSchedule(false);
    setScheduledAt("");
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose?.();
  };

  const submit = async () => {
    setLoading(true);
    try {
      await createPing({
        objectType,
        objectId,
        audience,
        message: message.trim(),
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
        toast.error("This company can only ping once per day.");
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
      disabled={loading || (schedule && !scheduledAt)}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Notify people about this post. You can ping once per day.
        </p>

        <div className="space-y-2">
          {AUDIENCES.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setAudience(a.key)}
              className={clsx(
                "w-full rounded-lg border px-3 py-2 text-left transition",
                audience === a.key
                  ? "border-gold bg-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <p className="text-sm font-semibold text-gray-900">{a.label}</p>
              <p className="text-xs text-gray-500">{a.desc}</p>
            </button>
          ))}
        </div>

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
