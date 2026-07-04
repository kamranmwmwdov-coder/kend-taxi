"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const TIME_LABEL = (iso: string) =>
  new Date(iso).toLocaleString("az-AZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function NotificationsList({ backHref }: { backHref: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/notifications");
    const json = await res.json();
    if (json.success) setItems(json.data.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch("/api/notifications/read", { method: "PUT", headers: { "Content-Type": "application/json" }, body: "{}" });
  }, []);

  return (
    <main className="min-h-screen px-6 py-8 max-w-sm mx-auto">
      <Link href={backHref} className="mb-6 inline-block text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-6">Bildirişlər</h1>

      {loading && <p className="text-ink-muted">Yüklənir...</p>}
      {!loading && items.length === 0 && <p className="text-ink-muted text-center mt-12">Bildiriş yoxdur.</p>}

      <div className="flex flex-col gap-3">
        {items.map((n) => (
          <div key={n.id} className={`rounded-2xl p-4 border ${n.is_read ? "bg-white border-gray-100" : "bg-primary/5 border-primary/20"}`}>
            <p className="font-semibold text-sm mb-1">{n.title}</p>
            <p className="text-sm text-ink-muted mb-1">{n.message}</p>
            <p className="text-xs text-ink-muted">{TIME_LABEL(n.created_at)}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
