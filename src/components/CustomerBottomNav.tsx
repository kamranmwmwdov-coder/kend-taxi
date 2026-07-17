"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, LayoutGrid, User, MoreHorizontal } from "lucide-react";

const HIDDEN_PREFIXES = ["/customer/login", "/customer/register"];

const TABS = [
  { href: "/customer/home", label: "Ana səhifə", icon: Home },
  { href: "/customer/orders", label: "Sifarişlər", icon: ClipboardList },
] as const;

const RIGHT_TABS = [
  { href: "/customer/profile", label: "Profilim", icon: User },
] as const;

export function CustomerBottomNav() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) return null;

  function isActive(href: string) {
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white">
      <div className="mx-auto flex max-w-sm items-center justify-between px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {TABS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-1 text-xs font-medium ${
              isActive(href) ? "text-primary" : "text-ink-muted"
            }`}
          >
            <Icon size={22} />
            {label}
          </Link>
        ))}

        <button
          type="button"
          onClick={() => alert("Bu xidmət tezliklə əlçatan olacaq.")}
          aria-label="Digər imkanlar (tezliklə)"
          className="mx-1 -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        >
          <LayoutGrid size={24} />
        </button>

        {RIGHT_TABS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-1 text-xs font-medium ${
              isActive(href) ? "text-primary" : "text-ink-muted"
            }`}
          >
            <Icon size={22} />
            {label}
          </Link>
        ))}

        <button
          type="button"
          onClick={() => alert("Bu bölmə tezliklə əlçatan olacaq.")}
          className="flex flex-1 flex-col items-center gap-1 py-1 text-xs font-medium text-ink-muted"
        >
          <MoreHorizontal size={22} />
          Daha çox
        </button>
      </div>
    </nav>
  );
}
