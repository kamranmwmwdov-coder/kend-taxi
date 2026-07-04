"use client";
import { useEffect, useState } from "react";

interface Stats {
  todayOrderCount: number;
  activeOrderCount: number;
  completedOrderCount: number;
  cancelledOrderCount: number;
  customerCount: number;
  driverCount: number;
  activeDriverCount: number;
  todayRevenue: number;
}

const CARDS: { key: keyof Stats; label: string; suffix?: string }[] = [
  { key: "todayOrderCount", label: "Bugünkü sifariş" },
  { key: "activeOrderCount", label: "Aktiv sifariş" },
  { key: "completedOrderCount", label: "Tamamlanmış" },
  { key: "cancelledOrderCount", label: "Ləğv olunmuş" },
  { key: "driverCount", label: "Sürücü sayı" },
  { key: "activeDriverCount", label: "Aktiv sürücü" },
  { key: "customerCount", label: "Müştəri sayı" },
  { key: "todayRevenue", label: "Bugünkü gəlir", suffix: " AZN" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setStats(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CARDS.map(({ key, label, suffix }) => (
            <div key={key} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-ink-muted text-xs mb-1">{label}</p>
              <p className="text-2xl font-bold text-ink">
                {stats[key]}
                {suffix ?? ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && !stats && (
        <p className="text-ink-muted">Statistika yüklənə bilmədi.</p>
      )}
    </div>
  );
}
