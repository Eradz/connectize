import { useEffect, useState } from "react";

const STORAGE_KEY = "businessPresenceModal:lastClosedAt";
const COOLDOWN_MS = 48 * 60 * 60 * 1000; // 48 hours

function usePresenceModalVisibility(isCompanyUser) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isCompanyUser) {
      setOpen(false);
      return;
    }

    let lastClosedAt = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      lastClosedAt = raw ? Number(raw) : null;
    } catch {
      lastClosedAt = null;
    }

    const withinCooldown =
      lastClosedAt && Date.now() - lastClosedAt < COOLDOWN_MS;

    setOpen(!withinCooldown);
  }, [isCompanyUser]);

  const close = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
    }
    setOpen(false);
  };

  return { open, close };
}

export default usePresenceModalVisibility;