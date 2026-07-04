import type { Metadata } from "next";
import "./globals.css";
import { OfflineBanner } from "@/components/OfflineBanner";

export const metadata: Metadata = {
  title: "Kənd Taxi",
  description: "Kənd və rayonlar üçün nəqliyyat platforması",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body className="min-h-screen">
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}
