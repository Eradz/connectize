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

export function timeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now - past) / 1000);

  const intervals = {
    year: 31536000, // seconds in a year
    month: 2592000, // seconds in a month
    week: 604800, // seconds in a week
    day: 86400, // seconds in a day
    hour: 3600, // seconds in an hour
    minute: 60, // seconds in a minute
    second: 1, // seconds in a second
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count > 0) {
      return count === 1 ? `a ${unit} ago` : `${count} ${unit}s ago`;
    }
  }

  return "just now"; // Default for timestamps very close to the current time
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
