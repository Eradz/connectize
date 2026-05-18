import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Verify Account | Connectize",
    description: "Verify your Connectize account to unlock all features and start connecting with energy industry professionals.",
    keywords: "verify account, email verification, Connectize account",
  });

import { useEffect, useRef, useState } from "react";
import { authenticationService } from "../../api-services/authentication";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  SUCCESS_TYPE_KEY,
  VERIFY_ACCOUNT_KEY,
} from "../../lib/data/authentication";
import { REGISTER_EMAIL_KEY } from "../../lib/helpers";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import PageLoading from "../../components/PageLoading";
import { toast } from "sonner";

const CODE_LENGTH = 6;

function VerifyAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");

  const storedEmail = localStorage.getItem(REGISTER_EMAIL_KEY) || emailFromUrl || "";
  const [email, setEmail] = useState(storedEmail);
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isLinkVerifying, setIsLinkVerifying] = useState(!!uid && !!token);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Handle legacy link-based verification (uid+token in URL)
  useEffect(() => {
    if (uid && token) {
      (async () => {
        const success = await authenticationService({
          url: `verify-account/${uid}/${token}`,
          method: "GET",
        });
        if (success) {
          localStorage.setItem(SUCCESS_TYPE_KEY, VERIFY_ACCOUNT_KEY);
          navigate("/success");
        } else {
          setIsLinkVerifying(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleCodeChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-focus next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
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
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    // Focus the next empty input or last input
    const nextIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if full code pasted
    if (pasted.length === CODE_LENGTH) {
      submitCode(pasted);
    }
  };

  const submitCode = async (codeString) => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await authenticationService({
        url: "verify-account-by-code",
        values: { email, code: codeString },
        method: "POST",
      });
      if (success) {
        localStorage.setItem(SUCCESS_TYPE_KEY, VERIFY_ACCOUNT_KEY);
        localStorage.removeItem(REGISTER_EMAIL_KEY);
        navigate("/success");
      } else {
        setCode(Array(CODE_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const codeString = code.join("");
    if (codeString.length < CODE_LENGTH) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }
    submitCode(codeString);
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsResending(true);
    try {
      await authenticationService({
        values: { email },
        url: "resend_verification_email",
        method: "POST",
      });
      setCooldown(60);
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsResending(false);
    }
  };

  if (isLinkVerifying) {
    return <PageLoading />;
  }

  return (
    <section className="space-y-5">
      <div>
        <HeadingText>Verify Your Account</HeadingText>
        <LightParagraph className="text-custom_grey mt-1">
          We sent a 6-digit verification code to{" "}
          {email ? <strong>{email}</strong> : "your email"}. Enter it below to
          activate your account.
        </LightParagraph>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email field - shown if not pre-filled */}
        {!storedEmail && (
          <div>
            <label htmlFor="verify-email" className="font-medium text-sm">
              Email Address
            </label>
            <input
              id="verify-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="mt-1 w-full bg-background py-2.5 px-3 rounded-md border text-base md:text-sm focus:outline-none focus:border-gold"
              required
            />
          </div>
        )}

        {/* 6-digit code inputs */}
        <div>
          <label className="font-medium text-sm">Verification Code</label>
          <div className="flex gap-2 sm:gap-3 mt-2">
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
        </div>

        <button
          type="submit"
          disabled={isSubmitting || code.some((d) => !d)}
          className="w-full md:w-[60%] block py-2.5 px-4 rounded-md text-white font-medium text-sm transition-all btn-primary disabled:opacity-50"
        >
          {isSubmitting ? "Verifying..." : "Verify Account"}
        </button>
      </form>

      {/* Resend section */}
      <div className=" text-sm space-y-2">
        <p className="text-custom_grey">
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

      <p className=" xs:text-sm">
        Already verified?{" "}
        <Link to="/login" className="font-bold text-black">
          Login
        </Link>
      </p>
    </section>
  );
}

export default VerifyAccount;
