import type { Metadata } from "next";
import "./globals.css";
import { OfflineBanner } from "@/components/OfflineBanner";
import { SoundNotificationProvider } from "@/components/SoundNotificationProvider";
import { NotificationToast } from "@/components/NotificationToast";
import { PwaServiceWorker } from "@/components/PwaServiceWorker";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "başlayışqı.online" },
  title: "başlayışqı.online",
  description: "Kənd və rayonlar üçün nəqliyyat platforması",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body className="min-h-screen">
        <OfflineBanner />
        <PwaServiceWorker />
        <SoundNotificationProvider />
        <NotificationToast />
        {children}
      </body>
    </html>
  );
}
