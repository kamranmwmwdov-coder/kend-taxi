"use client";
import { useEffect, useState } from "react";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  background_color: string | null;
  text_color: string | null;
  text_style: string | null;
  lent_color: string | null;
}

export function AdBanner({ targetRole = "ALL" }: { targetRole?: "ALL" | "CUSTOMER" | "DRIVER" }) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetch(`/api/ads/active?targetRole=${targetRole}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setAd(json.data);
      });
  }, [targetRole]);

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

  const backgroundColor = ad.background_color || "#EEF2F7";
  const textColor = ad.text_color || "#1F2430";
  const lentColor = ad.lent_color || "#1D6FE0";
  const textStyle = ad.text_style || "font-semibold";

  const content = (
    <div className="h-[20vh] min-h-[110px] border-b border-gray-200 overflow-hidden bg-white">
      <div
        className="h-[65%] bg-cover bg-center"
        style={ad.image_url ? { backgroundImage: `url(${ad.image_url})`, backgroundColor } : { backgroundColor }}
      />
      <div className="h-[30%] min-h-0 flex flex-col justify-center px-4" style={{ backgroundColor }}>
        <p className={`${textStyle} text-sm truncate`} style={{ color: textColor }}>
          {ad.title}
        </p>
        {ad.description && (
          <p className="text-xs truncate opacity-85" style={{ color: textColor }}>
            {ad.description}
          </p>
        )}
      </div>
      <div className="h-[5%] min-h-[5px]" style={{ backgroundColor: lentColor }} aria-hidden="true" />
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
