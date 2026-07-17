"use client";

import Link from "next/link";
import {
  Car,
  Truck,
  Briefcase,
  Home as HomeIcon,
  ShoppingBasket,
  UtensilsCrossed,
  LayoutGrid,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface ServiceItem {
  label: string;
  icon: LucideIcon;
  cardBg: string;
  iconBg: string;
  href?: string;
}

const ROW_1: ServiceItem[] = [
  { label: "Bakı Reysi", icon: Car, cardBg: "bg-amber-50", iconBg: "bg-amber-400", href: "/customer/baku-trip" },
  { label: "El yükü", icon: Truck, cardBg: "bg-violet-50", iconBg: "bg-violet-400", href: "/customer/cargo" },
  { label: "Rayondaxili taksi", icon: Car, cardBg: "bg-sky-50", iconBg: "bg-sky-400", href: "/customer/local-trip" },
  { label: "İş elanları", icon: Briefcase, cardBg: "bg-emerald-50", iconBg: "bg-emerald-400" },
];

const ROW_2: ServiceItem[] = [
  { label: "Kirayə evlər", icon: HomeIcon, cardBg: "bg-green-50", iconBg: "bg-green-500" },
  { label: "Market", icon: ShoppingBasket, cardBg: "bg-lime-50", iconBg: "bg-lime-500" },
  { label: "Yemək sifarişi", icon: UtensilsCrossed, cardBg: "bg-orange-50", iconBg: "bg-orange-400" },
  { label: "Digər xidmətlər", icon: LayoutGrid, cardBg: "bg-gray-100", iconBg: "bg-gray-400" },
];

function ServiceCard({ item }: { item: ServiceItem }) {
  const Icon = item.icon;
  const content = (
    <div className={`relative flex h-full min-h-[104px] flex-col justify-between rounded-2xl p-2 ${item.cardBg} ${!item.href ? "opacity-70" : ""}`}>
      {!item.href && (
        <span className="absolute right-1 top-1 rounded-full bg-white/80 px-1 py-0.5 text-[8px] font-semibold leading-none text-ink-muted">
          Tezliklə
        </span>
      )}
      <Icon size={20} className="text-ink/70" />
      <span className="text-[11px] font-semibold leading-tight">{item.label}</span>
      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${item.iconBg} text-white`}>
        <ArrowRight size={11} />
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block h-full">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => alert(`${item.label} tezliklə əlçatan olacaq.`)}
      className="block h-full w-full text-left"
    >
      {content}
    </button>
  );
}

export function ServiceGrid() {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {ROW_1.map((item) => (
          <ServiceCard key={item.label} item={item} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ROW_2.map((item) => (
          <ServiceCard key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}
