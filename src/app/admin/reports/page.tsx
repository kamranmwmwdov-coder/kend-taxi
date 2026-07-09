"use client";
import { useEffect, useState } from "react";
import { ORDER_TYPE_LABEL } from "@/components/StatusBadge";

interface DriverStat {
  driverId: string;
  name: string;
  phone: string;
  completed: number;
  cancelled: number;
  revenue: number;
}

interface ServiceStat {
  total: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export default function AdminReportsPage() {
  const [driverStats, setDriverStats] = useState<DriverStat[]>([]);
  const [serviceStats, setServiceStats] = useState<Record<string, ServiceStat> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setDriverStats(json.data.driverStats);
          setServiceStats(json.data.serviceStats);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ink-muted">Yüklənir...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Hesabatlar</h1>

      <section className="mb-8">
        <h2 className="font-semibold text-sm text-ink-muted uppercase tracking-wide mb-3">Xidmət üzrə</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {serviceStats &&
            Object.entries(serviceStats).map(([type, s]) => (
              <div key={type} className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="font-semibold mb-3">{ORDER_TYPE_LABEL[type]}</p>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between"><span className="text-ink-muted">Ümumi sifariş</span><span className="font-medium">{s.total}</span></p>
                  <p className="flex justify-between"><span className="text-ink-muted">Tamamlanmış</span><span className="font-medium">{s.completed}</span></p>
                  <p className="flex justify-between"><span className="text-ink-muted">Ləğv olunmuş</span><span className="font-medium">{s.cancelled}</span></p>
                  <p className="flex justify-between pt-2 border-t border-gray-100 mt-2">
                    <span className="text-ink-muted">Gəlir</span><span className="font-bold text-primary">{s.revenue} AZN</span>
                  </p>
                </div>
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-sm text-ink-muted uppercase tracking-wide mb-3">Sürücü üzrə</h2>
        {driverStats.length === 0 ? (
          <p className="text-ink-muted">Hələ sürücü yoxdur.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-muted border-b border-gray-100">
                  <th className="p-4">Sürücü</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Tamamlanmış</th>
                  <th className="p-4">Ləğv olunmuş</th>
                  <th className="p-4">Ümumi qazanc</th>
                </tr>
              </thead>
              <tbody>
                {driverStats.map((d) => (
                  <tr key={d.driverId} className="border-b border-gray-50 last:border-0">
                    <td className="p-4 font-medium">{d.name}</td>
                    <td className="p-4">{d.phone}</td>
                    <td className="p-4">{d.completed}</td>
                    <td className="p-4">{d.cancelled}</td>
                    <td className="p-4 font-semibold text-primary">{d.revenue} AZN</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
