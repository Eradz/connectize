import React, { useEffect, useState } from "react";
import { timeAgo } from "../lib/utils";

export default function TimeAgo({ time, intervalInMs = 1000 }) {
  const [timestamp, setTimestamp] = useState(timeAgo(time));
  useEffect(() => {
    const interval = setInterval(
      () => setTimestamp(timeAgo(time)),
      intervalInMs
    );
    return () => clearInterval(interval);
  });
  return <>{timestamp}</>;
}
