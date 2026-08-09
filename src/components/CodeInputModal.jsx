import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ReusableModal from "./custom/ResusableModal";

const CODE_LENGTH = 6;

/**
 * A modal for entering a 6-digit verification code, with resend-cooldown
 * support. Mirrors the digit-input UX from the account-signup verification
 * page (auto-advance, paste, auto-submit) for a consistent feel wherever a
 * short-lived email code needs to be entered.
 */
export default function CodeInputModal({
  isOpen,
  onClose,
  title = "Enter verification code",
  description,
  onSubmit,
  onResend,
}) {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setCode(Array(CODE_LENGTH).fill(""));
      setCooldown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submitCode = async (codeString) => {
    setIsSubmitting(true);
    try {
      await onSubmit(codeString);
    } catch {
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (digit && index === CODE_LENGTH - 1 && newCode.every((d) => d !== "")) {
      submitCode(newCode.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const newCode = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) newCode[i] = pasted[i];
    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
    if (pasted.length === CODE_LENGTH) submitCode(pasted);
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setCooldown(60);
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      // errors already toasted by the caller's API function
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ReusableModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        {description && <p className="text-sm text-gray-600">{description}</p>}

        <div className="flex gap-2 sm:gap-3">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isSubmitting}
              className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border-2 border-gray-200 bg-background focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            const codeString = code.join("");
            if (codeString.length < CODE_LENGTH) {
              toast.error("Please enter the full 6-digit code.");
              return;
            }
            submitCode(codeString);
          }}
          disabled={isSubmitting || code.some((d) => !d)}
          className="w-full py-2.5 px-4 rounded-md text-white font-medium text-sm transition-all btn-primary disabled:opacity-50"
        >
          {isSubmitting ? "Verifying..." : "Verify"}
        </button>

        <p className="text-sm text-custom_grey">
          Didn't receive the code?{" "}
          {cooldown > 0 ? (
            <span className="text-gray-400">Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-bold text-black hover:underline disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          )}
        </p>
      </div>
    </ReusableModal>
  );
}
