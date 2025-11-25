import { useState, useEffect } from "react";

export default function useCountdown(startDate, durationDays, onComplete) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!startDate || !durationDays) return;

    const end = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    setTimeLeft(end.getTime() - new Date().getTime());

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate, durationDays, onComplete]);

  const formatTime = (ms) => {
    if (ms <= 0) return "00d 00h 00m 00s";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return { timeLeft, formatTime };
}
