import Link from "next/link";
import { User, Truck } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";
import { SplashScreen } from "@/components/SplashScreen";
import { getPublicSettings } from "@/modules/settings/settings.service";
import { getSession } from "@/utils/session";
import { redirect } from "next/navigation";

export default async function EntryPage() {
  const session = await getSession();
  if (session?.role === "CUSTOMER") redirect("/customer/home");
  if (session?.role === "DRIVER") redirect("/driver/home");
  if (session?.role === "ADMIN") redirect("/admin");

  const { appName } = await getPublicSettings();
  const initials = appName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen flex flex-col bg-surface-muted">
      <SplashScreen appName={appName} />
      <AdBanner />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>
          <h1 className="text-2xl font-bold text-ink">{appName}</h1>
          <p className="text-ink-muted text-sm mt-1">Tətbiq xidmət platformaları toplusudur</p>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3">
          <Link href="/customer/login" className="btn-primary flex items-center justify-center gap-2">
            <User size={20} /> Müştəri kimi davam et
          </Link>
          <Link
            href="/driver/login"
            className="w-full min-h-[52px] rounded-xl border border-gray-300 bg-white text-ink font-semibold flex items-center justify-center gap-2"
          >
            <Truck size={20} /> Sürücü kimi davam et
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-ink-muted pb-4">v0.1.0</p>
    </main>
  );
}
