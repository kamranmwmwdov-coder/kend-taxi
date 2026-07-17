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
  { label: "Bakı Reysi", image: "/illustrations/van-black.png", cardBg: "bg-primary/[0.08]", iconBg: "bg-primary", href: "/customer/baku-trip" },
  { label: "El yükü", image: "/illustrations/box-cargo.png", cardBg: "bg-primary/[0.14]", iconBg: "bg-primary-dark", href: "/customer/cargo" },
  { label: "Rayondaxili taksi", image: "/illustrations/taxi-local.png", cardBg: "bg-primary/[0.20]", iconBg: "bg-primary-light", href: "/customer/local-trip" },
  { label: "İş elanları", image: "/illustrations/bag-briefcase.png", cardBg: "bg-primary/[0.26]", iconBg: "bg-primary" },
];

const ROW_2: ServiceItem[] = [
  { label: "Kirayə evlər", image: "/illustrations/house-rent.png", cardBg: "bg-success/10", iconBg: "bg-success" },
  { label: "Market", image: "/illustrations/basket-market-new.png", cardBg: "bg-success/[0.18]", iconBg: "bg-success-dark" },
  { label: "Yemək sifarişi", image: "/illustrations/food-kebab.png", cardBg: "bg-warning/[0.14]", iconBg: "bg-warning" },
  { label: "Digər xidmətlər", image: "/icons/grid-dots.svg", imageClassName: "h-3.5 w-3.5 opacity-80", cardBg: "bg-ink/[0.06]", iconBg: "bg-ink-muted" },
];

function ServiceCard({ item }: { item: ServiceItem }) {
  const content = (
    <div
      className={`relative aspect-square w-full overflow-hidden rounded-2xl ${item.cardBg} ${
        !item.href ? "opacity-90" : ""
      }`}
    >
      {!item.href && (
        <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-white/80 px-1.5 py-0.5 text-[8px] font-semibold leading-none text-ink-muted">
          Tezliklə
        </span>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt=""
          className={item.imageClassName ?? "h-[72px] w-[72px] object-contain drop-shadow-sm"}
        />
      </div>
      <span className="absolute left-2 top-2 pr-1 text-[11px] font-bold leading-tight text-ink">
        {item.label}
      </span>
      <span className={`absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full ${item.iconBg}`}>
        <MaskIcon src="/icons/arrow-right.svg" className="h-2.5 w-2.5 text-white" />
      </span>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block w-full">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => alert(`${item.label} tezliklə əlçatan olacaq.`)}
      className="block w-full text-left"
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
