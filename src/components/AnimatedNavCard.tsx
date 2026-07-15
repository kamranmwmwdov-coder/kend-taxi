"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bus, Package, Car, type LucideIcon } from "lucide-react";

const TRANSITION_MS = 1100;

// Server komponentdən (page.tsx) yalnız serializasiya oluna bilən data (string) ötürülür.
// Faktiki icon komponenti bu map vasitəsilə burada, client tərəfdə həll olunur.
const ICONS: Record<string, LucideIcon> = {
  bus: Bus,
  package: Package,
  car: Car,
};

interface AnimatedNavCardProps {
  href: string;
  icon: keyof typeof ICONS;
  label: string;
  color: string;
  image: string;
}

export function AnimatedNavCard({ href, icon, label, color, image }: AnimatedNavCardProps) {
  const Icon = ICONS[icon];
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (isTransitioning) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      router.push(href);
      return;
    }

    setIsTransitioning(true);
    navigateTimeout.current = setTimeout(() => router.push(href), TRANSITION_MS);
  }

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        className="relative flex items-center gap-4 overflow-hidden rounded-2xl p-5 border border-gray-100 shadow-sm active:scale-[0.99] transition-transform bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${image})` }}
      >
        <span className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className={`relative z-10 w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white`}>
          <Icon size={22} />
        </div>
        <span className="relative z-10 font-semibold text-white">{label}</span>
      </a>

      {isTransitioning && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${color}`}
          style={{ animation: `kt-route-fade-in 200ms ease-out both` }}
          role="status"
          aria-live="polite"
        >
          <div className="relative w-full max-w-xs h-10 mb-6 overflow-hidden">
            <div
              className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full"
              style={{
                backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 24px, transparent 24px 40px)",
                animation: "kt-route-road 600ms linear infinite",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-md"
              style={{ animation: `kt-route-drive ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both` }}
            >
              <Icon size={20} />
            </div>
          </div>
          <p
            className="relative z-10 text-white font-semibold"
            style={{ animation: "kt-route-label-rise 300ms ease-out 150ms both" }}
          >
            {label} açılır...
          </p>
        </div>
      )}
    </>
  );
}
