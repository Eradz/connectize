import { QueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchInterval: 600000 },
  },
});

/**
 *
 * @param {*} hour 24 hours format i.e 0-23 hours not 1-24 hours
 * @returns {{hour:number, meridiem: string}}
 */
export function converthourTo12hrFormat(hour) {
  const isPm = hour - 1 >= 12;
  return {
    hour: isPm ? hour - 1 - 12 : hour,
    meridiem: isPm ? "PM" : "AM",
  };
}

const monthToStr = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

export function getMonthFromNumber(num) {
  return monthToStr[num];
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

  if (format === "long") {
    const longDate = new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return longDate;
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

export function openInNewTab(url) {
  window.open(url, "_blank");
}
export async function attemptNavigatorShare(shareData) {
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log("Error sharing: ", error);
      toast.error("An error occurred while sharing");
    } finally {
      return true;
    }
  }

  return false;
}

export async function copyTextToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
}
