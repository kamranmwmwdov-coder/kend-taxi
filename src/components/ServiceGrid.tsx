"use client";

import Link from "next/link";
import { MaskIcon } from "@/components/MaskIcon";

interface ServiceItem {
  label: string;
  image: string;
  imageClassName?: string;
  cardBg: string;
  iconBg: string;
  href?: string;
}

const ROW_1: ServiceItem[] = [
  { label: "Bakı Reysi", image: "/illustrations/van-black.png", cardBg: "bg-amber-50", iconBg: "bg-amber-400", href: "/customer/baku-trip" },
  { label: "El yükü", image: "/illustrations/box-cargo.png", cardBg: "bg-violet-50", iconBg: "bg-violet-400", href: "/customer/cargo" },
  { label: "Rayondaxili taksi", image: "/illustrations/taxi-local.png", cardBg: "bg-sky-50", iconBg: "bg-sky-400", href: "/customer/local-trip" },
  { label: "İş elanları", image: "/illustrations/bag-briefcase.png", cardBg: "bg-emerald-50", iconBg: "bg-emerald-400" },
];

const ROW_2: ServiceItem[] = [
  { label: "Kirayə evlər", image: "/illustrations/house-rent.png", cardBg: "bg-green-50", iconBg: "bg-green-500" },
  { label: "Market", image: "/illustrations/basket-market-new.png", cardBg: "bg-lime-50", iconBg: "bg-lime-500" },
  { label: "Yemək sifarişi", image: "/illustrations/food-kebab.png", cardBg: "bg-orange-50", iconBg: "bg-orange-400" },
  { label: "Digər xidmətlər", image: "/icons/grid-dots.svg", imageClassName: "h-7 w-7 opacity-80", cardBg: "bg-gray-100", iconBg: "bg-gray-400" },
];

function ServiceCard({ item }: { item: ServiceItem }) {
  const content = (
    <div
      className={`relative flex h-full min-h-[112px] flex-col rounded-2xl p-2.5 ${item.cardBg} ${
        !item.href ? "opacity-90" : ""
      }`}
    >
      {!item.href && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-white/80 px-1.5 py-0.5 text-[8px] font-semibold leading-none text-ink-muted">
          Tezliklə
        </span>
      )}
      <span className="pr-8 text-[11px] font-bold leading-tight text-ink">{item.label}</span>
      <div className="flex flex-1 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt=""
          className={item.imageClassName ?? "h-12 w-12 object-contain drop-shadow-sm"}
        />
      </div>
      <div className="flex justify-end">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full ${item.iconBg}`}>
          <MaskIcon src="/icons/arrow-right.svg" className="h-2.5 w-2.5 text-white" />
        </span>
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
    <div className="mb-6 flex flex-col gap-2">
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
