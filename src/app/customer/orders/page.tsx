"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge, ORDER_TYPE_LABEL } from "@/components/StatusBadge";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/orders")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen px-6 py-8 max-w-sm mx-auto">
      <Link href="/customer/home" className="mb-6 inline-block text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-6">Sifariş Tarixçəm</h1>

      {loading && <p className="text-ink-muted">Yüklənir...</p>}

      {!loading && orders.length === 0 && (
        <p className="text-ink-muted text-center mt-12">Hələ heç bir sifarişiniz yoxdur.</p>
      )}

      <div className="flex flex-col gap-3">
        {orders.map((o) => {
          const isActive = ["NEW", "WAITING_DRIVER", "WAITING_CONFIRMATION", "ACTIVE"].includes(o.status);
          const typePath = o.orderType.toLowerCase() === "baku" ? "baku" : o.orderType.toLowerCase();
          const CardWrapper = isActive ? Link : "div";
          const wrapperProps = isActive ? { href: `/customer/orders/${typePath}/${o.id}` } : {};
          return (
            <CardWrapper key={`${o.orderType}-${o.id}`} {...(wrapperProps as any)} className="bg-white rounded-2xl p-4 border border-gray-100 block">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{ORDER_TYPE_LABEL[o.orderType]}</span>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-ink-muted text-xs mb-1">
                {new Date(o.created_at).toLocaleDateString("az-AZ")} · {new Date(o.created_at).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="font-bold text-primary">
                {o.orderType === "BAKU" ? o.total_price ?? o.price : o.price} AZN
              </p>
              {isActive && <p className="text-xs text-primary mt-1">Detallara bax →</p>}
            </CardWrapper>
          );
        })}
      </div>
    </main>
  );
}
