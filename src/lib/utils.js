import { QueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { 
      refetchInterval: 600000, // 10 minutes
      staleTime: 2 * 60 * 1000, // ✅ 2 minutes - data stays fresh longer
      gcTime: 10 * 60 * 1000, // ✅ 10 minutes - keep in cache
      refetchOnWindowFocus: false, // ✅ Don't refetch on tab focus
      retry: 2, // ✅ Only retry twice
      retryDelay: 1000,
    },
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

/**
 * Format a phone number with country code
 * @param {string} phoneNumber - The phone number to format
 * @param {string} countryName - The country name (e.g., "United States", "Nigeria")
 * @returns {string} - Formatted phone number with country code
 */
export function formatPhoneNumber(phoneNumber, countryName = "") {
  if (!phoneNumber) return "";

  // If the number already starts with a country code (+ or 00), return as is
  if (phoneNumber.startsWith("+") || phoneNumber.startsWith("00")) {
    return phoneNumber;
  }

  // Remove any non-digit characters from the phone number
  const cleanNumber = phoneNumber.replace(/\D/g, "");

  // Default to +1 if the number is 10 digits (likely US/Canada)
  // This takes priority over country name to handle cases where country might be wrong
  if (cleanNumber.length === 10) {
    return `+1 ${cleanNumber}`;
  }

  // Country code mapping - add more as needed
  const countryCodeMap = {
    "united states": "+1",
    "usa": "+1",
    "us": "+1",
    "canada": "+1",
    "nigeria": "+234",
    "ng": "+234",
    "ghana": "+233",
    "gh": "+233",
    "kenya": "+254",
    "ke": "+254",
    "south africa": "+27",
    "za": "+27",
    "united kingdom": "+44",
    "uk": "+44",
    "gb": "+44",
    "india": "+91",
    "in": "+91",
    "china": "+86",
    "cn": "+86",
    "australia": "+61",
    "au": "+61",
    "germany": "+49",
    "de": "+49",
    "france": "+33",
    "fr": "+33",
    "italy": "+39",
    "it": "+39",
    "spain": "+34",
    "es": "+34",
    "brazil": "+55",
    "br": "+55",
    "mexico": "+52",
    "mx": "+52",
    "japan": "+81",
    "jp": "+81",
    "south korea": "+82",
    "kr": "+82",
  };

  // Get country code from the country name if provided
  if (countryName) {
    const countryKey = countryName.toLowerCase().trim();
    const countryCode = countryCodeMap[countryKey];

    // If we have a country code, format the number
    if (countryCode) {
      return `${countryCode} ${cleanNumber}`;
    }
  }

  // If we can't determine the country code, just return the number as is
  return phoneNumber;
}

/**
 * Ensure URL has a protocol (http/https)
 * @param {string} url - The URL to format
 * @returns {string} - URL with protocol
 */
export function ensureUrlProtocol(url) {
  if (!url) return "";
  
  const trimmedUrl = url.trim();
  
  // If already has protocol, return as is
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // Add https:// by default
  return `https://${trimmedUrl}`;
}

  export const getTopicsDisplay = (topics) => {
  if (!topics) return []
  
  // Handle case where topics might be a string
  if (typeof topics === 'string') {
    try {
      topics = JSON.parse(topics)
    } catch {
      return []
    }
  }
  
  if (!Array.isArray(topics) || topics.length === 0) return []
  
  if (topics.length === 1 && typeof topics[0] === 'string' && topics[0].startsWith('[')) {
    try {
      topics = JSON.parse(topics[0])
    } catch {
      return []
    }
  }
  
  // Filter out empty strings and "[]" 
  const filtered = topics.filter(t => t && t.trim() && t !== '[]')
  if (filtered.length === 0) return []
  
  return filtered.slice(0, 3).sort((a, b) => b.length - a.length)
}

