import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/utils/session";
import { NotificationBell } from "@/components/NotificationBell";
import { SoundToggle } from "@/components/SoundToggle";
import { LogoutIconButton } from "@/components/LogoutIconButton";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { AdBanner } from "@/components/AdBanner";
import { PushPermissionButton } from "@/components/PushPermissionButton";
import { ServiceGrid } from "@/components/ServiceGrid";
import { QuickLinksRow } from "@/components/QuickLinksRow";
import { RecentOrdersPreview } from "@/components/RecentOrdersPreview";
import { SoonButton } from "@/components/SoonButton";
import { MaskIcon } from "@/components/MaskIcon";

export default async function CustomerHomePage() {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") redirect("/customer/login");

  const initial = session.firstName?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <main className="min-h-screen px-4 pt-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-ink-muted">Xoş gəlmisiniz,</p>
            <h1 className="truncate text-xl font-bold">{session.firstName} 👋</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 bg-white">
            <NotificationBell href="/customer/notifications" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 bg-white">
            <SoundToggle />
          </div>
          <LogoutIconButton />
        </div>
      </div>

      <PushPermissionButton />

      <div className="mb-4 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <AdBanner targetRole="CUSTOMER" />
      </div>

      <AnnouncementBanner />

      <ServiceGrid />

      <QuickLinksRow />

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Sifariş tarixçəsi</h2>
          <Link href="/customer/orders" className="flex items-center gap-0.5 text-sm font-semibold text-primary">
            Hamısına bax <MaskIcon src="/icons/chevron-right.svg" className="h-4 w-4 text-primary" />
          </Link>
        </div>
        <RecentOrdersPreview />
      </div>

      <div className="mb-8 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-4 text-white">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/gift-box.png" alt="" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Dostlarını dəvət et, bonus qazan!</p>
          <p className="text-xs text-white/80">Hər uğurlu dəvət üçün bonus əldə et</p>
        </div>
        <SoonButton
          message="Dəvət proqramı tezliklə əlçatan olacaq."
          className="shrink-0 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-primary"
        >
          Dəvət et
        </SoonButton>
      </div>
    </main>
  );
}
