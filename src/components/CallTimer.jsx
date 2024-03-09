import { useEffect, useState } from "react";

// startTime needs to be a javascript Date object
export default function CallTimer({ startTime }) {
  const [timeLabel, setTimeLabel] = useState("00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const startTimestamp = startTime.getTime();
      const timeElapsed = currentTime - startTimestamp;

      const minutes = Math.floor(timeElapsed / 60000)
        .toString()
        .padStart(2, "0");
      const seconds = ((timeElapsed % 60000) / 1000)
        .toFixed(0)
        .toString()
        .padStart(2, "0");

      setTimeLabel(`${minutes}:${seconds}`);
    });

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div className="text-lg font-semibold">{timeLabel}</div>;
}
