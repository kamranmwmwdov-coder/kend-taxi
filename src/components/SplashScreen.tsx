"use client";
import { useEffect, useState } from "react";

export function SplashScreen({ appName }: { appName: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-primary flex flex-col items-center justify-center text-white transition-opacity">
      <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold mb-4">
        {appName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </div>
      <h1 className="text-xl font-bold">{appName}</h1>
      <p className="text-white/70 text-sm mt-1">Tətbiq xidmət platformaları toplusudur</p>
    </div>
  );
}
