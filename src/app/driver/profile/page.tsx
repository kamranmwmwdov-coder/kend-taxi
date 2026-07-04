"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export default function DriverProfilePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/driver/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
      });
  }, []);

  if (!data) return <p className="p-6 text-ink-muted">Yüklənir...</p>;

  const { driver, earnings, completedCount } = data;

  return (
    <main className="min-h-screen px-6 py-8 max-w-sm mx-auto">
      <Link href="/driver/home" className="mb-6 inline-block text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-6">Profilim</h1>

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 mb-4">
        <Row label="Ad Soyad" value={`${driver.user.first_name} ${driver.user.last_name}`} />
        <Row label="Telefon" value={driver.user.phone} />
        <Row label="Avtomobil" value={`${driver.vehicle?.brand ?? "-"} ${driver.vehicle?.model ?? ""}`} />
        <Row label="Rəngi" value={driver.vehicle?.color ?? "-"} />
        <Row label="Dövlət nömrəsi" value={driver.vehicle?.plate_number ?? "-"} />
        <Row label="Qoşulduğu tarix" value={new Date(driver.created_at).toLocaleDateString("az-AZ")} />
      </div>

      <p className="text-xs text-ink-muted mb-6">
        Profil məlumatlarını yalnız Admin dəyişə bilər.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <p className="font-semibold text-sm mb-3">Qazanc</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-ink-muted">Bu gün</p>
            <p className="font-bold">{earnings.today} AZN</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Bu ay</p>
            <p className="font-bold">{earnings.month} AZN</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Bu il</p>
            <p className="font-bold">{earnings.year} AZN</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
          <span className="text-ink-muted">Tamamlanan sifariş</span>
          <span className="font-semibold">{completedCount}</span>
        </div>
      </div>

      <div className="mb-6">
        <ChangePasswordForm />
      </div>

      <LogoutButton />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-ink-muted text-sm">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
