"use client";
import { useEffect, useState } from "react";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
}

export function AdBanner() {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetch("/api/ads/active")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setAd(json.data);
      });
  }, []);

  async function handleClick() {
    if (!ad?.link_url) return;
    fetch(`/api/ads/${ad.id}/click`, { method: "POST" }).catch(() => {});
  }

  if (!ad) {
    return (
      <div className="h-[20vh] min-h-[110px] bg-gray-100 flex items-center justify-center text-ink-muted text-sm border-b border-gray-200">
        Reklam yeri
      </div>
    );
  }

  const content = (
    <div
      className="h-[20vh] min-h-[110px] border-b border-gray-200 flex items-center gap-3 px-4 bg-cover bg-center"
      style={ad.image_url ? { backgroundImage: `url(${ad.image_url})` } : { background: "#EEF2F7" }}
    >
      <div className="bg-white/90 rounded-xl px-3 py-2 max-w-[85%]">
        <p className="font-semibold text-sm text-ink truncate">{ad.title}</p>
        {ad.description && <p className="text-xs text-ink-muted truncate">{ad.description}</p>}
      </div>
    </div>
  );

  if (ad.link_url) {
    return (
      <a href={ad.link_url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        {content}
      </a>
    );
  }
  return content;
}
