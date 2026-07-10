"use client";
import { type MouseEvent, type PointerEvent, useEffect, useRef, useState } from "react";

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
  display_duration_seconds: number | null;
}

export function AdBanner({ targetRole = "ALL" }: { targetRole?: "ALL" | "CUSTOMER" | "DRIVER" }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const didDrag = useRef(false);

  useEffect(() => {
    fetch(`/api/ads/active?targetRole=${targetRole}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAds(json.data);
          setActiveIndex(0);
        }
      });
  }, [targetRole]);

  const ad = ads[activeIndex];
  const activeDuration = Math.max(1, ad?.display_duration_seconds ?? 5) * 1000;

  useEffect(() => {
    if (ads.length < 2) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % ads.length);
    }, activeDuration);
    return () => window.clearTimeout(timer);
  }, [activeDuration, activeIndex, ads.length]);

  function moveSlide(direction: 1 | -1) {
    if (ads.length < 2) return;
    setActiveIndex((index) => (index + direction + ads.length) % ads.length);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    pointerStartX.current = event.clientX;
    didDrag.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (pointerStartX.current !== null && Math.abs(event.clientX - pointerStartX.current) > 8) didDrag.current = true;
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (pointerStartX.current === null) return;
    const distance = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(distance) >= 40) moveSlide(distance < 0 ? 1 : -1);
  }

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (didDrag.current) {
      event.preventDefault();
      didDrag.current = false;
      return;
    }
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
    <div
      className="h-[20vh] min-h-[110px] border-b border-gray-200 overflow-hidden bg-white select-none touch-pan-y cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
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
