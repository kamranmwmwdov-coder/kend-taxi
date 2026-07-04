"use client";
import { useEffect, useState } from "react";

interface Props {
  deadline: number; // epoch ms
  onExpire?: () => void;
}

export function Countdown({ deadline, onExpire }: Props) {
  const [remaining, setRemaining] = useState(Math.max(0, deadline - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, deadline - Date.now());
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <span className="font-mono text-lg font-bold">
      {minutes}:{seconds.toString().padStart(2, "0")}
    </span>
  );
}
