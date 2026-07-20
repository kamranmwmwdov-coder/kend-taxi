"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, Users, Car, Megaphone, FileText, Settings, LogOut, ClipboardList, Volume2, Briefcase, ChevronDown } from "lucide-react";

const MENU = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Sifarişlər", icon: ClipboardList },
  { href: "/admin/drivers", label: "Sürücülər", icon: Car },
  { href: "/admin/customers", label: "Müştərilər", icon: Users },
  { href: "/admin/ads", label: "Reklamlar", icon: Megaphone },
  { href: "/admin/announcements", label: "Elanlar", icon: Volume2 },
  { href: "/admin/reports", label: "Hesabatlar", icon: FileText },
  { href: "/admin/settings", label: "Parametrlər", icon: Settings },
];

const JOB_LISTINGS_SUBMENU = [
  { href: "/admin/job-listings/pending", label: "Gözləyən Elanlar" },
  { href: "/admin/job-listings/active", label: "Aktiv Elanlar" },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isJobListingsSection = pathname.startsWith("/admin/job-listings");
  const [jobListingsOpen, setJobListingsOpen] = useState(isJobListingsSection);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="w-64 shrink-0 bg-ink text-white min-h-screen p-4 hidden md:flex md:flex-col">
      <div className="mb-6 px-2">
        <p className="font-bold text-lg">başlayışqı.online</p>
        <p className="text-white/50 text-xs">Admin — {adminName}</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {MENU.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
            )}
          >
            <Icon size={18} /> {label}
          </Link>
        ))}

        <button
          type="button"
          onClick={() => setJobListingsOpen((o) => !o)}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isJobListingsSection ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
          )}
        >
          <Briefcase size={18} />
          <span className="flex-1 text-left">💼 İş Elanları</span>
          <ChevronDown size={16} className={clsx("transition-transform", jobListingsOpen && "rotate-180")} />
        </button>
        {jobListingsOpen && (
          <div className="flex flex-col gap-1 pl-9">
            {JOB_LISTINGS_SUBMENU.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === href ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5"
      >
        <LogOut size={18} /> Çıxış et
      </button>
    </aside>
  );
}
