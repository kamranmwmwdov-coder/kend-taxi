import Link from "next/link";
import { History, MapPin, Heart, Headphones, Settings, type LucideIcon } from "lucide-react";

interface QuickLink {
  label: string;
  icon: LucideIcon;
  href?: string;
}

const LINKS: QuickLink[] = [
  { label: "Sifariş tarixçəsi", icon: History, href: "/customer/orders" },
  { label: "Seçilən ünvanlarım", icon: MapPin },
  { label: "Favori xidmətlərim", icon: Heart },
  { label: "Dəstək və yardım", icon: Headphones },
  { label: "Parametrlər", icon: Settings, href: "/customer/profile" },
];

function LinkContent({ icon: Icon, label, soon }: { icon: LucideIcon; label: string; soon?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${soon ? "opacity-60" : ""}`}>
      <Icon size={20} className="text-primary" />
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
