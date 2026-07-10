import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/utils/session";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationBell } from "@/components/NotificationBell";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { AdBanner } from "@/components/AdBanner";
import { Bus, Package, Car, History, User } from "lucide-react";

const CARDS = [
  { href: "/customer/baku-trip", icon: Bus, label: "Bakı Reysi", color: "bg-primary" },
  { href: "/customer/cargo", icon: Package, label: "El Yükü", color: "bg-warning" },
  { href: "/customer/local-trip", icon: Car, label: "Rayon Daxili", color: "bg-success" },
];

export default async function CustomerHomePage() {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") redirect("/customer/login");

  return (
    <main className="min-h-screen p-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-ink-muted text-sm">Xoş gəldiniz,</p>
          <h1 className="text-xl font-bold">{session.firstName}</h1>
        </div>
        <NotificationBell href="/customer/notifications" />
      </div>

      <AnnouncementBanner />
      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <AdBanner targetRole="CUSTOMER" />
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        {CARDS.map(({ href, icon: Icon, label, color }) => {
          const image = href === "/customer/baku-trip" ? "/images/baku-flame-towers.jpg" : undefined;

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-4 overflow-hidden rounded-2xl p-5 border border-gray-100 shadow-sm active:scale-[0.99] transition-transform ${
                image ? "bg-cover bg-center text-white" : "bg-white"
              }`}
              style={image ? { backgroundImage: `url(${image})` } : undefined}
            >
              {image ? <span className="absolute inset-0 bg-black/50" aria-hidden="true" /> : null}
              <div className={`relative z-10 w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white`}>
                <Icon size={22} />
              </div>
              <span className={`relative z-10 font-semibold ${image ? "text-white" : "text-ink"}`}>{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/customer/orders" className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-gray-100">
          <History size={20} className="text-ink-muted" />
          <span className="text-sm font-medium">Sifariş Tarixçəm</span>
        </Link>
        <Link href="/customer/profile" className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-gray-100">
          <User size={20} className="text-ink-muted" />
          <span className="text-sm font-medium">Profilim</span>
        </Link>
      </div>

      <LogoutButton />
    </main>
  );
}
