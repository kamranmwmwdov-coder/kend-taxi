"use client";

import Link from "next/link";
import { MaskIcon } from "@/components/MaskIcon";

interface QuickLink {
  label: string;
  icon: string;
  href?: string;
}

const LINKS: QuickLink[] = [
  { label: "Sifariş tarixçəsi", icon: "/icons/history-clock.svg", href: "/customer/orders" },
  { label: "Seçilən ünvanlarım", icon: "/icons/location-pin.svg" },
  { label: "Favori xidmətlərim", icon: "/icons/heart.svg" },
  { label: "Dəstək və yardım", icon: "/icons/headset.svg" },
  { label: "Parametrlər", icon: "/icons/gear.svg", href: "/customer/profile" },
];

function LinkContent({ icon, label, soon }: { icon: string; label: string; soon?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${soon ? "opacity-60" : ""}`}>
      <MaskIcon src={icon} className="h-5 w-5 text-primary" />
      <span className="text-center text-[11px] font-medium leading-tight text-ink">{label}</span>
    </div>
  );
}

export function QuickLinksRow() {
  return (
    <div className="mb-6 grid grid-cols-5 gap-1 rounded-2xl border border-gray-100 bg-white py-4">
      {LINKS.map((link) =>
        link.href ? (
          <Link key={link.label} href={link.href} className="flex justify-center">
            <LinkContent icon={link.icon} label={link.label} />
          </Link>
        ) : (
          <button
            key={link.label}
            type="button"
            onClick={() => alert(`${link.label} tezliklə əlçatan olacaq.`)}
            className="flex justify-center"
          >
            <LinkContent icon={link.icon} label={link.label} soon />
          </button>
        ),
      )}
    </div>
  );
}
