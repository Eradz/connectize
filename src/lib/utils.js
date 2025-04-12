import clsx from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirst(value) {
  return String(value)
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function timeAgo(timestamp, format = "") {
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now - past) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  if (format === "day") {
    const nowDate = new Date(now.toDateString());
    const pastDate = new Date(past.toDateString());

    const dayDiff = Math.floor((nowDate - pastDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) return "Today";
    if (dayDiff === 1) return "Yesterday";
    if (dayDiff <= 6) {
      return past.toLocaleDateString(undefined, { weekday: "long" });
    }
  }

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count > 0) {
      return count === 1 ? `a ${unit} ago` : `${count} ${unit}s ago`;
    }
  }

  return "just now";
}

export function formatNumber(value) {
  let num = Number(value);
  if (num < 0) return "0";
  if (num >= 1e12) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export async function customFormikFieldValidator(formik) {
  const errors = await formik.validateForm(formik.values);

  if (Object.keys(errors).length > 0) {
    Object.keys(formik.values).forEach((field) => {
      formik.setFieldTouched(field, true);
    });
    return false;
  }
  return true;
}

export const shareThis = async ({ shareUrlString, shareData }) => {
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log("Error sharing: ", error);
      toast.error("An error occurred while sharing");
    }
  } else {
    // Fallback for browsers that don't support the Web Share API
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrlString
    )}`;
    window.open(shareUrl, "_blank");
  }
};
