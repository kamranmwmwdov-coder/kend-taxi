import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/utils/session";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationBell } from "@/components/NotificationBell";
import { SoundToggle } from "@/components/SoundToggle";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { AdBanner } from "@/components/AdBanner";
import { PushPermissionButton } from "@/components/PushPermissionButton";
import { AnimatedNavCard } from "@/components/AnimatedNavCard";
import { Bus, Package, Car, History, User } from "lucide-react";

const CARDS = [
  { href: "/customer/baku-trip", icon: Bus, label: "Bakı Reysi", color: "bg-primary", image: "/images/baku-flame-towers.jpg" },
  { href: "/customer/cargo", icon: Package, label: "El Yükü", color: "bg-warning", image: "/images/cargo.jpg" },
  { href: "/customer/local-trip", icon: Car, label: "Rayon Daxili", color: "bg-success", image: "/images/local-trip.jpg" },
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
        <div className="flex items-center gap-1">
          <SoundToggle />
          <NotificationBell href="/customer/notifications" />
        </div>
      </div>

      <AnnouncementBanner />
      <PushPermissionButton />
      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <AdBanner targetRole="CUSTOMER" />
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        {CARDS.map(({ href, icon, label, color, image }) => (
          <AnimatedNavCard key={href} href={href} icon={icon} label={label} color={color} image={image} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/customer/orders" className="relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl p-4 border border-gray-100 bg-cover bg-center text-white" style={{ backgroundImage: "url(/images/orders.jpg)" }}>
          <span className="absolute inset-0 bg-black/50" aria-hidden="true" />
          <History size={20} className="relative z-10" />
          <span className="relative z-10 text-sm font-medium">Sifariş Tarixçəm</span>
        </Link>
        <Link href="/customer/profile" className="relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl p-4 border border-gray-100 bg-cover bg-center text-white" style={{ backgroundImage: "url(/images/profile.jpg)" }}>
          <span className="absolute inset-0 bg-black/50" aria-hidden="true" />
          <User size={20} className="relative z-10" />
          <span className="relative z-10 text-sm font-medium">Profilim</span>
        </Link>
      </div>

      <LogoutButton />
    </main>
  );
}
