import type { Metadata } from "next";
import "./globals.css";
import { OfflineBanner } from "@/components/OfflineBanner";
import { SoundNotificationProvider } from "@/components/SoundNotificationProvider";
import { PwaServiceWorker } from "@/components/PwaServiceWorker";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  icons: { icon: "/app-icon.svg", apple: "/app-icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Kend Taxi" },
  title: "Kənd Taxi",
  description: "Kənd və rayonlar üçün nəqliyyat platforması",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body className="min-h-screen">
        <OfflineBanner />
        <PwaServiceWorker />
        <SoundNotificationProvider />
        {children}
      </body>
    </html>
  );
}
