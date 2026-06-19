import React, { useEffect, useRef, useState } from "react";
import { Button } from "@chakra-ui/react";
import clsx from "clsx";
import { CheckIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

/**
 * Atomically persist all of a stage's formik values to localStorage.
 * Only serialisable string values are stored (File inputs are skipped).
 */
export function persistFormikDraft(formik) {
  if (!formik?.values) return false;

  Object.entries(formik.values).forEach(([key, value]) => {
    if (typeof value === "string") {
      localStorage.setItem(key, value);
    }
  });

  return true;
}

/**
 * Explicit per-stage "Save" button for the multi-step company create flow.
 * Saves the current stage's draft locally and shows a transient "Saved" state.
 */
function SaveDraftButton({ formik, label = "Save", className }) {
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSave = () => {
    const didSave = persistFormikDraft(formik);

    if (!didSave) {
      toast.error("Nothing to save yet");
      return;
    }

    setSaved(true);
    toast.success("Draft saved");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Button
      type="button"
      onClick={handleSave}
      className={clsx(
        "shadow-sm flex justify-center items-center gap-1 p-4 border !border-gold !bg-white !text-gold hover:opacity-60 transition-all duration-300",
        className
      )}
    >
      {saved ? (
        <>
          <CheckIcon />
          <span>Saved</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </Button>
  );
}

export default SaveDraftButton;
